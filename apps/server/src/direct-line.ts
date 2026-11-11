import { randomUUID } from "node:crypto";

import type { AppConfig } from "./config.js";

const DIRECT_LINE_TOKEN_URL = "https://directline.botframework.com/v3/directline/tokens/generate";

export interface DirectLineToken {
  token: string;
  expiresIn: number;
  userId: string;
}

interface DirectLineResponse {
  token?: unknown;
  expires_in?: unknown;
}

export class DirectLineUnavailableError extends Error {
  constructor(message = "No se pudo crear el token temporal de Direct Line.") {
    super(message);
    this.name = "DirectLineUnavailableError";
  }
}

function createUserId(): string {
  // La identidad es efímera y la genera el servidor: el cliente no puede escoger otra.
  return `dl_${randomUUID().replaceAll("-", "")}`;
}

export async function issueDirectLineToken(config: AppConfig, fetchImpl: typeof fetch = fetch): Promise<DirectLineToken> {
  if (!config.directLineSecret) {
    throw new DirectLineUnavailableError("Direct Line no está configurado en este entorno.");
  }

  const userId = createUserId();
  let response: Response;

  try {
    response = await fetchImpl(DIRECT_LINE_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.directLineSecret}`,
        "Content-Type": "application/json"
      },
      // Direct Line incorpora los orígenes permitidos dentro del propio token.
      // Deben coincidir con los configurados en el canal de Azure/Copilot Studio.
      body: JSON.stringify({ user: { id: userId }, trustedOrigins: config.allowedOrigins }),
      redirect: "error",
      signal: AbortSignal.timeout(8_000)
    });
  } catch {
    throw new DirectLineUnavailableError();
  }

  if (!response.ok) {
    throw new DirectLineUnavailableError();
  }

  let body: DirectLineResponse;
  try {
    body = (await response.json()) as DirectLineResponse;
  } catch {
    throw new DirectLineUnavailableError();
  }

  if (typeof body.token !== "string" || body.token.length < 20 || typeof body.expires_in !== "number") {
    throw new DirectLineUnavailableError();
  }

  return { token: body.token, expiresIn: body.expires_in, userId };
}
