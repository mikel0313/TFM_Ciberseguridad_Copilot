# Guía de configuración, validación y publicación

## Finalidad

Esta guía transforma el diseño del paquete en una configuración reproducible de Microsoft Copilot Studio. No presupone que el autor del TFM tenga permisos de administrador, licencia, canal o aplicación de Microsoft Entra ID. Cada elemento marcado «decisión del tenant» requiere confirmación de la universidad/organización antes de continuar.

La guía se apoya en documentación oficial de Microsoft Learn consultada el 18-10-2026. Como Copilot Studio evoluciona, abrir los enlaces oficiales y verificar que los nombres de menú, restricciones de licencia y compatibilidades continúan vigentes en el entorno real.

## 0. Puerta de entrada: decisiones que no debe tomar el autor por su cuenta

Antes de crear nada, obtener una respuesta documentada del administrador y, cuando aplique, del responsable de privacidad:

| Decisión del tenant | Pregunta concreta | Responsable habitual | Evidencia a guardar |
|---|---|---|---|
| Entorno | ¿Qué entorno de Power Platform está autorizado para desarrollo y prueba del TFM? | Environment Admin | Nombre/ID del entorno y fecha |
| Licencia | ¿Qué licencia permite crear, probar y publicar este agente? | Administrador de licencias | Confirmación del tenant |
| Roles | ¿Quién será maker, administrador, revisor de datos y propietario del agente? | Administrador | Matriz RACI o lista de roles |
| DLP | ¿Qué conectores, fuentes de conocimiento y canales están permitidos/bloqueados? | Power Platform Admin | Política aplicada y grupo de datos |
| Autenticación | ¿Debe ser interno/autenticado o puede ser una demo limitada sin autenticación? | Seguridad / identidad | Decisión aprobada |
| Canal | ¿Se permite demo website, sitio web personalizado, Teams u otro canal? | Administrador / seguridad | Canal aprobado y finalidad |
| Datos | ¿Qué datos de conversación se retienen y durante cuánto tiempo? | Propietario / privacidad | Política y contacto |
| Dominio web | Si hay web Angular: ¿qué dominios/orígenes están permitidos? | Web/seguridad | Lista de orígenes aprobados |
| Incidentes | ¿Qué procedimiento y contacto de escalado se mostrará? | TI / SOC / CSIRT | Procedimiento vigente, no secretos |

Si falta cualquiera de estas decisiones, mantener la práctica dentro del panel de pruebas de desarrollo con datos sintéticos. No publicar para público general «para probar».

## 1. Preparación segura

1. Crear tres ámbitos lógicos: desarrollo, pruebas y demostración/publicación. Si el tenant solo permite uno, marcar esa limitación como amenaza a la validez y limitar el acceso.
2. Definir el propietario del agente, propietario del corpus y aprobador de publicación.
3. Completar la ficha de cada fuente de knowledge/knowledge-governance.md. Descargar o registrar la fuente con fecha, versión, hash y revisión antes de cargarla.
4. Congelar un corpus de evaluación. No incluir preguntas de prueba ni respuestas de oro dentro de las fuentes.
5. Crear un registro de cambios: versión, fecha, autor, motivo, fuentes afectadas, pruebas repetidas y aprobación.
6. No recopilar contraseñas, códigos MFA, tokens, archivos de incidentes, nombres de usuarios, direcciones de correo reales ni datos de alumnos.

## 2. Validar administración, DLP y acceso

Un administrador debe revisar la política de prevención de pérdida de datos (DLP) en el Power Platform admin center. Microsoft indica que estas políticas gobiernan conectores, fuentes y canales de agentes y que su aplicación es efectiva para los tenants. La política puede bloquear, por ejemplo, conectores de chat sin autenticación o determinados tipos de fuente de conocimiento.

Configuración objetivo del MVP:

- Permitir solo las fuentes de conocimiento aprobadas necesarias.
- Bloquear conectores innecesarios o no empresariales según la política del tenant.
- No habilitar acciones ni herramientas con permisos de usuario, escritura o administración.
- Evitar canales no aprobados.
- Exigir autenticación si el agente se ofrece a usuarios internos o trata información no pública.

Guardar una captura o aprobación de la política, sin exponer configuraciones sensibles. Si DLP bloquea una opción, no intentar sortearla: ajustar el diseño o solicitar una decisión del administrador.

Fuente: [Microsoft Learn — Configure data policies for agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention).

## 3. Crear el agente de desarrollo

