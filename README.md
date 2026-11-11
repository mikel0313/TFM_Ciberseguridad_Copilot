# Entrega del TFM: CiberGuía

Esta carpeta reúne una memoria de TFM y los artefactos de un prototipo seguro de asistente de ciberseguridad. Puede probarse con OpenAI mediante un BFF o, de forma alternativa, con Microsoft Copilot Studio. El alcance está expresamente limitado a orientación defensiva, concienciación, triaje inicial y derivación; no ejecuta acciones ni proporciona instrucciones ofensivas.

## Entregables principales

| Elemento | Ubicación | Contenido |
| --- | --- | --- |
| Memoria final | `pdf/TFM_Mikel_Alvarez_Barroso.pdf` | PDF A4 de 69 páginas, compilado y revisado visualmente. |
| Fuente editable de la memoria | `memoria/main.tex` | Documento modular con capítulos, apéndices y bibliografía. |
| Fuente autónoma | `memoria/TFM_Mikel_Alvarez_Barroso.tex` | Versión LaTeX de un solo fichero, lista para compilación independiente. |
| Aplicación demostrable | `apps/` | Cliente Angular y BFF Express, con modo local seguro, canal OpenAI y Direct Line opcional. |
| Paquete del agente | `copilot-agent/` | Instrucciones, ocho temas, gobierno del conocimiento, modelo de riesgos y 72 casos sintéticos. |
| Evidencias | `evidencias/VALIDACION_LOCAL.md` | Resultados de compilación, pruebas y límites de validación. |

## Lectura y uso

1. Lee primero el PDF y confirma los campos académicos marcados como pendientes en la portada: N.P., tutor y fecha definitiva.
2. Para revisar o modificar la memoria, edita `memoria/main.tex` y los archivos incluidos en `memoria/chapters/`. Después ejecuta `node scripts/build-standalone-memory.mjs` desde esta carpeta para actualizar la fuente autónoma.
3. Para demostrar la aplicación sin servicios externos, abre una consola en `apps/` y ejecuta `npm run dev`. La interfaz quedará en `http://localhost:4200` en **modo demostración**.
4. Para probar OpenAI, sigue `apps/README.md`, copia `apps/server/.env.example` a `apps/server/.env` y añade `OPENAI_API_KEY` solo en ese fichero. Para Copilot Studio, sigue además `copilot-agent/guides/setup-and-publish-guide.md` y usa `DIRECT_LINE_SECRET` solo en el BFF. Ninguna credencial debe vivir en el cliente ni en la memoria.

## Transparencia sobre el agente y la plataforma

No se ha accedido a la UAX ni se ha iniciado sesión en ningún tenant. Por ese motivo, la entrega no afirma que un agente de Copilot Studio esté publicado o conectado a un canal real. Sí incluye la configuración humana, las instrucciones, los flujos, el corpus gobernado, la aplicación y las pruebas necesarias para crear y validar el agente cuando el propietario autorizado tenga licencia y acceso.

La aplicación cae de forma explícita al modo demostración si no existe `OPENAI_API_KEY` ni `DIRECT_LINE_SECRET`; no inventa credenciales ni simula una publicación. La memoria conserva esta limitación metodológica y diferencia los resultados de validación local de una evaluación posterior con el agente desplegado.

## Verificación realizada

Consulta `evidencias/VALIDACION_LOCAL.md` para los comandos, resultados y límites. La fuente autónoma se compiló correctamente con el compilador LaTeX de escritorio, y el PDF se comprobó en portada, índice, arquitectura, tablas, resultados, bibliografía y apéndices.
