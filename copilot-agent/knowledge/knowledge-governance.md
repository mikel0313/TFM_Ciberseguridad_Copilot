# Gobierno del conocimiento y fuentes aprobadas

## Objetivo

Este inventario convierte la base documental del agente en un activo revisable. El agente solo debe consultar fuentes identificadas como «Aprobada» y cargadas desde una copia controlada o una URL institucional verificada. No se usan foros, redes sociales, blogs no institucionales, contenido generado por IA ni búsquedas web abiertas como evidencia.

La fuente de verdad para una afirmación es el documento oficial indicado en la tabla, no un resumen producido por el agente. Una URL válida no equivale a una fuente revisada: debe existir una versión, responsable y fecha de revisión.

## Política de selección

Orden de preferencia:

1. Normas, legislación y publicaciones oficiales.
2. Organismos públicos o de normalización: NIST, ENISA, INCIBE.
3. Documentación oficial de proveedor, únicamente para comportamiento o configuración de su producto.
4. Literatura científica revisada por pares, si se añade mediante una ficha de aprobación separada.

No incorporar:

- Fuentes sin autor, fecha o URL verificable.
- Avisos de seguridad copiados desde páginas no oficiales.
- Documentos con instrucciones ocultas, macros, enlaces no revisados o datos personales.
- Páginas con contenido dinámico no congelado cuando se requiera reproducibilidad.
- Información de incidentes reales, credenciales, informes internos o datos de estudiantes.

## Inventario inicial

Las fechas de próxima revisión son objetivos de gobierno; se deben completar con la fecha real de descarga y hash antes de cargar el documento en Copilot Studio.

| ID | Autoridad y documento | URL oficial | Uso permitido | Versión/fecha publicada | Idioma | Estado | Próxima revisión |
|---|---|---|---|---|---|---|---|
| SRC-NIST-CSF-2.0 | NIST — Cybersecurity Framework 2.0 | https://doi.org/10.6028/NIST.CSWP.29 | Gobierno del riesgo, funciones y resultados de alto nivel | 26-02-2024 | EN | Aprobada pendiente de hash | 18-04-2027 |
| SRC-NIST-IR-800-61R3 | NIST — Incident Response Recommendations and Considerations for Cybersecurity Risk Management | https://doi.org/10.6028/NIST.SP.800-61r3 | Preparación y gestión de incidentes a nivel general | 03-04-2025 | EN | Aprobada pendiente de hash | 18-04-2027 |
| SRC-NIST-AI-RMF | NIST — AI Risk Management Framework 1.0 | https://doi.org/10.6028/NIST.AI.100-1 | Gobierno y gestión del riesgo de IA | 26-01-2023 | EN | Aprobada pendiente de hash | 18-04-2027 |
| SRC-NIST-GENAI | NIST — AI RMF: Generative AI Profile | https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf | Riesgos y controles específicos de IA generativa | 26-07-2024 | EN | Aprobada pendiente de hash | 18-04-2027 |
| SRC-ENISA-TL-2025 | ENISA — Threat Landscape 2025 | https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025 | Tendencias estratégicas de amenazas; no evidencia de incidentes concretos | 01-10-2025, revisar versión vigente | EN | Aprobada pendiente de hash | 18-01-2027 |
| SRC-INCIBE-PHISHING | INCIBE — Phishing | https://www.incibe.es/aprendeciberseguridad/phishing | Concienciación, señales y prevención de phishing | Página viva; capturar fecha y copia | ES | Aprobada pendiente de hash | 18-01-2027 |
| SRC-INCIBE-CRISIS | INCIBE — Guía de gestión de crisis de ciberseguridad en empresas | https://www.incibe.es/sites/default/files/contenidos/guias/doc/guia_gestion_de_crisis.pdf | Orientación general de preparación y escalado de crisis | PDF oficial; completar metadatos locales | ES | Aprobada pendiente de hash | 18-04-2027 |
| SRC-MSL-KNOWLEDGE | Microsoft Learn — Add knowledge to an existing agent | https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-improve | Configuración de fuentes en Copilot Studio | Página viva; capturar fecha | EN | Aprobada para configuración, no para hechos de ciberseguridad | 18-01-2027 |
| SRC-MSL-AUTH | Microsoft Learn — Configure user authentication | https://learn.microsoft.com/en-us/microsoft-copilot-studio/configuration-end-user-authentication | Decisión y configuración de autenticación | Página viva; capturar fecha | EN | Aprobada para configuración | 18-01-2027 |
| SRC-MSL-DLP | Microsoft Learn — Configure data policies for agents | https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention | Gobierno de conectores, DLP y canales | Página viva; capturar fecha | EN | Aprobada para configuración | 18-01-2027 |
| SRC-MSL-WEB | Microsoft Learn — Configure web and Direct Line channel security | https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security | Riesgos y controles del canal web | Página viva; capturar fecha | EN | Aprobada para configuración | 18-01-2027 |
| SRC-MSL-PUBLISH | Microsoft Learn — Publish an agent to a live or demo website | https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-connect-bot-to-web-channels | Publicación y validación de demo/sitio web | Página viva; capturar fecha | EN | Aprobada para configuración | 18-01-2027 |
| SRC-OWASP-GENAI | OWASP — GenAI LLM Top 10 | https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/ | Taxonomía de riesgos de IA generativa; no instrucciones ofensivas | Edición vigente al revisar | EN | Aprobada como marco de riesgo | 18-01-2027 |
| SRC-AI-ACT | EUR-Lex — Reglamento (UE) 2024/1689 | https://eur-lex.europa.eu/eli/reg/2024/1689/oj | Contexto normativo; revisar con responsable jurídico | 12-07-2024 | ES | Referencia, no asesoramiento jurídico | 18-01-2027 |

