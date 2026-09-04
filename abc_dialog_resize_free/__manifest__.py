# Copyright (C) 2026 ABC (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
{
    "name": "ABC Dialog Resize (Free)",
    "summary": "Diálogos modales redimensionables que recuerdan su tamaño por usuario",
    "description": """
        Modulo gratuito de la línea de controles ABC.

        Hace **redimensionables** las ventanas de los diálogos modales del cliente web: aparece una agarradera en la esquina inferior derecha del cuadro; al arrastrarla el diálogo cambia de ancho y alto. 
        El tamaño elegido se **recuerda por usuario** y se reaplica la próxima vez que se abre un diálogo del mismo tamaño base.

        Módulo mínimo: cero configuración, cero modelos de negocio. Puro cambio visual, no cambia ningún dato ni comportamiento del ambiente. 
        Se activa al instalar y se desactiva al desinstalar.
    """,
    "version": "19.0.1.0.0",
    "category": "ABC/Free",
    "license": "LGPL-3",
    "author": "ABC",
    "website": "https://abcsas.com",
    "depends": [
        "web",
        "abc_web_utils",
    ],
    "assets": {
        "web.assets_backend": [
            "abc_dialog_resize_free/static/src/**/*",
        ],
        "web.assets_unit_tests": [
            "abc_dialog_resize_free/static/tests/**/*",
        ],
    },
    "installable": True,
    "application": False,
    "auto_install": False,
}
