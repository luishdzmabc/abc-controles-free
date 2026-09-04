# ABC Sticky (Free)

Modulo **gratuito** que fija al hacer scroll los elementos de referencia de las vistas de Odoo 19:

- el **encabezado** de las vistas de lista,
- el **pie de totales** de las vistas de lista,
- la **barra de estado** (statusbar) de las vistas de formulario.

Mínimo y ligero: **cero configuración**, cero modelos de negocio.
Se activa al instalar y no deja rastro al desinstalar. No cambia ningún dato ni comportamiento del servidor.

- **Licencia:** LGPL-3 · **Autor:** ABC · **Versión:** 19.0.1.0.0
- **Depende de:** `web`, `abc_web_utils`

## Cómo funciona

Este módulo solo cambia lo que se ve en pantalla. Le agrega, sin tocar nada por dentro, un comportamiento extra a las listas y a los formularios: cuando haces scroll, el título de la lista, el renglón de totales y la barra de estado del formulario se quedan pegados en su lugar en vez de desaparecer.

Todo actúa en pantallas de escritorio (≥ 768 px) para no alterar el formato táctil de móviles.

> Nota v19: el core de Odoo 19 ya fija el encabezado de lista y el statusbar en escritorio. Este modulo solo **añade el pie de totales fijo** (que odoo estandar no fija) y **garantiza** las otras dos también en listas embebidas y sobre temas que las hubieran desactivado.

## Testing

Incluye pruebas que revisan que el módulo funcione: una que confirma que pueda "quedarse fijo" y que se activa correctamente en una lista de ejemplo, y otra que corre una revisión dentro de un navegador real para confirmar que también funciona en la práctica.

Ejecución:

```bash
odoo-bin -d <db> -i abc_sticky_free --test-enable --test-tags /abc_sticky_free --stop-after-init
```

## Parte de la línea de controles ABC

Este módulo pertenece a la línea de controles ABC para Odoo y comparte infraestructura con el paquete base `abc_web_utils`. El paquete de modulos completo (modulos gratuitos + controles comerciales) se distribuye bajo la marca `ABC` para Odoo 19.