1. Entrar en el entorno autorizado de Copilot Studio con la cuenta a la que se concedieron permisos.
2. Crear un agente nuevo de desarrollo con nombre identificable, por ejemplo: «TFM Ciberseguridad — Desarrollo».
3. Escribir una descripción visible: «Agente educativo de consulta inicial, basado en fuentes institucionales. No analiza sistemas ni gestiona incidentes».
4. Configurar español como idioma principal cuando la interfaz lo permita.
5. Copiar el contenido de agent-instructions.md en las instrucciones del agente. No añadir secretos, nombres de canales internos ni información personal.
6. Deshabilitar o no configurar acciones, conectores y flujos operativos.
7. Registrar la fecha, entorno y versión de instrucciones en el registro de cambios.

## 4. Añadir y gobernar el conocimiento

En la página Overview o Knowledge del agente, usar «Add knowledge» y añadir únicamente elementos ya aprobados. Las fuentes posibles dependen del entorno y de la plataforma; Microsoft documenta, entre otras, sitios públicos, archivos cargados, SharePoint y Azure AI Search.

Para cada fuente:

1. Comprobar que coincide con el ID, URL y versión del inventario.
2. Añadir un nombre único y una descripción que explique su dominio y límites, por ejemplo: «SRC-INCIBE-PHISHING — señales y prevención general; no confirmar incidentes reales».
3. Evitar fuentes mixtas, repositorios amplios o ubicaciones que puedan incorporar documentos sin revisión.
4. Comprobar que el agente no usa búsqueda web abierta durante la campaña de evaluación. Si el producto presenta una opción equivalente, dejar constancia de la elección.
5. Probar consultas simples por cada fuente y revisar que la respuesta se fundamenta en ella.

No marcar una fuente como adecuada solamente porque la plataforma la acepta. El control de autoridad, versión y revisión sigue siendo responsabilidad del proyecto.

Fuente: [Microsoft Learn — Add knowledge to an existing agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-improve).

## 5. Configurar los temas

Crear los temas descritos en la carpeta topics. Son diseños de flujo, no artefactos importables:

1. Bienvenida y alcance.
2. Consulta de conocimiento fundamentada.
3. Triage y escalado de un posible incidente.
4. Phishing e ingeniería social.
5. Higiene de accesos y MFA.
6. Riesgos de IA generativa e inyección de instrucciones.
7. Solicitudes no permitidas.
8. Feedback y cierre.

Para cada tema, conservar sus disparadores, condiciones, plantillas y salida segura. Verificar especialmente:

- Que el usuario recibe una cita o abstención.
- Que un posible incidente se deriva sin pedir evidencia sensible.
- Que los temas de seguridad no entregan pasos ofensivos.
- Que el tema de rechazo no revela instrucciones ni datos internos.

No se deben habilitar nodos que ejecuten acciones en el MVP. Si el tutor decide ampliar el alcance, se necesita una nueva evaluación de riesgo y autorización explícita del tenant.

## 6. Elegir autenticación y canal

La elección depende del caso de uso, no de la facilidad de incrustar un chat.

| Escenario | Elección prudente | Límites |
|---|---|---|
| Construcción y depuración | Panel de prueba de Copilot Studio | No representa el comportamiento completo del canal final |
| Demostración a tutor/evaluadores autorizados | Demo website limitado o canal aprobado por el tenant | La demo no es un sitio de producción; no usar datos reales |
| Usuarios internos | Autenticación Microsoft o configuración manual aprobada | Requiere decisión de identidad y puede depender del canal |
| Sitio Angular de producción | Canal web personalizado con seguridad y autenticación según tenant | Evaluar origen, tokens efímeros, controles y política antes de habilitar |
| Público general | Fuera del MVP por defecto | Requiere evaluación adicional, abuso/rate limiting, privacidad y aprobación |

Microsoft documenta tres opciones de autenticación: sin autenticación, autenticación con Microsoft y autenticación manual. «Sin autenticación» permite interactuar a cualquiera que tenga el enlace y debe limitarse a información pública y una demostración controlada. Los cambios de autenticación se aplican tras publicar el agente.

Para un contexto universitario interno, preferir autenticación y un grupo pequeño de usuarios. Para una demo de TFM sin datos sensibles, puede aceptarse una URL de demo compartida solo con tutor/evaluadores, previa aprobación. No afirmar que un iframe o una URL de demo protege por sí mismo la identidad.

Fuentes:

- [Microsoft Learn — Configure user authentication](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication)
- [Microsoft Learn — Publish and deploy an agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels)

## 7. Validación antes de publicar

