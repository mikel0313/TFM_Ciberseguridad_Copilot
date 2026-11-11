import { Injectable } from "@angular/core";

import { ApiService } from "./api.service";

declare global {
  interface Window {
    WebChat?: WebChatRuntime;
  }
}

interface WebChatRuntime {
  createDirectLine(options: { token: string }): unknown;
  renderWebChat(options: WebChatOptions, host: HTMLElement): void;
}

interface WebChatOptions {
  directLine: unknown;
  userID: string;
  locale: string;
  sendTypingIndicator: boolean;
  styleOptions: Record<string, string | number | boolean>;
}

const WEB_CHAT_SCRIPT_ID = "botframework-webchat-runtime";
// Versión fijada: no se usa el alias mutable "latest" en un flujo de seguridad.
const WEB_CHAT_SCRIPT_URL = "https://cdn.botframework.com/botframework-webchat/4.19.2/webchat.js";

@Injectable({ providedIn: "root" })
export class WebChatService {
  private runtimePromise?: Promise<WebChatRuntime>;

  constructor(private readonly api: ApiService) {}

  async render(host: HTMLElement): Promise<void> {
    const [webChat, token] = await Promise.all([this.loadRuntime(), this.api.getChannelToken()]);

    // El token solo permanece en memoria del navegador. No se conserva en localStorage ni en logs.
    host.replaceChildren();
    webChat.renderWebChat(
      {
        directLine: webChat.createDirectLine({ token: token.token }),
        userID: token.userId,
        locale: "es-ES",
        sendTypingIndicator: true,
        styleOptions: {
          accent: "#47d7ac",
          backgroundColor: "#ffffff",
          bubbleBackground: "#eaf9f4",
          bubbleBorderRadius: 14,
          bubbleFromUserBackground: "#0b3858",
          bubbleFromUserTextColor: "#ffffff",
          bubbleTextColor: "#102a43",
          hideUploadButton: true,
          sendBoxBackground: "#f8fbfd",
          sendBoxBorderTop: "1px solid #d7e3ed",
          sendBoxTextColor: "#102a43"
        }
      },
      host
    );
  }

  private loadRuntime(): Promise<WebChatRuntime> {
    if (window.WebChat) return Promise.resolve(window.WebChat);
    if (this.runtimePromise) return this.runtimePromise;

    const pendingRuntime = new Promise<WebChatRuntime>((resolve, reject) => {
      const existing = document.getElementById(WEB_CHAT_SCRIPT_ID) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => (window.WebChat ? resolve(window.WebChat) : reject(new Error("Web Chat no se inicializó."))), { once: true });
        existing.addEventListener("error", () => reject(new Error("No se pudo cargar Web Chat.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = WEB_CHAT_SCRIPT_ID;
      script.src = WEB_CHAT_SCRIPT_URL;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.onload = () => (window.WebChat ? resolve(window.WebChat) : reject(new Error("Web Chat no se inicializó.")));
      script.onerror = () => reject(new Error("No se pudo cargar el componente de conversación."));
      document.head.appendChild(script);
    });

    this.runtimePromise = pendingRuntime;
    return pendingRuntime.catch((error: unknown) => {
      // Permite que «Reintentar canal seguro» recupere un fallo transitorio de red/CDN.
      if (this.runtimePromise === pendingRuntime) {
        this.runtimePromise = undefined;
        document.getElementById(WEB_CHAT_SCRIPT_ID)?.remove();
      }
      throw error;
    });
  }
}
