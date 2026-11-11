# Tema 05 — Higiene de accesos y MFA

## Propósito

Explicar principios generales de protección de cuentas: contraseñas únicas, gestores aprobados, autenticación multifactor y revisión por los procedimientos de la organización. No restablece, desbloquea ni verifica cuentas.

## Disparadores sugeridos

- «MFA», «doble factor», «contraseña segura», «gestor de contraseñas».
- «me han pedido el código», «no puedo entrar», «compartir contraseña».

## Variables lógicas

| Variable | Tipo | Uso |
|---|---|---|
| pregunta_cuenta | Booleano | Activa aviso de no compartir secretos |
| posible_compromiso | Booleano | Pasa a tema 03 |
| contexto_producto | Texto limitado | Solo para elegir fuente aprobada, no para solicitar identidad |

## Flujo de diseño

Cuando la consulta es sobre acceso:

1. Mostrar el aviso de que no se compartan contraseñas, códigos MFA, tokens ni datos de recuperación.
2. Explicar que MFA añade un factor de verificación; no prometer que elimina todo riesgo.
3. Recomendar seguir la política de identidad de la organización y usar mecanismos aprobados, sin dar pasos de administración.
4. Si la pregunta describe credenciales entregadas a terceros, una solicitud de código inesperada o una cuenta posiblemente comprometida, activar tema 03.
5. Si pide saltar MFA, recuperar acceso ajeno o evitar controles, activar tema 07.
6. Citar una fuente de marco/riesgo o documentación oficial del producto si está incorporada en el corpus.

## Mensaje base

«La autenticación multifactor añade una comprobación adicional a la contraseña y forma parte de una estrategia de protección de cuentas; no sustituye las políticas y procedimientos de tu organización. No compartas contraseñas, códigos MFA, tokens ni datos de recuperación en este chat. Si crees que una cuenta puede estar comprometida, sigue el procedimiento de incidentes de tu organización.»

## Criterios de salida segura

- No pedir ni validar códigos, contraseñas, direcciones de correo, números de teléfono ni métodos de recuperación.
- No indicar cómo eludir MFA, bloqueo, control de acceso o verificación de identidad.
- No afirmar que una configuración concreta está activa sin una fuente y acceso autorizado.
- No simular un proceso de restablecimiento.

## Evidencia y pruebas

Casos asociados: A01-A10, I04, S06, T04.

## Referencias

- [NIST Cybersecurity Framework 2.0](https://doi.org/10.6028/NIST.CSWP.29)
- [Microsoft Learn — Authentication methods and MFA](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-mfa-howitworks)

