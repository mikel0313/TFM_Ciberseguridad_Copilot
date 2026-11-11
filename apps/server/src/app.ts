import { randomUUID } from "node:crypto";

import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import type { AppConfig } from "./config.js";
import { DirectLineUnavailableError, issueDirectLineToken, type DirectLineToken } from "./direct-line.js";
import { createOpenAiReplyGenerator, OpenAiUnavailableError, type ChatReplyGenerator } from "./openai.js";

type TokenIssuer = (config: AppConfig) => Promise<DirectLineToken>;
type RuntimeMode = "openai" | "directline" | "demo";

interface AppDependencies {
  issueToken?: TokenIssuer;
  generateChatReply?: ChatReplyGenerator;
  log?: (line: string) => void;
}

const maxChatMessageLength = 1_200;

function getRuntimeMode(config: AppConfig): RuntimeMode {
  // OpenAI tiene prioridad explícita para que añadir la nueva clave active el
  // canal solicitado sin tener que retirar una configuración Direct Line previa.
  if (config.openAiApiKey) return "openai";
  if (config.directLineSecret) return "directline";
  return "demo";
}

function hasAllowedOrigin(req: Request, config: AppConfig): boolean {
  const origin = req.get("origin");
  return Boolean(origin && config.allowedOrigins.includes(origin));
}

function readChatMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return undefined;
  const message = (body as { message?: unknown }).message;
  if (typeof message !== "string") return undefined;

  const normalized = message.trim();
  if (!normalized || normalized.length > maxChatMessageLength) return undefined;
  return normalized;
}

function requireAllowedOrigin(config: AppConfig) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!hasAllowedOrigin(req, config)) {
      res.status(403).json({ error: "ORIGIN_NOT_ALLOWED", message: "El origen de la solicitud no está autorizado." });
      return;
    }
    next();
  };
}

export function createApp(config: AppConfig, dependencies: AppDependencies = {}) {
  const app = express();
  const issueToken = dependencies.issueToken ?? issueDirectLineToken;
  const generateChatReply =
    dependencies.generateChatReply ?? (config.openAiApiKey ? createOpenAiReplyGenerator(config) : undefined);
  const log = dependencies.log ?? ((line: string) => console.info(line));

  // Solo se confía en un número explícito de saltos; el proxy debe bloquear acceso directo al BFF.
  app.set("trust proxy", config.trustProxyHops);
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use(express.json({ limit: "8kb", type: "application/json" }));
  app.use(
    cors({
      origin(origin, callback) {
        // Las peticiones sin Origin solo pueden alcanzar rutas públicas como /health.
        callback(null, !origin || config.allowedOrigins.includes(origin));
      },
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      maxAge: 600
    })
  );

  app.use((req, res, next) => {
    const requestId = randomUUID();
    const startedAt = performance.now();
    res.setHeader("X-Request-Id", requestId);
    res.on("finish", () => {
      // No se registran cuerpos, cabeceras Authorization ni tokens.
      log(
        JSON.stringify({
          requestId,
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: Math.round(performance.now() - startedAt)
        })
      );
    });
    next();
  });

  const tokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 12,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "RATE_LIMITED",
      message: "Demasiadas solicitudes de token. Inténtalo de nuevo en unos minutos."
    }
  });

  const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "RATE_LIMITED",
      message: "Demasiadas consultas. Inténtalo de nuevo en unos minutos."
    }
  });

  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      mode: getRuntimeMode(config),
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/runtime", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ mode: getRuntimeMode(config) });
  });

  app.post("/api/chat", requireAllowedOrigin(config), chatLimiter, async (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const message = readChatMessage(req.body);

    if (!message) {
      res.status(400).json({
        error: "INVALID_MESSAGE",
        message: "La consulta debe contener entre 1 y 1200 caracteres."
      });
      return;
    }

    if (!config.openAiApiKey || !generateChatReply) {
      res.status(503).json({
        error: "OPENAI_NOT_CONFIGURED",
        message: "El canal de OpenAI no está configurado. Usa el modo de demostración."
      });
      return;
    }

    try {
      const reply = await generateChatReply(message);
      res.status(200).json({ text: reply.text });
    } catch (error) {
      if (error instanceof OpenAiUnavailableError) {
        res.status(502).json({ error: "OPENAI_UNAVAILABLE", message: "No se pudo obtener una respuesta del asistente." });
        return;
      }
      next(error);
    }
  });

  app.post("/api/directline/token", requireAllowedOrigin(config), tokenLimiter, async (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");

    if (!config.directLineSecret) {
      res.status(503).json({
        error: "DIRECT_LINE_NOT_CONFIGURED",
        message: "El canal de producción no está configurado. Usa el modo de demostración."
      });
      return;
    }

    try {
      const token = await issueToken(config);
      // Token de Direct Line de vida limitada; el secreto jamás abandona el BFF.
      res.status(200).json(token);
    } catch (error) {
      if (error instanceof DirectLineUnavailableError) {
        res.status(502).json({ error: "DIRECT_LINE_UNAVAILABLE", message: "No se pudo iniciar el canal del asistente." });
        return;
      }
      next(error);
    }
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "NOT_FOUND", message: "Ruta no encontrada." });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Los detalles se conservan en el servidor; el cliente recibe un error genérico.
    console.error("Unhandled BFF error", error);
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Error inesperado del servicio." });
  });

  return app;
}
