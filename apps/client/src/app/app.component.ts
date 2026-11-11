import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, ViewChild, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ApiService } from "./api.service";
import { WebChatService } from "./web-chat.service";

type ExperienceMode = "loading" | "directline" | "openai" | "demo";
type MessageAuthor = "assistant" | "user";

interface ConversationMessage {
  id: number;
  author: MessageAuthor;
  text: string;
  references?: string[];
}

@Component({
  selector: "app-root",
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css"
})
export class AppComponent implements AfterViewInit {
  @ViewChild("webchatHost") webchatHost?: ElementRef<HTMLElement>;

  readonly mode = signal<ExperienceMode>("loading");
  readonly statusText = signal("Comprobando la disponibilidad del canal…");
  readonly connectionDetail = signal("");
  readonly isSending = signal(false);

  draft = "";
  private nextMessageId = 3;
  private initializing = false;

  readonly examples = [
    "He recibido un correo sospechoso, ¿qué compruebo primero?",
    "¿Qué pasos debo seguir ante un posible ransomware?",
    "¿Cómo priorizo una alerta de inicio de sesión anómalo?"
  ];

  messages: ConversationMessage[] = [
    {
      id: 1,
      author: "assistant",
      text: "Hola. Soy CiberGuía, un prototipo de apoyo a la toma de decisiones. Puedo ayudarte a estructurar un análisis inicial, pero no sustituyo los procedimientos de respuesta a incidentes de tu organización.",
      references: ["NIST SP 800-61", "INCIBE · respuesta a incidentes"]
    },
    {
      id: 2,
      author: "assistant",
      text: "No compartas contraseñas, tokens, claves API ni datos personales. El prototipo puede operar en modo de demostración local o mediante un canal externo configurado por el servidor.",
      references: ["Privacidad por diseño"]
    }
  ];

  constructor(
    private readonly api: ApiService,
    private readonly webChat: WebChatService
  ) {}

  ngAfterViewInit(): void {
    void this.initializeChannel();
  }

  async retryConnection(): Promise<void> {
    if (this.initializing) return;
    this.mode.set("loading");
    this.statusText.set("Reintentando la conexión segura…");
    this.connectionDetail.set("");
    await this.initializeChannel();
  }

  async sendMessage(): Promise<void> {
    const question = this.draft.trim();
    if (!question || this.mode() === "directline" || this.mode() === "loading" || this.isSending()) return;

    this.messages = [...this.messages, { id: this.nextMessageId++, author: "user", text: question }];
    this.draft = "";

    if (this.mode() === "openai") {
      this.isSending.set(true);
      try {
        const reply = await this.api.sendChatMessage(question);
        this.messages = [...this.messages, { id: this.nextMessageId++, author: "assistant", text: reply.text }];
      } catch {
        this.messages = [
          ...this.messages,
          {
            id: this.nextMessageId++,
            author: "assistant",
            text: "No se pudo obtener una respuesta del canal de OpenAI. Comprueba la configuración del servidor y vuelve a intentarlo."
          }
        ];
      } finally {
        this.isSending.set(false);
      }
      return;
    }

    this.messages = [...this.messages, this.buildDemoAnswer(question)];
  }

  useExample(question: string): void {
    if (this.mode() === "directline" || this.mode() === "loading" || this.isSending()) {
      this.draft = "";
      return;
    }
    this.draft = question;
    void this.sendMessage();
  }

  scrollToSources(): void {
    document.getElementById("fuentes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  private async initializeChannel(): Promise<void> {
    if (this.initializing) return;
    this.initializing = true;

    try {
      const runtime = await this.api.getRuntime();
      if (runtime.mode === "demo") {
        this.enableDemo("El servidor está correctamente operativo, pero no hay una credencial externa configurada.");
        return;
      }

      if (runtime.mode === "openai") {
        this.mode.set("openai");
        this.statusText.set("Canal OpenAI configurado");
        this.connectionDetail.set(
          "La configuración de OpenAI está disponible en el BFF. La primera consulta comprobará el proveedor; la clave permanece solo en el servidor y no compartas datos sensibles."
        );
        return;
      }

      this.mode.set("directline");
      this.statusText.set("Solicitando un token temporal al BFF…");
      const host = await this.waitForChatHost();
      await this.webChat.render(host);
      this.statusText.set("Canal Direct Line conectado");
      this.connectionDetail.set("La sesión usa un token temporal; la clave de Direct Line permanece en el servidor.");
    } catch {
      this.enableDemo("No se pudo abrir el canal configurado. La demostración local sigue disponible.");
    } finally {
      this.initializing = false;
    }
  }

  private enableDemo(detail: string): void {
    this.mode.set("demo");
    this.statusText.set("Modo demostración activo");
    this.connectionDetail.set(detail);
  }

  private async waitForChatHost(): Promise<HTMLElement> {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const host = this.webchatHost?.nativeElement;
      if (host) return host;
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    throw new Error("No se pudo preparar el contenedor de conversación.");
  }

  private buildDemoAnswer(question: string): ConversationMessage {
    const normalized = question.toLocaleLowerCase("es-ES");
    let text: string;
    let references: string[];

    if (/phishing|correo|enlace|adjunto|sospech/.test(normalized)) {
      text = "Triage inicial\n1. No abras enlaces ni adjuntos y no introduzcas credenciales.\n2. Conserva el mensaje, su remitente y las cabeceras para preservar evidencia.\n3. Comprueba el dominio, la URL real y cualquier petición inusual mediante un canal alternativo.\n4. Repórtalo al equipo responsable siguiendo el procedimiento interno.\n\nSi ya se introdujeron credenciales, prioriza el cambio de contraseña, el cierre de sesiones y la revisión de accesos.";
      references = ["INCIBE · Phishing", "NIST SP 800-61r2 · análisis"];
    } else if (/ransom|cifrad|malware|rescate/.test(normalized)) {
      text = "Respuesta inicial ante posible ransomware\n1. Aísla el equipo de la red según el procedimiento aprobado, sin borrar evidencias.\n2. Registra hora, usuario, equipos afectados y síntomas observados.\n3. Activa el plan de respuesta y verifica si existen copias de seguridad íntegras.\n4. Contén credenciales privilegiadas y revisa la propagación antes de recuperar.\n\nLa prioridad es contener y preservar evidencia; evita tomar decisiones de pago o restauración fuera del plan de incidentes.";
      references = ["NIST SP 800-61r2 · contención", "ENISA · ransomware"];
    } else if (/inicio|sesión|cuenta|credencial|acceso/.test(normalized)) {
      text = "Para priorizar un inicio de sesión anómalo, correlaciona identidad, origen, hora, dispositivo, MFA, privilegios y actividad posterior. Si hay señales de compromiso, revoca sesiones, fuerza el restablecimiento de credenciales y limita permisos conforme al procedimiento. Distingue siempre entre una alerta, una hipótesis y una evidencia confirmada.";
      references = ["Microsoft Learn · protección de identidades", "NIST SP 800-61r2 · erradicación"];
    } else {
      text = "Puedo ayudarte a estructurar el caso. Empieza por separar hechos observables, impacto potencial, activos afectados y evidencia disponible. Después fija una prioridad, define una acción de contención reversible y documenta cada decisión para facilitar la trazabilidad.";
      references = ["NIST SP 800-61r2", "ENISA · gestión de incidentes"];
    }

    return { id: this.nextMessageId++, author: "assistant", text, references };
  }
}
