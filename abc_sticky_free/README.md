# ABC Sticky (Free) (`abc_sticky_free`)

Gancho **gratuito** que fija al hacer scroll los elementos de referencia de las vistas de Odoo 19:

- el **encabezado** de las vistas de lista (thead),
- el **pie de totales** de las vistas de lista (tfoot / agregados),
- la **barra de estado** (statusbar) de las vistas de formulario.

Módulo mínimo y ligero: **cero configuración**, cero modelos de negocio.
Se activa al instalar y no deja rastro al desinstalar (solo aporta assets de frontend). No cambia ningún dato ni comportamiento del servidor.

- **Autor:** ABC · **Versión:** 19.0.1.0.0
- **Depende de:** `web`, `abc_web_utils`

## Cómo funciona

Es **frontend puro**. Un parche aditivo y reversible sobre `ListRenderer` (vía `applyPatchOnce` de `abc_web_utils`) marca el nodo raíz de cada lista con la clase `o_abc_sticky`; una hoja de estilos acotada a esa clase fija el encabezado arriba y el pie de totales abajo. La barra de estado del formulario se fija por selector del core (`.o_form_statusbar`). No se reescribe ningún template de Odoo.

Todo actúa en pantallas de escritorio (≥ 768 px) para no alterar el layout táctil de móviles.

> Nota v19: el core de Odoo 19 ya fija el encabezado de lista y el statusbar en escritorio. Este gancho **añade el pie de totales fijo** (que el core no fija) y **garantiza** las otras dos también en listas embebidas (x2many) y ante temas que las hubieran desactivado.

## Testing

- `static/tests/sticky_list.test.js` — suite **HOOT**: monta una vista de lista y verifica que el parche aplica (clase `o_abc_sticky` presente) y que encabezado y pie existen para poder fijarse.
- `tests/test_js.py` — `HttpCase` que corre la suite HOOT en el navegador.

Ejecución:

```bash
odoo-bin -d <db> -i abc_sticky_free --test-enable --test-tags /abc_sticky_free --stop-after-init
```

## Parte de la línea de controles ABC

Este módulo pertenece a la línea de controles ABC para Odoo y comparte la infraestructura del paquete base `abc_web_utils`. La suite completa (ganchos gratuitos + controles comerciales) se distribuye bajo la marca `ABC` para Odoo 19.
