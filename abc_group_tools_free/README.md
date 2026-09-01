# ABC Group Tools (Free) (`abc_group_tools_free`)

Gancho gratuito de la **línea de controles ABC** para Odoo 19 Community. Añade dos comodidades a las vistas **agrupadas**, sin ninguna configuración:

- Botones **Expand all / Collapse all** en listas y kanban agrupados: pliega o despliega todos los grupos de un clic, en vez de uno por uno.
- Una **píldora con el conteo de registros** por grupo (encabezado de grupo en lista y columna en kanban), con la marca ABC.

- **Licencia:** LGPL-3 · **Autor:** ABC · **Versión:** 19.0.1.0.0
- **Depende de:** `web`, `abc_web_utils`

## Cómo funciona

Es **frontend puro y aditivo**: parchea `ListRenderer` y `KanbanRenderer` del core reutilizando `applyPatchOnce` de `abc_web_utils` (patches reversibles, un solo `patch()` por objetivo) y hereda las plantillas del core con `t-inherit` en modo `extension`. No sobreescribe ningún método nativo, no declara modelos de negocio y **no tiene ajustes**: se activa al instalar y desinstalar no deja rastro.

Puntos de anclaje verificados contra la imagen `odoo:19.0`:

| Plantilla del core | Qué se añade |
|---|---|
| `web.ListRenderer` | barra de botones antes de `<table t-ref="table">` (solo si `props.list.isGrouped`) |
| `web.ListRenderer.GroupRow` | píldora de conteo tras el `o_group_caret` |
| `web.KanbanRenderer` | barra de botones dentro de `o_kanban_renderer` |
| `web.KanbanHeader` | píldora de conteo tras el título de la columna |

Ambos renderers exponen el mismo contrato (`props.list.groups`, `group.isFolded`, `group.toggle()`), así que expandir/colapsar recorre los grupos de primer nivel y alterna solo los que hacen falta.

## Testing

- `static/tests/group_tools.test.js` — suite **HOOT**: monta lista y kanban agrupados con `mountView` y verifica que el patch aplica (botones + píldora) y que expandir/colapsar todo opera sobre los grupos.
- `tests/test_js.py` — `HttpCase` que corre la suite HOOT en el navegador.
- `tests/test_install.py` — smoke `TransactionCase` sin navegador.

```bash
odoo-bin -d <db> -i abc_group_tools_free \
    --test-enable --test-tags /abc_group_tools_free --stop-after-init
```

## Parte de la línea de controles ABC

Este es un control **gratuito (gancho)** de la suite ABC. Comparte la infraestructura común del módulo base `abc_web_utils` con el resto de controles de pago de la línea (por ejemplo `abc_list_totals` `abc_kanban_designer`). Escríbenos en `https://abcsas.com`.
