# Copyright (C) 2026 ABC (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
{
    "name": "ABC Activity Board (Free)",
    "summary": "Unified board of all your pending activities (mail.activity) "
    "across every model in a single view",
    "description": """
Free convenience hook (part of the ABC controls line):

Odoo core gives you activities per record and an "Activities" view per model,
but not an easy single board that unifies the pending activities of ALL models
at once. This gancho adds one menu, "Mis actividades (ABC)", that opens a
unified list / kanban / calendar over ``mail.activity`` filtered to the current
user, groupable by document model, activity type or deadline, with a one-click
"Mark done".

Purely additive: no new models, no settings. It only adds one action, one menu
and a handful of views over the existing ``mail.activity`` model. Uninstalling
leaves no trace.
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
