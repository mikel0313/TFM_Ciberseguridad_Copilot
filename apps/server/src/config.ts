export interface AppConfig {
  environment: "development" | "test" | "production";
  port: number;
  allowedOrigins: string[];
  directLineSecret?: string;
  openAiApiKey?: string;
  openAiModel: string;
  trustProxyHops: false | number;
}

const developmentOrigins = ["http://localhost:4200", "http://127.0.0.1:4200"];
const defaultOpenAiModel = "gpt-6-astra";

function readPort(value: string | undefined): number {
  if (!value) return 4300;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un puerto TCP válido.");
  }
  return port;
}

function readEnvironment(value: string | undefined): AppConfig["environment"] {
  const environment = value?.trim() || "development";
  if (environment === "development" || environment === "test" || environment === "production") return environment;
  throw new Error("NODE_ENV debe ser development, test o production.");
}

function readOrigins(value: string | undefined, environment: AppConfig["environment"]): string[] {
  if (!value && environment === "production") {
    throw new Error("CLIENT_ORIGINS es obligatorio en producción.");
  }

  const origins = (value ?? developmentOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error("CLIENT_ORIGINS debe contener al menos un origen permitido.");
  }

  for (const origin of origins) {
    try {
      const url = new URL(origin);
      if (url.origin !== origin || !["http:", "https:"].includes(url.protocol)) {
        throw new Error();
      }
      if (environment === "production" && url.protocol !== "https:") {
        throw new Error();
      }
    } catch {
      throw new Error(`CLIENT_ORIGINS contiene un origen inválido: ${origin}`);
    }
  }

  return [...new Set(origins)];
}

function readTrustProxyHops(value: string | undefined): false | number {
  if (!value || value === "0") return false;
  const hops = Number(value);
  if (!Number.isInteger(hops) || hops < 1 || hops > 10) {
    throw new Error("TRUST_PROXY_HOPS debe ser un entero entre 0 y 10.");
  }
  return hops;
}

function readOpenAiModel(value: string | undefined): string {
  const model = value?.trim() || defaultOpenAiModel;
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(model)) {
    throw new Error("OPENAI_MODEL contiene un identificador de modelo inválido.");
  }
  return model;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const environment = readEnvironment(env.NODE_ENV);
  const directLineSecret = env.DIRECT_LINE_SECRET?.trim() || undefined;
  const openAiApiKey = env.OPENAI_API_KEY?.trim() || undefined;

  return {
    environment,
    port: readPort(env.PORT),
    allowedOrigins: readOrigins(env.CLIENT_ORIGINS, environment),
    directLineSecret,
    openAiApiKey,
    openAiModel: readOpenAiModel(env.OPENAI_MODEL),
    trustProxyHops: readTrustProxyHops(env.TRUST_PROXY_HOPS)
  };
}
