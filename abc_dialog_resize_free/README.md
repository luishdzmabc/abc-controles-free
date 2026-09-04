# ABC Dialog Resize (Free)

Hace **redimensionables** los diálogos modales del cliente web de Odoo 19.

## Qué hace

- Añade una agarradera en la esquina inferior derecha de cada diálogo. Arrástrala para cambiar el ancho y el alto del cuadro.
- **Recuerda el tamaño por usuario** (guardado en el navegador, namespaced por base de datos y usuario) y lo reaplica al abrir el siguiente diálogo del mismo tamaño base.
- El diálogo de odoo base ya se puede **mover** arrastrando su cabecera; este modulo añade lo que faltaba: **redimensionar**.

## Cómo funciona

Un cambio solamente de apariencia: un parche anadido y reversible sobre las ventanas emergentes del core. No toca el sistema ni la base de datos y se puede quitar sin dejar rastro.

El tamaño que elige el usuario queda guardado en la memoria de la
ventana, así que no se borra aunque la pantalla se vuelva a dibujar. Y la manija para cambiar el tamaño se agrega por fuera, sin modificar el diseño original de la ventana.

## Instalación

Depende de los paquetes `web` y `abc_web_utils`. Instálalo y listo; para quitarlo, desinstálalo.

---

Parte de la línea de controles ABC (suite `abc_*`). Licencia LGPL-3.
