# Copyright (C) 2026 ABC (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
{
    "name": "ABC Activity Board (Free)",
    "summary": "Unified board of all your pending activities (mail.activity) "
    "across every model in a single view",
    "description": """
        Free convenience module (part of the ABC controls line):

        Odoo core gives you activities per record and an "Activities" view per model, but not an easy single board that unifies the pending activities of ALL 
        models at once. This hook adds one menu, "Mis actividades (ABC)", that opens a unified list / kanban / calendar filtered to the current user, 
        groupable by document model, activity type or deadline, with a one-click "Mark done".

        Purely additive: no new models, no settings. It only adds one action, one menu and a handful of views. Uninstalling leaves no trace.

        ---
        Modulo de conveniencia gratuito (parte de la linea de controles de ABC)
        
        El core de Odoo te da actividades por registro y una vista "Activities" por modelo, pero no un tablero único sencillo que unifique las actividades pendientes de TODOS
        los modelos a la vez. Este hook agrega un menú, "Mis actividades (ABC)", que abre una lista / kanban / calendario unificados filtrados al usuario actual,
        agrupable por modelo de documento, tipo de actividad o fecha límite, con un botón de un clic "Marcar hecho".

        Puramente aditivo: sin modelos nuevos, sin ajustes. Solo agrega una acción, un menú y un puñado de vistas. Desinstalarlo no deja rastro.
    """,
    "version": "19.0.1.0.0",
    "category": "ABC/Free",
    "license": "LGPL-3",
    "author": "ABC",
    "website": "https://abcsas.com",
    "depends": [
        "mail",
        "abc_web_utils",
    ],
    "data": [
        "views/abc_activity_board_views.xml",
    ],
    "installable": True,
    "application": False,
    "auto_install": False,
}
