# ABC Dialog Resize (Free)

Hace **redimensionables** los diálogos modales del cliente web de Odoo 19.

## Qué hace

- Añade una agarradera en la esquina inferior derecha de cada diálogo. Arrástrala para cambiar el ancho y el alto del cuadro.
- **Recuerda el tamaño por usuario** (guardado en el navegador, namespaced por base de datos y usuario) y lo reaplica al abrir el siguiente diálogo del mismo tamaño base.
- El diálogo del core ya se puede **mover** arrastrando su cabecera; este gancho añade lo que faltaba: **redimensionar**.

## Cómo funciona

Frontend puro: un parche aditivo y reversible sobre el componente `Dialog` del core (`@web/core/dialog/dialog`). No hay modelos, no hay configuración, no toca el servidor. Reutiliza `applyPatchOnce` y `makeLocalStore` de `abc_web_utils`.

- El tamaño viaja por el getter `contentStyle` (estado reactivo OWL), así que los re-render del core —al mover la cabecera o apilar diálogos— no lo borran.
- La agarradera se inyecta en el DOM al montar, sin reescribir el template QWeb del core.

## Instalación

Depende de `web` y `abc_web_utils`. Instálalo y listo; para quitarlo, desinstálalo (solo son assets de frontend).

---

Parte de la línea de controles ABC (suite `abc_*`). Licencia LGPL-3.
