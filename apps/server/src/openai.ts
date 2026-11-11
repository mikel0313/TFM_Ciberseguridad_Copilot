import OpenAI from "openai";

import type { AppConfig } from "./config.js";

const CIBERGUIA_INSTRUCTIONS = [
  "Eres CiberGuía, un asistente en español para orientación defensiva de ciberseguridad.",
  "Ayuda con concienciación, triaje inicial, contención reversible, preservación de evidencias y escalado.",
  "Distingue hechos, hipótesis y recomendaciones; pide contexto cuando sea necesario.",
  "No solicites ni repitas contraseñas, tokens, claves API ni otros secretos.",
  "No facilites intrusión, evasión, malware, robo de credenciales ni acciones dañinas.",
  "Recuerda que la respuesta no sustituye los procedimientos de respuesta a incidentes de la organización."
].join(" ");

interface OpenAiResponse {
  output_text?: unknown;
}

export interface OpenAiResponsesClient {
  responses: {
    create(request: {
      model: string;
      instructions: string;
      input: string;
      max_output_tokens: number;
      store: boolean;
    }): Promise<OpenAiResponse>;
  };
}

export interface ChatReply {
  text: string;
  model: string;
}

export type ChatReplyGenerator = (message: string) => Promise<ChatReply>;

export class OpenAiUnavailableError extends Error {
  constructor(message = "No se pudo obtener una respuesta del servicio de IA.") {
    super(message);
    this.name = "OpenAiUnavailableError";
  }
}

/**
 * Crea el adaptador del proveedor. La clave se mantiene en este proceso y nunca
 * forma parte del contrato HTTP que consume Angular.
 */
export function createOpenAiReplyGenerator(config: AppConfig, suppliedClient?: OpenAiResponsesClient): ChatReplyGenerator {
  if (!config.openAiApiKey) {
    throw new OpenAiUnavailableError("OpenAI no está configurado en este entorno.");
  }

  const client =
    suppliedClient ??
    new OpenAI({
      apiKey: config.openAiApiKey,
      timeout: 15_000,
      maxRetries: 0
    });

  return async (message: string): Promise<ChatReply> => {
    let response: OpenAiResponse;

    try {
      response = await client.responses.create({
        model: config.openAiModel,
        instructions: CIBERGUIA_INSTRUCTIONS,
        input: message,
        max_output_tokens: 600,
        store: false
      });
    } catch {
      // No se propagan detalles del proveedor ni de la configuración al cliente.
      throw new OpenAiUnavailableError();
    }

    const text = typeof response.output_text === "string" ? response.output_text.trim() : "";
    if (!text) {
      throw new OpenAiUnavailableError("El servicio de IA no devolvió una respuesta utilizable.");
    }

    return { text, model: config.openAiModel };
  };
}
