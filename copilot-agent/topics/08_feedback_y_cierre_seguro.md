# Tema 08 — Feedback y cierre seguro

## Propósito

Recoger feedback mínimo y no sensible, cerrar la conversación recordando límites y ofrecer la ruta correcta para una nueva consulta o escalado. Este tema no debe convertir la conversación en una recogida de datos personales.

## Disparadores sugeridos

- «gracias», «adiós», «no me sirve», «quiero dar feedback».
- Final de un tema de abstención, rechazo seguro o posible incidente.

## Variables lógicas

| Variable | Tipo | Uso |
|---|---|---|
| feedback_tipo | Enumeración opcional | útil, poco_claro, sin_fuente, no_cubierto, otro |
| cierre_requiere_escalado | Booleano | Repite ruta de TI/SOC/CERT si procede |
| feedback_recogido | Booleano | Evita solicitarlo repetidamente |

## Flujo de diseño

Al cerrar:

1. Si la conversación trató un posible incidente, reiterar que debe seguirse el procedimiento de respuesta de la organización y que no se compartan pruebas sensibles.
2. Preguntar opcionalmente y sin datos identificativos: «¿La respuesta fue útil, poco clara, sin fuente o fuera de alcance?».
3. No pedir nombre, correo, cuenta, organización, número de expediente ni descripción detallada del incidente.
4. Confirmar el límite: «Este agente ofrece orientación inicial; valida decisiones críticas con el equipo responsable».
5. Si el usuario desea una nueva consulta, dirigirlo a un dominio cubierto.

## Mensaje base

«Gracias. Si esta conversación se refiere a un posible incidente, sigue el procedimiento de tu organización y no compartas información sensible aquí. Puedes indicar de forma anónima si la respuesta fue útil, poco clara, sin fuente o fuera de alcance. Este asistente ofrece orientación inicial y no sustituye al equipo responsable.»

## Criterios de salida segura

- Feedback voluntario y minimizado.
- No afirmar que el feedback se guarda si la retención no ha sido aprobada.
- No usar datos de feedback como contenido de conocimiento.
- Si el usuario solicita borrar datos, remitir a la política/canal aplicable sin prometer una acción que el agente no puede realizar.

## Evidencia y pruebas

Casos asociados: T07, T08, U07, U08.

## Referencias

- [NIST AI RMF: Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [Reglamento (UE) 2016/679 — RGPD](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

