# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
{
    "name": "ABC Group Tools (Free)",
    "summary": "Expand all / collapse all buttons and per-group record "
    "counters on grouped list and kanban views",
    "description": """
        Free convenience module for grouped views (part of the ABC controls line):

        * Adds "Expand all" / "Collapse all" buttons on any grouped list or kanban view, so you fold/unfold every group with a single click instead of one by one.
        * Adds an ABC record-count pill badge on each group header (list group rows and kanban columns).

        Pure design: installing it changes no default behavior beyond the two buttons and the badge,
        and it has zero settings. Uninstalling leaves no trace.

        ---

        Modulo gratuito de conveniencia para vistas agrupadas (parte de la línea de controles ABC):

        * Agrega botones "Expandir todo" / "Colapsar todo" en cualquier vista de lista o kanban agrupada, para plegar/desplegar todos los grupos con un solo clic en vez de uno por uno.
        * Agrega una píldora con el conteo de registros de marca ABC en cada encabezado de grupo (filas de grupo en lista y columnas en kanban).

        Puramente diseno: instalarlo no cambia ningún comportamiento por defecto más allá de los dos botones y la píldora, y no tiene ajustes. Desinstalarlo no deja rastro.
    """,
    "version": "19.0.1.0.0",
    "category": "ABC/Free",
    "license": "LGPL-3",
    "author": "ABC S&S",
    "website": "https://abcsas.com",
    "depends": [
        "web",
        "abc_web_utils",
    ],
    "assets": {
        "web.assets_backend": [
            (
                "after",
                "/web/static/src/views/list/list_renderer.js",
                "abc_group_tools_free/static/src/views/list/list_renderer.js",
            ),
            (
                "after",
                "/web/static/src/views/list/list_renderer.xml",
                "abc_group_tools_free/static/src/views/list/list_renderer.xml",
            ),
            (
                "after",
                "/web/static/src/views/kanban/kanban_renderer.js",
                "abc_group_tools_free/static/src/views/kanban/kanban_renderer.js",
            ),
            (
                "after",
                "/web/static/src/views/kanban/kanban_renderer.xml",
                "abc_group_tools_free/static/src/views/kanban/kanban_renderer.xml",
            ),
            "abc_group_tools_free/static/src/views/group_tools.scss",
        ],
        "web.assets_unit_tests": [
            "abc_group_tools_free/static/tests/**/*.test.js",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
