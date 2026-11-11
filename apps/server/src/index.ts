import "dotenv/config";

import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = createApp(config);
const runtime = config.openAiApiKey ? "OpenAI (" + config.openAiModel + ")" : config.directLineSecret ? "Direct Line" : "demo";

const server = app.listen(config.port, () => {
  console.info("BFF listo en http://localhost:" + config.port + " (" + runtime + ")");
});

function shutdown(signal: string): void {
  console.info(`Recibida señal ${signal}; cerrando BFF.`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
