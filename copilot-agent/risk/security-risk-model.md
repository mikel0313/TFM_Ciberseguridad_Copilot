# Modelo de seguridad y riesgos

## Alcance y activos

El modelo cubre el agente de consulta, su corpus de conocimiento, las instrucciones, los temas, la aplicación web Angular que lo alberga, el canal de Copilot Studio y la evidencia de evaluación. No cubre la defensa operativa de una red real ni atribución de incidentes.

| Activo | Clasificación propuesta | Propietario | Protección mínima |
|---|---|---|---|
| Instrucciones y temas | Interno | Autor del TFM | Versionado, revisión por pares, sin secretos |
| Corpus institucional | Público controlado | Propietario de conocimiento | Inventario, hash, aprobación y revisión |
| Configuración del agente | Interno / sensible | Maker y administrador del entorno | Mínimo privilegio, entornos separados, registro de cambios |
| Conversaciones de prueba | Interno; no deben contener datos personales | Responsable de evaluación | Datos sintéticos, retención limitada, acceso restringido |
| Tokens o secretos de canal | Secreto | Administrador del tenant | Nunca en Angular, repositorio ni capturas; rotación y almacén seguro |
| Aplicación Angular | Público o interno según canal | Desarrollador | CSP, actualizaciones, sanitización y revisión |
| Resultados y rúbricas | Interno | Autor del TFM / tutor | Identificador de caso, fecha, versión, evaluador |

## Arquitectura de confianza

Usuario → interfaz Angular → canal autenticado o token efímero → Copilot Studio → instrucciones y temas → corpus aprobado.

La interfaz no recibe secretos del agente ni los almacena. El agente no dispone de acciones con capacidad de escritura en el MVP. El corpus se trata como entrada no confiable hasta que pase el flujo de revisión descrito en knowledge/knowledge-governance.md.

## Decisiones de reducción de superficie

- Modo solo lectura: no habilitar Power Automate, conectores, código, administración, envío de correo ni cambios de recursos.
- Conocimiento cerrado: cargar únicamente fuentes aprobadas; evitar búsqueda web abierta durante evaluación y demostración controlada.
- Datos minimizados: no solicitar PII, tokens, contraseñas, códigos MFA ni detalles de incidentes.
- Sin secretos en prompts, temas, cliente Angular, repositorios, capturas o datasets.
- Separación de entornos: desarrollo, pruebas y demostración/producción.
- Control de acceso basado en necesidad: makers, administradores, revisores y evaluadores con roles diferenciados.
- DLP del tenant: clasificar y bloquear conectores/canales incompatibles antes de publicar.
- Revisión humana: el agente informa y orienta; no toma decisiones de contención, sanción o cumplimiento.

## Registro de riesgos

La escala inicial es Baja, Media, Alta. La aceptación del riesgo requiere propietario, fecha y justificación; nunca se considera aceptado un riesgo crítico sin aprobación explícita del responsable del entorno.

| ID | Riesgo / escenario | Prob. | Impacto | Controles de diseño | Evidencia de validación | Riesgo residual | Propietario |
|---|---|---:|---:|---|---|---:|---|
| R-01 | Inyección de instrucciones desde un usuario o documento intenta cambiar la conducta | Alta | Alta | Instrucciones prioritarias, sin secretos, temas de rechazo, corpus revisado, sin acciones | Casos S01-S10 y revisión de respuestas | Medio | Responsable del agente |
| R-02 | Respuesta no fundamentada o falsa | Media | Alta | Corpus cerrado, cita obligatoria, abstención, revisión de fuentes y conjunto de oro | Precisión de cita y groundedness manual | Medio | Propietario de conocimiento |
| R-03 | Divulgación de datos o credenciales en conversaciones | Media | Alta | Aviso visible, no solicitar datos, datos sintéticos, autenticación y retención aprobada | Casos T01-T08 y revisión de registros | Medio | Administrador / DPO si aplica |
| R-04 | Exceso de autonomía mediante herramientas o conectores | Baja en MVP | Alta | Sin herramientas de escritura ni conectores operativos | Inspección de configuración y DLP | Bajo | Administrador del tenant |
| R-05 | Fuente contaminada, desactualizada o manipulada | Media | Alta | Aprobación manual, hash, versiones, revisión periódica, retirada | Ficha completa; muestra de recuperación | Medio | Propietario de conocimiento |
| R-06 | Uso no autorizado de un canal web público | Media | Alta | Decisión de autenticación, seguridad web/Direct Line, tokens de corta vida, rate limits del entorno | Revisión de canal y prueba de acceso | Medio | Administrador del tenant |
| R-07 | Exposición de token en Angular o repositorio | Media | Alta | No insertar secretos del lado cliente, variables seguras en backend si existe, revisión de secretos | Escaneo de repositorio y revisión de bundle | Bajo-Medio | Desarrollador |
| R-08 | XSS o representación insegura de contenido en interfaz | Media | Media | Sanitización nativa de Angular, no anularla, CSP y validación de URLs | Pruebas de salida inofensivas y revisión de código | Bajo-Medio | Desarrollador |
| R-09 | Consumo descontrolado / abuso de servicio | Media | Media | Límites del canal, observabilidad, grupos piloto, cuota y procedimiento de apagado | Registro de pruebas de carga moderada | Medio | Administrador del tenant |
| R-10 | Falta de trazabilidad de cambios y resultados | Media | Media | Identificador de versión, corpus congelado, registro de publicación y CSV de pruebas | Auditoría de evidencias | Bajo | Autor del TFM |
| R-11 | Consejos impropios ante un incidente real | Media | Alta | Tema de triage con escalado, no diagnóstico ni acciones remotas, avisos de límites | Casos I01-I08 | Medio | Responsable del agente |
| R-12 | Apariencia de autoridad excesiva o incumplimiento de transparencia | Media | Media | Aviso de IA, fuentes, límites, derivación y revisión de UX | Revisión de interfaz y pruebas con usuarios | Bajo-Medio | Autor del TFM |

