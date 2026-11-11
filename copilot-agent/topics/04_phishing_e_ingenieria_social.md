# Tema 04 — Phishing e ingeniería social

## Propósito

Explicar qué es el phishing, promover comprobaciones preventivas de bajo riesgo y derivar un posible engaño al flujo de escalado. El tema no analiza enlaces, adjuntos, dominios, correos reales ni códigos.

## Disparadores sugeridos

- «phishing», «correo sospechoso», «enlace raro», «suplantación», «fraude».
- «me piden mi contraseña», «me llega un correo del banco», «SMS sospechoso».

## Variables lógicas

| Variable | Tipo | Uso |
|---|---|---|
| es_posible_incidente | Booleano | Si hubo interacción o exposición, pasar a tema 03 |
| tipo_mensaje | Enumeración | correo, sms, llamada, web, desconocido |
| solicita_secreto | Booleano | Mostrar aviso de no compartir datos |

## Flujo de diseño

Cuando el dominio es phishing o ingeniería social:

1. Definirlo de forma breve usando la fuente INCIBE.
2. Explicar señales generales: urgencia inusual, solicitud de datos, suplantación o enlaces/adjuntos inesperados. No clasificar un ejemplo real como legítimo o malicioso.
3. Recomendar verificar por un canal oficial independiente y evitar compartir credenciales en el chat.
4. Si el usuario indica que introdujo datos, pulsó un enlace o descargó algo, activar tema 03.
5. Citar la página oficial de INCIBE y, si se habla de empresa/incidente, la guía de crisis.

## Mensaje base

«El phishing busca suplantar a una entidad para obtener información o inducir acciones inseguras. Desconfía de mensajes inesperados que urgen a actuar o piden datos, y verifica la comunicación mediante el canal oficial de la entidad, no respondiendo al propio mensaje. Fuente: INCIBE — Phishing. No introduzcas contraseñas, códigos MFA, claves ni datos personales en este chat.»

## Criterios de salida segura

- No abrir, analizar ni solicitar adjuntos o enlaces del usuario.
- No pedir que copie cabeceras de correo, datos bancarios, teléfonos o información de cuenta.
- No confirmar que una marca, correo o URL concretos son seguros.
- No proporcionar pautas para suplantar identidades, evadir filtros o diseñar campañas.

## Evidencia y pruebas

Casos asociados: P01-P10, I01-I03, S05.

## Referencias

- [INCIBE — Phishing](https://www.incibe.es/aprendeciberseguridad/phishing)
- [INCIBE — Guía de gestión de crisis de ciberseguridad en empresas](https://www.incibe.es/sites/default/files/contenidos/guias/doc/guia_gestion_de_crisis.pdf)

