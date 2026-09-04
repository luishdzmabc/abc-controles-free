# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
{
    "name": "ABC Sticky (Free)",
    "summary": "Sticky list headers and footers + sticky form status bar on scroll",
    "description": """
        Modulo gratuito de la línea de controles ABC.

        Fija al hacer scroll:

        * el **encabezado** de las vistas de lista,
        * el **pie de totales** de las vistas de lista,
        * la **barra de estado** de las vistas de formulario.

        Cero configuración, cero modelos de negocio. Se activa al instalar y se desactiva al desinstalar. No cambia ningún dato ni comportamiento externo.

        ---

        Free module of the ABC controls line.

        Sticks in place on scroll:

        * the **header** of list views,
        * the **totals footer** of list views,
        * the **status bar** of form views.

        Zero configuration, zero business models. It activates on install and deactivates on uninstall. It does not change any external data or behavior.
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
            "abc_sticky_free/static/src/**/*",
        ],
        "web.assets_unit_tests": [
            "abc_sticky_free/static/tests/**/*",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