## Controles por fase del ciclo de vida

### Diseñar

- Mantener una declaración de propósito, exclusiones y población objetivo.
- Evaluar necesidad de autenticación antes de elegir canal.
- Identificar propietarios de contenido, configuración, riesgo y evaluación.
- No diseñar funcionalidades que requieran privilegios de administración para una demo académica.

### Construir

- Revisar cada fuente antes de conectarla.
- Versionar instrucciones y temas; documentar qué cambió y por qué.
- Aplicar mínimo privilegio a makers, revisores y conexiones.
- No permitir que los datos de prueba entren en el corpus.

### Verificar

- Ejecutar casos funcionales, fuera de alcance, seguridad, privacidad e inyección.
- Examinar muestras humanas contra la fuente de oro, no solo una métrica automática.
- Verificar que una petición de secreto recibe redirección y no eco del dato.
- Comprobar que el agente no afirma haber realizado una acción.

### Publicar y operar

- Publicar primero en un grupo pequeño y con un propietario identificable.
- Comprobar DLP, autenticación, canal, grupo de acceso, retención y contactos de escalado.
- Mantener un mecanismo de despublicación o desconexión aprobado.
- Revisar mensualmente conversaciones agregadas y fallos sin introducir datos sensibles en informes.

## Protocolo de respuesta a un fallo del agente

1. Clasificar el hallazgo: crítico, alto, medio o bajo.
2. Para un fallo crítico —por ejemplo, divulgación de secreto, instrucción insegura accionable o acceso no autorizado— despublicar o desconectar el canal según el procedimiento del tenant, preservar evidencias sin ampliar datos personales y avisar al propietario y administrador.
3. Corregir la causa en entorno de desarrollo: instrucciones, tema, corpus, DLP, canal o interfaz.
4. Añadir un caso de regresión sintético; no usar la conversación real como prompt de prueba si contiene datos sensibles.
5. Repetir pruebas afectadas, registrar resultado y obtener aprobación antes de republicar.

## Criterios de severidad

| Severidad | Ejemplo | Acción |
|---|---|---|
| Crítica | Expone un secreto, permite acceso no autorizado o entrega pasos operativos dañinos | Detener publicación/canal, escalar inmediatamente |
| Alta | Información de incidente o consejo peligrosamente erróneo sin escalado | Corregir antes de ampliar usuarios |
| Media | Cita imprecisa, abstención incompleta, mala comprensión de una consulta | Corregir y validar en siguiente iteración |
| Baja | Estilo, enlace secundario, explicación poco clara sin riesgo | Registrar y priorizar por impacto |

## Métricas de control

- Tasa de rechazo seguro en S01-S10: objetivo 100 % sin revelar información interna.
- Tasa de abstención correcta en casos sin cobertura: objetivo 100 %.
- Citas pertinentes evaluadas manualmente: objetivo definido antes de la prueba; reportar valor real.
- Hallazgos críticos abiertos: objetivo 0 para publicación.
- Fuentes vencidas o sin hash: objetivo 0 en corpus congelado.
- Cambios publicados con registro de pruebas: objetivo 100 %.

## Referencias de control

- [NIST AI RMF: Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [NIST Cybersecurity Framework 2.0](https://doi.org/10.6028/NIST.CSWP.29)
- [OWASP GenAI LLM Top 10](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/)
- [Microsoft Learn — políticas DLP](https://learn.microsoft.com/en-us/microsoft-copilot-studio/admin-data-loss-prevention)
- [Microsoft Learn — seguridad de web y Direct Line](https://learn.microsoft.com/en-us/microsoft-copilot-studio/configure-web-security)
- [Angular — security best practices](https://angular.dev/best-practices/security)

