# CiberGuía · Aplicación demostrable del TFM

Monorepo con una interfaz Angular y un *backend for frontend* (BFF) Express para conectar el prototipo con OpenAI mediante Responses API o, de forma alternativa, con Microsoft Copilot Studio mediante Direct Line.

El diseño tiene tres experiencias explícitas:

- **Canal OpenAI**: si el BFF recibe `OPENAI_API_KEY`, Angular envía la consulta a `POST /api/chat`; la clave y la llamada a Responses API viven solo en Node.
- **Canal Copilot Studio**: si el BFF recibe `DIRECT_LINE_SECRET`, genera un token temporal de Direct Line y renderiza Microsoft Bot Framework Web Chat.
- **Modo demostración**: si no hay credencial externa, la interfaz sigue siendo navegable con respuestas locales, deterministas y rotuladas como simulación. No suplanta una conexión real ni envía la conversación fuera del navegador.

> `OPENAI_API_KEY` y `DIRECT_LINE_SECRET` no existen en el código Angular, en la configuración de compilación ni en `localStorage`. Solo se cargan como variables de entorno del BFF.

## Arquitectura

### Canal OpenAI

```text
Angular ── POST /api/chat ──► Express BFF ── Responses API por HTTPS ──► OpenAI
                                  │
                                  └── OPENAI_API_KEY y OPENAI_MODEL (solo servidor)
```

El BFF valida el origen y el cuerpo, limita las solicitudes y devuelve únicamente `{ text }`. La clave, la petición completa al proveedor y sus errores detallados no se envían al navegador ni se registran.

### Canal Direct Line (opcional)

```text
┌────────────────────┐     POST /api/directline/token      ┌──────────────────────┐
│ Angular (navegador)├────────────────────────────────────►│ Express BFF          │
│ Web Chat + token   │◄────────────────────────────────────┤ DIRECT_LINE_SECRET   │
└─────────┬──────────┘       token temporal (no secret)    └──────────┬───────────┘
          │                                                           │ HTTPS
          │ Direct Line con token temporal                            ▼
          └──────────────────────────────────────────────► Copilot Studio / Direct Line
```

El BFF crea un identificador de usuario efímero para cada token. El cliente no elige la identidad ni envía el secreto. El token se conserva únicamente en memoria durante la sesión del Web Chat.

## Requisitos

- Node.js 20.19 o superior (probado con Node 20).
- npm 10 o superior.
- Una clave de API de OpenAI y un modelo accesible para el canal OpenAI, o un agente publicado en Copilot Studio y un secreto Direct Line para esa alternativa.

## Arranque local

Desde esta carpeta:

```powershell
npm install
Copy-Item server\.env.example server\.env
npm run dev
```

Abre `http://localhost:4200`. El BFF queda disponible en `http://localhost:4300` y expone `GET /api/health`.

Sin editar `server/.env` se abrirá el **modo demostración**, que es el estado seguro por defecto. Para probar el canal OpenAI, añade la clave exclusivamente a `server/.env`:

```dotenv
OPENAI_API_KEY=pega_aqui_tu_clave_de_openai
# Opcional: por defecto se usa gpt-6-astra. Indica un modelo accesible para tu cuenta si hace falta.
# OPENAI_MODEL=gpt-6-astra
CLIENT_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

Después reinicia `npm run dev`. En la interfaz aparecerá «Canal OpenAI configurado» y los mensajes usarán `POST /api/chat`. Las consultas se procesan de forma independiente: este prototipo no persiste historial conversacional.

Para usar Direct Line en lugar de OpenAI, deja sin definir `OPENAI_API_KEY` y añade:

```dotenv
DIRECT_LINE_SECRET=valor_copiado_desde_el_canal_direct_line
```

Si se definen ambas credenciales, la interfaz selecciona OpenAI como canal principal; la ruta de Direct Line se conserva para pruebas o migración explícitas.

Nunca pegues una clave o secreto en `client/`, en una captura de pantalla, en una memoria pública ni en un repositorio.

## Scripts

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Arranca el BFF (4300) y Angular (4200) en paralelo. |
| `npm run build` | Compila BFF y cliente para producción. |
| `npm run test` | Ejecuta pruebas HTTP del BFF. |
| `npm run check` | Compila ambos paquetes y ejecuta las pruebas. |

Los ficheros finales del cliente se generan en `client/dist/ciber-guia/browser` y el BFF compilado en `server/dist`.

## Configuración del canal en Copilot Studio

1. Publica el agente y habilita el canal **Custom website / Direct Line** en Copilot Studio.
2. Copia un secreto de Direct Line (no un token de conversación) y guárdalo en el almacén de secretos o variable de entorno del servidor.
3. Configura `CLIENT_ORIGINS` con los orígenes web exactos. En producción utiliza solo URLs HTTPS, por ejemplo `https://asistente.universidad.example`.
4. En producción usa `NODE_ENV=production`, un `CLIENT_ORIGINS` HTTPS explícito y un BFF detrás de TLS. El proceso rechaza automáticamente entornos desconocidos, orígenes no HTTPS y orígenes implícitos en producción.
5. Si hay un proxy inverso bajo tu control, configura `TRUST_PROXY_HOPS` con su número exacto de saltos (por ejemplo `1`) y bloquea el acceso directo al puerto del BFF. Déjalo en `0` si no existe proxy.
6. En la publicación del cliente, enruta `/api/*` al BFF bajo el mismo origen o conserva una lista CORS estricta.

