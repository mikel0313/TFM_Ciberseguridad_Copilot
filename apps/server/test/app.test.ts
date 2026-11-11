import assert from "node:assert/strict";
import test from "node:test";

import request from "supertest";

import { createApp } from "../src/app.js";
import { loadConfig, type AppConfig } from "../src/config.js";
import {
  createOpenAiReplyGenerator,
  OpenAiUnavailableError,
  type OpenAiResponsesClient
} from "../src/openai.js";
import { issueDirectLineToken } from "../src/direct-line.js";

const config: AppConfig = {
  environment: "test",
  port: 4300,
  allowedOrigins: ["http://localhost:4200"],
  directLineSecret: "test-secret-kept-on-server",
  openAiModel: "gpt-6-astra",
  trustProxyHops: false
};

const openAiConfig: AppConfig = {
  ...config,
  directLineSecret: undefined,
  openAiApiKey: "test-openai-key-kept-on-server"
};

test("health informa el modo sin filtrar el secreto", async () => {
  const app = createApp(config, { log: () => undefined });
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "directline");
  assert.equal(JSON.stringify(response.body).includes(config.directLineSecret!), false);
  assert.equal(response.headers["x-powered-by"], undefined);
});

test("el token se emite solo a un origen permitido y nunca contiene el secreto", async () => {
  let issuerCalled = false;
  const app = createApp(config, {
    log: () => undefined,
    issueToken: async () => {
      issuerCalled = true;
      return { token: "temporary-direct-line-token-123456", expiresIn: 1_800, userId: "dl_test" };
    }
  });

  const response = await request(app)
    .post("/api/directline/token")
    .set("Origin", "http://localhost:4200")
    .send({});

  assert.equal(response.status, 200);
  assert.equal(issuerCalled, true);
  assert.equal(response.body.expiresIn, 1_800);
  assert.equal(JSON.stringify(response.body).includes(config.directLineSecret!), false);
  assert.match(response.headers["cache-control"], /no-store/);
});

test("un origen ajeno no puede solicitar un token", async () => {
  const app = createApp(config, {
    log: () => undefined,
    issueToken: async () => {
      throw new Error("No debería invocarse");
    }
  });

  const response = await request(app).post("/api/directline/token").set("Origin", "https://evil.example").send({});

  assert.equal(response.status, 403);
  assert.equal(response.body.error, "ORIGIN_NOT_ALLOWED");
});

test("sin configuración de Direct Line el BFF mantiene un fallback seguro", async () => {
  const app = createApp({ ...config, directLineSecret: undefined }, { log: () => undefined });
  const response = await request(app).post("/api/directline/token").set("Origin", "http://localhost:4200").send({});

  assert.equal(response.status, 503);
  assert.equal(response.body.error, "DIRECT_LINE_NOT_CONFIGURED");
});

test("el token incorpora la identidad efímera y los orígenes de confianza", async () => {
  let body: unknown;
  const token = await issueDirectLineToken(config, async (_input, init) => {
    body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ token: "temporary-direct-line-token-123456", expires_in: 1_800 }), { status: 200 });
  });

  assert.equal(token.expiresIn, 1_800);
  assert.match(token.userId, /^dl_[a-f0-9]{32}$/);
  assert.deepEqual(body, { user: { id: token.userId }, trustedOrigins: ["http://localhost:4200"] });
});

test("el canal OpenAI responde por el BFF sin enviar la clave al navegador", async () => {
  let receivedMessage = "";
  const app = createApp(openAiConfig, {
    log: () => undefined,
    generateChatReply: async (message) => {
      receivedMessage = message;
      return { text: "Respuesta de prueba segura.", model: openAiConfig.openAiModel };
    }
  });

  const response = await request(app)
    .post("/api/chat")
    .set("Origin", "http://localhost:4200")
    .send({ message: "¿Qué hago ante un correo sospechoso?" });

  assert.equal(response.status, 200);
  assert.equal(response.body.text, "Respuesta de prueba segura.");
  assert.equal(receivedMessage, "¿Qué hago ante un correo sospechoso?");
  assert.equal(JSON.stringify(response.body).includes(openAiConfig.openAiApiKey!), false);
  assert.match(response.headers["cache-control"], /no-store/);
});

test("OpenAI tiene prioridad sobre Direct Line cuando ambos canales están configurados", async () => {
  const app = createApp(
    { ...openAiConfig, directLineSecret: "another-direct-line-secret" },
    {
      log: () => undefined,
      generateChatReply: async () => ({ text: "ok", model: openAiConfig.openAiModel })
    }
  );

  const response = await request(app).get("/api/runtime");
  assert.equal(response.status, 200);
  assert.equal(response.body.mode, "openai");
});

test("la ruta de chat rechaza cuerpos inválidos antes de llamar al proveedor", async () => {
  let called = false;
  const app = createApp(openAiConfig, {
    log: () => undefined,
    generateChatReply: async () => {
      called = true;
      return { text: "No debería responder", model: openAiConfig.openAiModel };
    }
  });

  const response = await request(app).post("/api/chat").set("Origin", "http://localhost:4200").send({ message: "   " });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "INVALID_MESSAGE");
  assert.equal(called, false);
});

