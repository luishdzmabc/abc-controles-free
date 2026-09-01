# ABC Activity Board (Free) (`abc_activity_board_free`)

Gancho gratuito de la **línea de controles ABC** para Odoo 19 Community.
Parte de la línea de controles ABC (suite `abc_web_utils`, `abc_group_tools_free`,
`abc_sticky_free`, `abc_row_colors_free`, ...).

- **Licencia:** LGPL-3 · **Autor:** ABC · **Versión:** 19.0.1.0.0
- **Depende de:** `mail`, `abc_web_utils`
- **Categoría:** ABC/Free · **Sin modelos nuevos · Sin settings**

## ¿Qué aporta? (delta sobre el core)

El core de Odoo 19 muestra actividades **por registro** (chatter) y ofrece la
vista "Activities" **por modelo**, pero **no** un tablero único que junte las
actividades pendientes de **todos** los modelos a la vez de forma sencilla.
El único acceso multi-modelo del core es el menú *Activities* del sistema de
correo, poco visible y sin agrupación práctica.

Este gancho añade **un menú de nivel superior, "Mis actividades (ABC)"**, que
abre un **tablero unificado** sobre `mail.activity`:

- Filtrado automáticamente a **tus** actividades (`user_id = usuario actual`).
- Vistas **lista**, **kanban** y **calendario** de las actividades pendientes.
- **Agrupable** por *Modelo* (`res_model_id`), *Tipo de actividad*
  (`activity_type_id`) o *Vencimiento* (`date_deadline`).
- Filtros rápidos: *Vencidas*, *Hoy*, *Planeadas*.
- Botón **Hecho** (marca la actividad como realizada, `action_done`) y
  **Abrir documento** (`action_open_document`) directo desde la lista.

Todo es **puramente aditivo**: no declara modelos propios, no toca ningún
comportamiento existente y no tiene configuración. Desinstalarlo no deja rastro.

## Campos de `mail.activity` usados

| Campo | Tipo | Uso en el tablero |
|---|---|---|
| `res_model_id` / `res_model` | Many2one `ir.model` / Char | Agrupar/mostrar el modelo origen |
| `res_id` | Many2oneReference | Abrir el documento vinculado |
| `res_name` | Char (compute, store) | Nombre del documento |
| `activity_type_id` | Many2one `mail.activity.type` | Tipo, ícono, color |
| `date_deadline` | Date | Vencimiento (lista/kanban/calendario) |
| `user_id` | Many2one `res.users` | Filtro por usuario actual |
| `state` | Selection (compute) | Semáforo overdue/today/planned |
| `summary` | Char | Título de la actividad |

## Instalación

```
odoo -d <db> -i abc_activity_board_free
```

El acceso a `mail.activity` ya lo concede el core a `base.group_user`
(lectura/escritura), así que el gancho no añade reglas de seguridad propias.
