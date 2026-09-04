# ABC Activity Board (Free) 

Modulo gratuito de la **línea de controles ABC** para Odoo 19 Community.
Parte de la línea de controles ABC (`abc_web_utils`, `abc_group_tools_free`, `abc_sticky_free`, `abc_row_colors_free`, ...).

- **Licencia:** LGPL-3 · **Autor:** ABC · **Versión:** 19.0.1.0.0
- **Depende de:** `mail`, `abc_web_utils`
- **Categoría:** ABC/Free · **Sin modelos nuevos · Sin settings**

## ¿Qué aporta?

Odoo 19 muestra actividades por registro (chatter) y por modelo (vista "Activities"), pero no hay un tablero único que junte las pendientes de todos los modelos. El único acceso multi-modelo es el menú Activities del correo, poco visible y sin agrupación útil.

Este modulo añade **un menú de nivel mas alto llamado "Mis actividades (ABC)"**, que abre un **tablero unificado** sobre `mail.activity`:

- Filtrado automáticamente a **tus** actividades.
- Vistas **lista**, **kanban** y **calendario** de las actividades pendientes.
- **Agrupable** por *Modelo*, *Tipo de actividad* o *Vencimiento*.
- Filtros rápidos: *Vencidas*, *Hoy*, *Planeadas*.
- Botón **Hecho** (marca la actividad como realizada) y **Abrir documento** directo desde la lista.

Todo es **aditivo**: no declara modelos propios, no toca ningún comportamiento existente y no tiene configuración. Desinstalarlo no deja rastro.

## Instalación

```
odoo -d <db> -i abc_activity_board_free

Odoo ya le da permiso a cualquier usuario normal para ver y editar sus actividades pendientes. Por eso el módulo no tiene que agregar ningún permiso nuevo: usa el que ya existía.