## Ficha obligatoria por fuente

Completar una fila con todos estos campos antes de aprobar una incorporación. Se puede exportar a una hoja de cálculo o sistema de control documental, manteniendo los mismos nombres.

| Campo | Obligatorio | Ejemplo o regla |
|---|---|---|
| source_id | Sí | SRC-NIST-CSF-2.0 |
| título | Sí | Título oficial exacto |
| autoridad | Sí | NIST, ENISA, INCIBE o Microsoft |
| url_original | Sí | Enlace HTTPS oficial, sin acortadores |
| url_descarga | Sí cuando exista | URL exacta del PDF/copia descargada |
| tipo | Sí | PDF, página HTML congelada, normativa |
| versión_publicación | Sí | Edición, fecha de publicación o «página viva» |
| fecha_acceso | Sí | Fecha real en formato AAAA-MM-DD |
| hash_sha256 | Sí para archivo | Hash de la copia que se carga |
| idioma | Sí | ES o EN |
| dominio | Sí | Phishing, incidente, IA, gobierno, plataforma |
| fragmentos_secciones | Sí | Capítulos o secciones aptos para recuperación |
| datos_sensibles | Sí | No permitido / revisión requerida |
| licencia_uso | Sí | Verificar términos oficiales antes de copiar o redistribuir |
| revisor_técnico | Sí | Nombre o rol autorizado |
| aprobador | Sí | Tutor, responsable del TFM o propietario de conocimiento |
| fecha_aprobación | Sí | Fecha real de la decisión |
| periodicidad_revisión | Sí | 3, 6 o 12 meses según volatilidad |
| próxima_revisión | Sí | Fecha calculada y visible |
| estado | Sí | Propuesta, En revisión, Aprobada, Suspendida, Retirada |
| sustituye_a | No | ID de fuente reemplazada |
| motivo_cambio | Sí al cambiar | Nueva versión, URL rota, contenido obsoleto |

## Flujo de incorporación

