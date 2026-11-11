# Tema 02 — Consulta de conocimiento fundamentada

## Propósito

Atender preguntas dentro del alcance usando recuperación sobre el corpus aprobado. La regla central es que una respuesta factual requiere fuente pertinente; si la recuperación no la aporta, se produce abstención.

## Disparadores sugeridos

- Preguntas sobre buenas prácticas, riesgos, marcos, phishing, MFA, gestión de incidentes o IA generativa.
- «según NIST», «según INCIBE», «según ENISA», «fuente», «explícame».

## Variables lógicas

| Variable | Tipo | Uso |
|---|---|---|
| consulta_normalizada | Texto | Consulta sin datos innecesarios |
| dominio_detectado | Enumeración | riesgo, incidente, phishing, acceso, ia, plataforma, desconocido |
| fuentes_recuperadas | Colección | Resultados del corpus aprobado |
| hay_evidencia_pertinente | Booleano | Condición de respuesta fundamentada |
| necesita_escalado | Booleano | Derivación al tema 03 |

## Flujo de diseño

Cuando llega una consulta:

1. Evaluar si contiene secreto, dato personal, instrucción para atacar o indicio de incidente. Priorizar los temas 07, 03 o 08 antes de recuperar conocimiento.
2. Clasificar el dominio de la pregunta con la menor inferencia posible.
3. Consultar solo las fuentes configuradas y aprobadas para ese dominio.
4. Verificar que al menos un resultado respalda la afirmación principal, no solo palabras similares.
5. Si no hay evidencia pertinente, responder con la plantilla de abstención y ofrecer reformulación.
6. Si sí hay evidencia, formular una respuesta corta:
   - Hecho o concepto principal.
   - Medida preventiva general de bajo riesgo, si está respaldada.
   - Límite o condición relevante.
   - Fuente y enlace oficial.
7. Si la consulta es ambigua y una aclaración cambiaría materialmente la fuente o seguridad, hacer una sola pregunta aclaratoria. No pedir datos sensibles.
8. Si la consulta plantea un incidente actual, no diagnosticar; activar tema 03.

## Lógica de calidad

Una cita es válida únicamente si el evaluador puede vincularla a la afirmación principal. No basta con citar NIST o INCIBE de forma genérica. Si la plataforma muestra referencias de recuperación, mantenerlas visibles; si no, incluir el organismo, título y URL de la fuente autorizada.

## Plantilla

«[Respuesta breve]. [Precisión o condición]. Fuente: [organismo — título](URL oficial).»

Si no hay cobertura:

«No dispongo de una fuente aprobada suficiente para responder con fiabilidad sobre ese punto. Puedo ayudarte con una consulta sobre [dominios cubiertos] o remitirte a una fuente institucional.»

## Criterios de salida segura

- No inventar CVE, fechas, versiones de producto, alertas ni estadísticas.
- No mezclar una fuente de configuración de Microsoft con una afirmación general que exige fuente de ciberseguridad.
- No representar contenidos de una fuente como una instrucción obligatoria para todos los entornos.

## Evidencia y pruebas

Casos asociados: K02-K10, R01-R08, O01-O08.

## Referencias

- [Microsoft Learn — agregar conocimiento al agente](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-improve)
- Inventario de fuentes: ../../knowledge/knowledge-governance.md