test("un origen ajeno no puede enviar consultas a OpenAI", async () => {
  let called = false;
  const app = createApp(openAiConfig, {
    log: () => undefined,
    generateChatReply: async () => {
      called = true;
      return { text: "No debería responder", model: openAiConfig.openAiModel };
    }
  });

  const response = await request(app)
    .post("/api/chat")
    .set("Origin", "https://evil.example")
    .send({ message: "Consulta no autorizada" });

  assert.equal(response.status, 403);
  assert.equal(response.body.error, "ORIGIN_NOT_ALLOWED");
  assert.equal(called, false);
});

test("sin clave de OpenAI el endpoint de chat falla de forma controlada", async () => {
  let called = false;
  const app = createApp(
    { ...config, directLineSecret: undefined, openAiApiKey: undefined },
    {
      log: () => undefined,
      generateChatReply: async () => {
        called = true;
        return { text: "No debería responder", model: config.openAiModel };
      }
    }
  );

  const response = await request(app)
    .post("/api/chat")
    .set("Origin", "http://localhost:4200")
    .send({ message: "Consulta de prueba" });

  assert.equal(response.status, 503);
  assert.equal(response.body.error, "OPENAI_NOT_CONFIGURED");
  assert.equal(called, false);
});

test("los errores del proveedor OpenAI se convierten en un 502 sin detalles sensibles", async () => {
  const app = createApp(openAiConfig, {
    log: () => undefined,
    generateChatReply: async () => {
      throw new OpenAiUnavailableError("detalle interno que no debe salir");
    }
  });

  const response = await request(app)
    .post("/api/chat")
    .set("Origin", "http://localhost:4200")
    .send({ message: "Consulta de prueba" });

  assert.equal(response.status, 502);
  assert.equal(response.body.error, "OPENAI_UNAVAILABLE");
  assert.equal(JSON.stringify(response.body).includes(openAiConfig.openAiApiKey!), false);
  assert.equal(JSON.stringify(response.body).includes("detalle interno"), false);
});

test("el adaptador de OpenAI usa Responses API y sanea la salida", async () => {
  let issuedRequest:
    | {
        model: string;
        instructions: string;
        input: string;
        max_output_tokens: number;
        store: boolean;
      }
    | undefined;
  const fakeClient: OpenAiResponsesClient = {
    responses: {
      create: async (request) => {
        issuedRequest = request;
        return { output_text: "  Contén el equipo y preserva evidencias.  " };
      }
    }
  };

  const generateReply = createOpenAiReplyGenerator(openAiConfig, fakeClient);
  const reply = await generateReply("Posible ransomware");

  assert.deepEqual(reply, { text: "Contén el equipo y preserva evidencias.", model: "gpt-6-astra" });
  assert.equal(issuedRequest?.model, "gpt-6-astra");
  assert.equal(issuedRequest?.input, "Posible ransomware");
  assert.equal(issuedRequest?.max_output_tokens, 600);
  assert.equal(issuedRequest?.store, false);
  assert.match(issuedRequest?.instructions ?? "", /CiberGuía/);
  assert.equal(JSON.stringify(issuedRequest).includes(openAiConfig.openAiApiKey!), false);
});

test("el adaptador de OpenAI no expone errores del SDK ni acepta salidas vacías", async () => {
  const errorClient: OpenAiResponsesClient = {
    responses: {
      create: async () => {
        throw new Error("provider error with test-openai-key-kept-on-server");
      }
    }
  };
  const emptyClient: OpenAiResponsesClient = {
    responses: {
      create: async () => ({ output_text: "  " })
    }
  };

  await assert.rejects(
    () => createOpenAiReplyGenerator(openAiConfig, errorClient)("Consulta"),
    (error: unknown) => error instanceof OpenAiUnavailableError && !error.message.includes(openAiConfig.openAiApiKey!)
  );
  await assert.rejects(
    () => createOpenAiReplyGenerator(openAiConfig, emptyClient)("Consulta"),
    (error: unknown) => error instanceof OpenAiUnavailableError
  );
});

test("producción exige orígenes explícitos HTTPS y un entorno conocido", () => {
  assert.throws(
    () => loadConfig({ NODE_ENV: "production", DIRECT_LINE_SECRET: "server-only-secret" }),
    /CLIENT_ORIGINS es obligatorio/
  );
  assert.throws(
    () => loadConfig({ NODE_ENV: "production", CLIENT_ORIGINS: "http://localhost:4200" }),
    /origen inválido/
  );
  assert.throws(() => loadConfig({ NODE_ENV: "staging" }), /NODE_ENV debe ser/);
  assert.throws(() => loadConfig({ OPENAI_MODEL: "invalid model name" }), /OPENAI_MODEL contiene/);

  const production = loadConfig({
    NODE_ENV: "production",
    CLIENT_ORIGINS: "https://asistente.example.edu",
    TRUST_PROXY_HOPS: "1"
  });
  assert.deepEqual(production.allowedOrigins, ["https://asistente.example.edu"]);
  assert.equal(production.openAiModel, "gpt-6-astra");
  assert.equal(production.trustProxyHops, 1);
});
