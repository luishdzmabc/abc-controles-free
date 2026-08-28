# abc-controles-free

Controles gratuitos (LGPL-3) de **ABC S&S** para Odoo 19, listos para
publicarse en [apps.odoo.com](https://apps.odoo.com). Repo separado del
catálogo comercial de ABC — aquí solo vive lo que se regala.

Rama de publicación: **`19.0`** (debe coincidir exactamente con la serie
de Odoo, es lo que exige apps.odoo.com al registrar el repositorio).

## Módulos

| Módulo | Qué hace | Depende de |
|---|---|---|
| [`abc_web_utils`](abc_web_utils) | Infraestructura compartida (parches aditivos, `localStorage` namespaced, parseo de portapapeles, overlay de progreso). Sin funciones visibles propias — es la base que usa el resto de la línea. | `web`, `base_setup` |
| [`abc_team_stage_filter_free`](abc_team_stage_filter_free) | Selector de equipo en el Kanban (p. ej. Pipeline de CRM) que limita el tablero — registros y columnas de etapa — al equipo elegido. | `web`, `crm`, `abc_web_utils` |

## Licencia

LGPL-3 (ver [`LICENSE`](LICENSE)). Cada módulo trae su propio
encabezado de copyright.

## Publicación en la tienda

1. `abc_web_utils` se registra primero (o junto) — `abc_team_stage_filter_free` depende de él.
2. En [apps.odoo.com/apps/upload](https://apps.odoo.com/apps/upload), registrar:
   `ssh://git@github.com/luishdzmabc/abc-controles-free.git#19.0`