El Web Chat se descarga desde el CDN oficial de Bot Framework con una versión fijada (`4.19.2`), no con el alias mutable `latest`. Para un despliegue corporativo con una política CSP estricta, permite `https://cdn.botframework.com` en `script-src` y los dominios de Direct Line en `connect-src`; idealmente se debe fijar también una política de integridad o empaquetar y auditar la dependencia en el pipeline corporativo.

## Controles de seguridad implementados

| Control | Aplicación |
| --- | --- |
| Protección de credenciales | `OPENAI_API_KEY` y `DIRECT_LINE_SECRET` se leen solo en el proceso Node; ninguna ruta los devuelve ni registra. |
| Consulta OpenAI | `POST /api/chat` valida una consulta de 1 a 1200 caracteres, llama a Responses API desde el BFF con `store: false` y devuelve únicamente el texto saneado. |
| Credenciales efímeras | `POST /api/directline/token` solicita a Direct Line un token de duración limitada; el navegador recibe el token, no el secreto. |
| Origen limitado | CORS restrictivo y verificación explícita del encabezado `Origin` antes de emitir un token o consulta; los mismos `CLIENT_ORIGINS` se incorporan como `trustedOrigins` en el token Direct Line. |
| Abuso | Límite de 12 emisiones de token y 20 consultas por IP cada 15 minutos; cuerpo JSON limitado a 8 KB. |
| Proxy | Por defecto no se confía en `X-Forwarded-For`; si se usa proxy se declara un número exacto de saltos de confianza. |
| Cabeceras | `helmet`, eliminación de `X-Powered-By`, `Cache-Control: no-store` para token, chat y estado de ejecución. |
| Trazabilidad prudente | Identificador de petición y metadatos de ruta/estado; no se registran cuerpos, cabeceras de autorización ni tokens. |
| Fallo seguro | Si el BFF no tiene credencial o el proveedor falla, devuelve un error controlado; la UI conserva el modo demostración cuando no hay canal configurado. |

### Límite importante de este prototipo

La restricción de origen y el *rate limit* reducen exposición, pero no sustituyen autenticación y autorización de usuarios: un cliente no navegador puede falsificar un encabezado `Origin`. Antes de operar con información real o restringida debe añadirse un proveedor de identidad (por ejemplo Microsoft Entra ID), derivar el `userId` de la sesión autenticada y aplicar autorización por rol, límite por usuario+IP, auditoría centralizada y protección frente a abuso distribuido. No introduzcas datos sensibles en la demostración.

## Pruebas incluidas

Las pruebas del BFF verifican, con dobles de prueba y sin hacer llamadas de red a OpenAI, que:

1. `/api/health` no filtra credenciales.
2. El token solo se emite a un origen permitido.
3. Un origen no permitido recibe `403` y no llega al emisor de token.
4. El token incorpora una identidad `dl_` no adivinable y los `trustedOrigins` configurados.
5. La ausencia de configuración Direct Line produce un `503` controlado.
6. `POST /api/chat` valida la entrada, respeta el origen autorizado y no expone la clave.
7. La ausencia de `OPENAI_API_KEY` devuelve un `503` controlado y un error de proveedor se traduce en `502` sin detalles internos.
8. El adaptador usa Responses API con instrucciones de alcance, salida saneada y `store: false`.

Ejecuta `npm run test` después de instalar dependencias. `npm run check` es la comprobación recomendada antes de una demostración. Una llamada real a OpenAI es una comprobación manual posterior: requiere una clave válida en `server/.env` y no forma parte de la batería automatizada.

## Estructura

```text
apps/
├── client/                    # Angular standalone y UI de demostración
│   └── src/app/
│       ├── api.service.ts      # Contrato con el BFF; no contiene secretos
│       └── web-chat.service.ts # Carga Web Chat y usa el token temporal
├── server/                    # Express BFF
│   ├── src/direct-line.ts      # Único punto que usa DIRECT_LINE_SECRET
│   ├── src/openai.ts           # Adaptador de Responses API; usa OPENAI_API_KEY solo en Node
│   ├── src/app.ts              # CORS, rate limit, cabeceras y rutas
│   └── test/app.test.ts
└── package.json                # Workspaces y comandos de raíz
```

## Evidencia para la defensa

Para demostrar el flujo sin revelar credenciales:

1. Muestra `GET /api/health` en modo demo y la etiqueta visible «Modo demostración activo».
2. Con `OPENAI_API_KEY` cargada solo en el entorno del BFF, muestra «Canal OpenAI configurado» y realiza una consulta no sensible.
3. En las herramientas de desarrollo, verifica que el cliente solicita `/api/chat` pero que ningún archivo JavaScript contiene `OPENAI_API_KEY`.
4. Si se demuestra Direct Line, verifica de forma análoga que solo se solicita `/api/directline/token` y que `DIRECT_LINE_SECRET` no aparece en el cliente.
5. Presenta los resultados de `npm run check` y el límite de alcance incluido en la interfaz.