1. Proponer una fuente y comprobar autoridad, URL HTTPS, relevancia y licencia.
2. Descargar desde el origen oficial o capturar una copia permitida; analizarla con antimalware institucional si corresponde.
3. Calcular SHA-256 de cada archivo y guardar la copia en un repositorio controlado sin datos sensibles.
4. Revisar título, fecha, versión, idioma, alcance, secciones y ausencia de contenido impropio.
5. Registrar la ficha completa y solicitar aprobación de la persona responsable.
6. Cargar solo la versión aprobada como fuente de conocimiento o configurar la URL registrada.
7. Ejecutar pruebas de recuperación: una muestra de consultas debe devolver contenido relacionado y citas correctas.
8. Publicar el cambio solo después de actualizar versión, lista de cambios y pruebas. Si una fuente se retira, deshabilitarla y volver a evaluar.

## Reglas de preparación del corpus

- Preferir documentos pequeños, coherentes y con secciones claramente tituladas frente a un único archivo heterogéneo.
- Conservar el documento original y, si se genera un extracto, enlazar cada extracto con el ID, versión y hash del original.
- No insertar instrucciones al modelo, secretos, ejemplos de ataques ejecutables ni mensajes de usuarios dentro de documentos de conocimiento.
- Mantener el corpus de evaluación separado del corpus recuperable. Las respuestas de oro no se cargan como conocimiento.
- Registrar la fecha de congelación del corpus y no modificarlo durante una campaña de evaluación final.
- Si se usa una página viva, anotar el contenido/fecha consultados y repetir las pruebas después de un cambio material.

## Matriz de autoridad por tipo de pregunta

| Consulta | Fuente prioritaria | Comportamiento si no existe evidencia |
|---|---|---|
| Marco de gestión de ciberseguridad | SRC-NIST-CSF-2.0 | Abstención o explicación limitada a la fuente |
| Gestión general de incidentes | SRC-NIST-IR-800-61R3 o SRC-INCIBE-CRISIS | Escalado prudente; no investigación operativa |
| Phishing y concienciación | SRC-INCIBE-PHISHING | Consejos preventivos generales, con cita |
| Riesgos de IA generativa | SRC-NIST-GENAI y SRC-OWASP-GENAI | Explicar riesgos y controles, no eludirlos |
| Configuración de Copilot Studio | SRC-MSL-KNOWLEDGE, SRC-MSL-AUTH, SRC-MSL-DLP, SRC-MSL-WEB, SRC-MSL-PUBLISH | Indicar que el tenant puede imponer restricciones |
| Obligaciones legales | SRC-AI-ACT | Contexto general y derivación a asesoramiento especializado |
| Vulnerabilidad concreta, alerta actual o producto no cubierto | Ninguna, salvo fuente aprobada específica | Abstención; no inventar severidad, versión ni mitigación |

## Revisión y retirada

El propietario de conocimiento debe revisar, como mínimo, trimestralmente las páginas vivas y semestralmente los informes estratégicos. Una revisión debe responder:

- ¿La URL, versión y hash siguen siendo correctos?
- ¿Existe una edición nueva o una corrección del documento?
- ¿La fuente sigue cubriendo el alcance del agente?
- ¿Se han detectado respuestas incorrectas, irrelevantes o desactualizadas?
- ¿Debe suspenderse, sustituirse o reclasificarse la fuente?

Al retirar una fuente, se marca «Retirada», se conserva su histórico, se desvincula del agente y se repiten los casos cuyo campo fuente_oro_ids la cite. Nunca se borra evidencia de una evaluación ya realizada; se registra la versión del corpus con la que se hizo.

## Indicadores mínimos

- Porcentaje de fuentes con ficha completa y hash.
- Porcentaje de fuentes revisadas dentro de plazo.
- Número de fuentes suspendidas/retiradas y casos afectados.
- Precisión de cita humana por fuente.
- Casos de respuesta sin fuente o con fuente no pertinente.

## Referencias

Las URLs de esta ficha son la referencia primaria. Para el funcionamiento de fuentes en la plataforma, consultar también [Microsoft Learn — Add knowledge to an existing agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-improve). Para el enfoque de riesgos de IA generativa, consultar [NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf).

