# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
{
    "name": "ABC Web Utils",
    "summary": "Infraestructura compartida de la línea UI de ABC (sin features visibles)",
    "description": """
Caja de herramientas técnica para los controles web de ABC:
helpers de patch() aditivo, persistencia localStorage namespaced,
parseo de portapapeles Excel (TSV/HTML), servicio de overlay de progreso,
registro extensible de visores por mimetype, capa de configuración vía
ir.config_parameter + session_info() y guardrails de recursos.

Instalar este módulo NO cambia ningún comportamiento por defecto.
    """,
    "version": "19.0.1.0.1",
    "category": "Tools",
    "license": "LGPL-3",
    "author": "ABC S&S",
    "website": "https://abcsas.com",
    "depends": [
        "web",
        "base_setup",
    ],
    "assets": {
        "web.assets_backend": [
            "abc_web_utils/static/src/core/**/*",
            "abc_web_utils/static/src/services/**/*",
        ],
        "web.assets_unit_tests": [
            "abc_web_utils/static/tests/**/*",
        ],
    },
    "images": ["static/description/icon.png"],
    "uninstall_hook": "uninstall_hook",
    "installable": True,
    "application": False,
    "auto_install": False,
}
