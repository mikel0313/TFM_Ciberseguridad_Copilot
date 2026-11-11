import { Injectable } from "@angular/core";

export type RuntimeMode = "openai" | "directline" | "demo";

export interface RuntimeInfo {
  mode: RuntimeMode;
}

export interface ChannelToken {
  token: string;
  expiresIn: number;
  userId: string;
}

export interface ChatReply {
  text: string;
}

export class ApiError extends Error {
  constructor(message: string, readonly code: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

@Injectable({ providedIn: "root" })
export class ApiService {
  async getRuntime(): Promise<RuntimeInfo> {
    const response = await fetch("/api/runtime", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new ApiError("No se pudo consultar el estado del servicio.", "RUNTIME_UNAVAILABLE", response.status);

    const data: unknown = await response.json();
    if (!isRuntimeInfo(data)) throw new ApiError("Respuesta de estado no válida.", "INVALID_RESPONSE", response.status);
    return data;
  }

  async getChannelToken(): Promise<ChannelToken> {
    const response = await fetch("/api/directline/token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
      credentials: "same-origin"
    });

    const data: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const message = isApiProblem(data) ? data.message : "No se pudo abrir el canal del asistente.";
      const code = isApiProblem(data) ? data.error : "TOKEN_UNAVAILABLE";
      throw new ApiError(message, code, response.status);
    }
    if (!isChannelToken(data)) throw new ApiError("Respuesta de token no válida.", "INVALID_RESPONSE", response.status);
    return data;
  }

  async sendChatMessage(message: string): Promise<ChatReply> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
      credentials: "same-origin"
    });

    const data: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const errorMessage = isApiProblem(data) ? data.message : "No se pudo obtener una respuesta del asistente.";
      const code = isApiProblem(data) ? data.error : "CHAT_UNAVAILABLE";
      throw new ApiError(errorMessage, code, response.status);
    }
    if (!isChatReply(data)) throw new ApiError("Respuesta del asistente no válida.", "INVALID_RESPONSE", response.status);
    return data;
  }
}

function isRuntimeInfo(value: unknown): value is RuntimeInfo {
  return typeof value === "object" && value !== null && (value as RuntimeInfo).mode !== undefined && ["openai", "directline", "demo"].includes((value as RuntimeInfo).mode);
}

function isChannelToken(value: unknown): value is ChannelToken {
  if (typeof value !== "object" || value === null) return false;
  const token = value as ChannelToken;
  return typeof token.token === "string" && token.token.length > 20 && Number.isFinite(token.expiresIn) && typeof token.userId === "string";
}

function isApiProblem(value: unknown): value is { error: string; message: string } {
  if (typeof value !== "object" || value === null) return false;
  const problem = value as { error?: unknown; message?: unknown };
  return typeof problem.error === "string" && typeof problem.message === "string";
}

function isChatReply(value: unknown): value is ChatReply {
  if (typeof value !== "object" || value === null) return false;
  const reply = value as { text?: unknown };
  return typeof reply.text === "string" && reply.text.trim().length > 0;
}
