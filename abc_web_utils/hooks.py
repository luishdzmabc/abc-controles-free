# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""Hooks de ciclo de vida del módulo (patrón A10).

Regla de la línea ABC: instalar/desinstalar sin dejar rastro. Al
desinstalar se eliminan todos los ``ir.config_parameter`` del namespace
``abc_web_utils.`` que este módulo (o un administrador) haya creado.
"""

import logging

_logger = logging.getLogger(__name__)

# En SQL LIKE, '_' es comodín de un carácter: se escapa con '\' para que
# el patrón solo empareje el namespace literal 'abc_web_utils.' y no borre
# parámetros de namespaces ajenos con forma similar (p. ej. 'abcXwebYutils.').
PARAMETER_NAMESPACE = r"abc\_web\_utils.%"


def uninstall_hook(env):
    """Limpia los parámetros de sistema del namespace del módulo."""
    parameters = (
        env["ir.config_parameter"]
        .sudo()
        .search([("key", "=like", PARAMETER_NAMESPACE)])
    )
    if parameters:
        _logger.info(
            "abc_web_utils: eliminando %s parámetro(s) de sistema al desinstalar: %s",
            len(parameters),
            ", ".join(parameters.mapped("key")),
        )
        parameters.unlink()
