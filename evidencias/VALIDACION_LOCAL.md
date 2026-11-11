# Validación local de la entrega

Fecha de ejecución: 18 de octubre de 2026.

## Memoria

- Se generó `memoria/TFM_Mikel_Alvarez_Barroso.tex` desde las fuentes modulares mediante `node scripts/build-standalone-memory.mjs`.
- La fuente autónoma se compiló correctamente con el compilador LaTeX de escritorio.
- El PDF resultante tiene 69 páginas en A4.
- Se renderizaron y revisaron visualmente la portada, índice, tabla de alcance, diagrama de arquitectura, configuración del agente, conjunto de pruebas, bibliografía y apéndice final.

## Aplicación

Se ejecutaron en `apps/` las comprobaciones siguientes:

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Correcto: BFF y cliente Angular compilados. |
| `npm run test` | Correcto: 6 de 6 pruebas HTTP del BFF superadas. |
| `npm audit --omit=dev --audit-level=high` | Correcto: 0 vulnerabilidades de severidad alta o crítica reportadas. |
| Exploración del cliente para `DIRECT_LINE_SECRET` | Correcto: 0 coincidencias en el código cliente. |
| Demostración local | Correcta: la interfaz mostró «Modo demostración activo» y una respuesta de triaje no destructiva para un correo sospechoso. |

Las pruebas del BFF cubren salud sin filtración de secretos, emisión solo desde orígenes permitidos, rechazo de orígenes no permitidos, identidad y orígenes de confianza efímeros, ausencia segura de Direct Line y requisitos de producción.

## Paquete del agente

- 8 temas documentados y versionados.
- 72 casos sintéticos de evaluación con identificadores únicos.
- Esquema JSON de los casos validado localmente.
- No se almacenan secretos ni transcripciones reales en el paquete.

## Límite de la validación

No se ha utilizado una cuenta de UAX ni un tenant de Copilot Studio. En consecuencia, estas evidencias demuestran la calidad de la memoria, el paquete de configuración y la aplicación local, pero no sustituyen la validación de respuestas de un agente publicado. Antes de publicar, el propietario autorizado debe crear el agente en el tenant, cargar solo fuentes aprobadas, ejecutar el conjunto sintético, documentar resultados y realizar una revisión humana de seguridad y privacidad.

## Revalidación de OpenAI

Fecha de ejecución: 11 de noviembre de 2026.

| Comprobación | Resultado |
| --- | --- |
| `npm run build:server` | Correcto: BFF TypeScript compilado con el adaptador OpenAI. |
| `npm run test` | Correcto: 14 de 14 pruebas HTTP y unitarias superadas. No contactan con OpenAI. |
| `npm run build:client` | Correcto: cliente Angular compilado con el flujo de chat OpenAI. |
| Prueba real del BFF | Correcta: `GET /api/health` indicó `openai` y `POST /api/chat` respondió HTTP 200 a una consulta inocua. |
| Prueba a través del proxy Angular | Correcta: `GET /api/runtime` y `POST /api/chat` en `localhost:4200` respondieron HTTP 200. |
| Exposición de credenciales | Correcta: la clave no se leyó, imprimió ni devolvió durante las comprobaciones. |
| `npm audit --omit=dev` | Pendiente de remediación: dos vulnerabilidades altas transitivas reportadas (`body-parser` y `zod`). No se ejecutó una actualización automática no revisada. |

La revalidación usa OpenAI mediante el BFF y no sustituye una auditoría de producción. Antes de desplegar públicamente deben resolverse las vulnerabilidades indicadas, configurarse autenticación de usuarios y aplicar los controles de operación descritos en `apps/README.md`.