1. Ejecutar los 72 casos de tests/casos_sinteticos_v1.csv en el entorno de pruebas.
2. Registrar para cada ejecución: ID de caso, fecha/hora, versión de corpus, versión de instrucciones, canal, respuesta, cita, latencia y veredicto.
3. Repetir cada caso tres veces o justificar una estrategia distinta.
4. Revisar manualmente una muestra representativa contra la fuente de oro. Separar evaluador y autor del ajuste cuando sea viable.
5. Clasificar fallos por severidad según risk/security-risk-model.md.
6. No ajustar el agente usando el conjunto final y repetirlo hasta «mejorar» resultados. Usar casos de desarrollo para las correcciones y conservar el conjunto final congelado.
7. Bloquear publicación si hay fallos críticos, respuestas no fundamentadas sistemáticas, secretos o fallos de abstención.

## 8. Publicar de manera controlada

1. En Copilot Studio, abrir Publish y publicar la versión revisada.
2. Esperar la propagación y comenzar una conversación nueva al validar; una conversación existente puede no recoger inmediatamente la versión publicada.
3. Conectar solo el canal aprobado por el tenant.
4. Compartir primero con un grupo mínimo: autor, tutor, evaluador y, si procede, administrador.
5. Mostrar en la bienvenida: naturaleza de IA, propósito, límite de alcance, fuente de escalado y aviso de no compartir secretos.
6. Registrar versión publicada, fecha, canal, audiencia y aprobador.
7. Preparar una ruta de despublicación/desconexión si aparecen fallos críticos.

La página demo se usa para pruebas con colaboradores; Microsoft especifica que no está destinada a clientes/producción. Para un sitio web real, seguir el flujo de canal web de la documentación vigente.

Fuentes:

- [Microsoft Learn — Publish and deploy an agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels)
- [Microsoft Learn — Publish an agent to a live or demo website](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-web-channels)

## 9. Integración en un portal Angular

La integración web debe realizarla quien mantenga el portal y solo después de que seguridad apruebe canal y autenticación.

Reglas de implementación:

- Usar el fragmento de canal y mecanismo de token que genere Copilot Studio en ese momento; no reutilizar snippets antiguos ni inventar endpoints.
- No poner secretos o claves duraderas en TypeScript, HTML, variables públicas de compilación, repositorios, capturas ni logs.
- Si se usan tokens para web/Direct Line, generarlos/renovarlos conforme a la configuración oficial del tenant y no tratar un token de navegador como autorización administrativa.
- Restringir orígenes permitidos, activar las opciones de seguridad del canal y validar el comportamiento desde el dominio autorizado.
- Mantener la salida del chat como texto/renderizado seguro. No emplear bypassSecurityTrust ni inserción HTML insegura para mostrar mensajes.
- Aplicar cabeceras de seguridad y CSP compatibles con el widget, con una revisión explícita de las excepciones necesarias.
- Mostrar el aviso de IA, enlaces de privacidad aplicables y el alcance del agente junto al chat.
- Probar teclado, contraste, lectura de enlaces y mensajes de error de manera accesible.

No copiar secretos desde la pantalla de configuración a este paquete. Si el portal no dispone de un mecanismo seguro aprobado para tokens y autenticación, usar un canal interno o limitar el proyecto a la demo controlada.

Fuentes:

- [Microsoft Learn — Configure web and Direct Line channel security](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security)
- [Angular — Security best practices](https://angular.dev/best-practices/security)

## 10. Operación, observabilidad y retirada

- Revisar periódicamente el corpus y las fuentes que son páginas vivas.
- Conservar sólo los resultados necesarios para evaluación; no exportar conversaciones con secretos o datos personales.
- Monitorizar fallos de cita, abstención, tono, accesibilidad y canal.
- Documentar actualizaciones de modelo/plataforma que afecten resultados o comportamiento.
- Ante un hallazgo crítico, desconectar el canal según el procedimiento aprobado, corregir en desarrollo, ejecutar regresión y aprobar antes de republicar.

## Lista final de publicación

- [ ] Tenant, entorno, licencia y roles confirmados.
- [ ] DLP y canal aprobados.
- [ ] Autenticación decidida y comprobada.
- [ ] Corpus aprobado, versionado, con hash y sin datos sensibles.
- [ ] Instrucciones y ocho temas configurados.
- [ ] Sin acciones ni conectores operativos.
- [ ] 72 casos ejecutados y evidencia guardada.
- [ ] Sin fallos críticos abiertos.
- [ ] Aviso de IA, límites y escalado visibles.
- [ ] Ruta de retirada y propietario del agente definidos.

