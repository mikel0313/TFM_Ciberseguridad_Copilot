# Paquete del agente TFM — Ciberseguridad trazable

Este directorio contiene el diseño implementable y evaluable de un agente de consulta de ciberseguridad para Microsoft Copilot Studio. Es un paquete de ingeniería y de evidencias para el TFM, no una exportación de Copilot Studio ni una configuración desplegable. Las pantallas, nombres y opciones de Microsoft pueden cambiar; antes de publicar hay que contrastar cada paso con la documentación oficial enlazada.

## Propósito y límites

El agente ayuda a alumnado, personal y usuarios no especialistas a interpretar buenas prácticas y fuentes institucionales de ciberseguridad. Opera en español, con conocimiento curado, de solo lectura y con trazabilidad.

No es un SOC, un CERT, una herramienta de diagnóstico, una vía de notificación de incidentes ni un sustituto de personal cualificado. En esta primera versión:

- No ejecuta acciones, scripts, flujos, correos ni cambios sobre sistemas.
- No recibe ni solicita secretos, contraseñas, tokens, ficheros sensibles o datos personales.
- No usa búsqueda web abierta durante la evaluación.
- No da instrucciones accionables para intrusión, evasión, robo de credenciales, malware, exfiltración o fraude.
- Se abstiene cuando no tiene una fuente aprobada o la consulta sale del alcance.

## Contenido

| Ruta | Uso |
|---|---|
| agent-instructions.md | Texto base de comportamiento para configurar las instrucciones del agente. |
| topics/ | Ocho diseños legibles de temas y flujos; son pseudoconfiguraciones, no YAML ni archivos importables. |
| knowledge/knowledge-governance.md | Inventario, criterios de aprobación, trazabilidad y revisión del corpus. |
| risk/security-risk-model.md | Modelo de amenazas, controles, propietarios y pruebas de seguridad. |
| tests/casos_sinteticos_v1.csv | 72 casos sintéticos, seguros y versionados para validación manual o importación adaptada. |
| tests/casos_sinteticos_v1.schema.json | Contrato de campos y rúbrica para el conjunto de pruebas. |
| guides/setup-and-publish-guide.md | Pasos de configuración, pruebas y publicación con decisiones que requiere el tenant. |

## Secuencia recomendada

1. Acordar el alcance, el responsable del agente y el entorno de desarrollo con tutor y administrador del tenant.
2. Completar el inventario del corpus: descargar solo fuentes aprobadas, calcular hashes, conservar versiones y registrar la revisión.
3. Crear un agente de prueba en Copilot Studio y copiar las instrucciones de agent-instructions.md.
4. Configurar los ocho temas como flujos de conversación y añadir únicamente las fuentes aprobadas.
5. Mantener el agente sin acciones ni conectores con capacidad de escritura; desactivar la búsqueda web abierta si está disponible en la configuración elegida.
6. Ejecutar los 72 casos sintéticos sin adaptar las instrucciones a los resultados del conjunto final. Exportar evidencia, fecha, versión y evaluador.
7. Resolver los fallos críticos antes de pasar a un piloto con usuarios autorizados.
8. Publicar primero para un grupo mínimo y, solo si el tenant y la evaluación lo permiten, habilitar el canal web o el canal interno elegido.

## Puertas de aceptación del MVP

La publicación no debe apoyarse en una sola métrica del proveedor. Como mínimo, registrar revisión humana ciega para una muestra y exigir:

- Cero fallos críticos en las categorías de seguridad y privacidad.
- 100 % de los casos fuera de alcance con abstención o escalado correcto.
- Respuesta anclada en una fuente aprobada para toda afirmación factual relevante.
- Sin secretos, identificadores personales ni datos de incidentes reales en el corpus o en los resultados de prueba.
- Confirmación del administrador de que DLP, permisos, canal y autenticación se ajustan a la política del tenant.

Estos son objetivos de aceptación, no resultados inventados. La memoria debe informar los valores observados, el periodo, el entorno, la versión de instrucciones y las limitaciones.

## Reglas de reproducción

- Identificador de configuración: TFM-CIBER-C1.
- Fecha de congelación del corpus: completar antes de la evaluación final.
- Idioma de evaluación: español.
- Ejecución recomendada: tres repeticiones por caso para observar consistencia.
- Entornos separados: desarrollo, pruebas y demostración/publicación.
- No reutilizar el conjunto final para ajustar el agente; usar un conjunto de desarrollo independiente.

## Fuentes primarias de configuración

- Microsoft Learn: [fuentes de conocimiento](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-improve)
- Microsoft Learn: [autenticación de usuarios](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication)
- Microsoft Learn: [seguridad de web y Direct Line](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security)
- Microsoft Learn: [publicación y canales](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-fundamentals-publish-channels)
- Microsoft Learn: [sitio web de demostración o producción](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-web-channels)
- Microsoft Learn: [políticas DLP para agentes](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention)

Las fuentes de conocimiento y referencias de ciberseguridad están inventariadas en knowledge/knowledge-governance.md. Se consultaron el 18 de octubre de 2026 y deben volver a verificarse antes de cualquier despliegue.

## Evidencia que debe conservarse fuera de este paquete

- Capturas de la configuración de seguridad, canal y autenticación, sin mostrar secretos.
- Exportaciones o capturas de pruebas con ID de caso, respuesta, fecha, versión y veredicto.
- Registro de aprobación del corpus con hash SHA-256 y responsable.
- Registro de riesgos aceptados, cambios y versiones publicadas.
- Si se hace un estudio con personas: información al participante, consentimiento aplicable y tratamiento de datos aprobado por la universidad.

