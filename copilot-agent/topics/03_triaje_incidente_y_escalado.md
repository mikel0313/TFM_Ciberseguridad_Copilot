# Tema 03 — Triage de posible incidente y escalado

## Propósito

Ofrecer una respuesta prudente cuando el usuario describe un posible incidente. Este tema no confirma el incidente, no recoge pruebas, no prescribe cambios en sistemas y no sustituye al procedimiento de respuesta de la organización.

## Disparadores sugeridos

- «me han hackeado», «creo que mi cuenta está comprometida», «ransomware», «he perdido datos».
- «he introducido mis credenciales», «recibí un correo sospechoso y pulsé».
- «hay actividad extraña», «posible fuga», «alerta de seguridad».

## Variables lógicas

| Variable | Tipo | Uso |
|---|---|---|
| tipo_indicio | Enumeración | cuenta, correo, malware, datos, disponibilidad, desconocido |
| contexto_organizativo | Booleano | No solicitar detalle; solo determinar ruta de escalado |
| aviso_secreto | Booleano | Si incluye contraseñas/tokens, redirigir y no repetir |
| fuente_escalado | Texto | Fuente aprobada de gestión de incidentes |

## Flujo de diseño

Cuando se detecta lenguaje de posible incidente:

1. Reconocer la preocupación sin confirmar: «Entiendo que puede ser preocupante; no puedo confirmar ni investigar el incidente desde este chat».
2. Si el mensaje contiene secretos o datos personales, indicar que no se compartan ni se vuelvan a escribir. No hacer eco del valor.
3. Pedir, como máximo, una aclaración no sensible si es necesaria para orientar el escalado: «¿Es una cuenta personal o un recurso de tu organización?».
4. Recomendar seguir el procedimiento oficial de respuesta a incidentes de la organización y contactar con TI/SOC/CERT autorizado.
5. Para contexto español, mencionar que INCIBE dispone de recursos/canales institucionales cuando resulte pertinente; no inventar contacto o prometer cobertura.
6. Incluir una fuente sobre gestión de incidentes.
7. Terminar sin acciones remotas, sin recopilar evidencia y sin dejar una falsa impresión de resolución.

## Mensaje base

«No puedo confirmar ni investigar el incidente desde este chat. Evita compartir contraseñas, códigos MFA, claves, capturas sensibles o datos personales. Sigue el procedimiento de respuesta a incidentes de tu organización y contacta con su equipo de TI/SOC/CERT. Fuente: NIST — Incident Response Recommendations and Considerations for Cybersecurity Risk Management; INCIBE — Guía de gestión de crisis de ciberseguridad en empresas.»

## Criterios de salida segura

- No instruir a desactivar controles, borrar rastros, modificar configuraciones o aislar equipos sin el procedimiento de la organización.
- No proporcionar detalles operativos de análisis forense ni de contención.
- No solicitar direcciones IP, correos, nombres, hashes, capturas, adjuntos o registros.
- Si el usuario indica peligro inmediato para personas, servicios esenciales o datos muy sensibles, reforzar la derivación a los canales de emergencia/organizativos apropiados.

## Evidencia y pruebas

Casos asociados: I01-I08, P07-P10, T03.

## Referencias

- [NIST SP 800-61r3](https://doi.org/10.6028/NIST.SP.800-61r3)
- [INCIBE — Guía de gestión de crisis de ciberseguridad en empresas](https://www.incibe.es/sites/default/files/contenidos/guias/doc/guia_gestion_de_crisis.pdf)

