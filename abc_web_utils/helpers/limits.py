# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""Guardrails de recursos (patrón C5).

Límites configurables por ``ir.config_parameter`` con defaults seguros y
topes duros que un administrador no puede rebasar. Un valor inválido,
vacío o no positivo cae SIEMPRE al default: la mala configuración nunca
desactiva un guardrail.

Convención de claves: ``abc_web_utils.limit_<nombre>`` — p. ej.
``abc_web_utils.limit_clipboard_max_rows``.
"""

PARAM_PREFIX = "abc_web_utils.limit_"

#: Defaults seguros. El portapapeles se acota a 500 filas x 50 columnas.
DEFAULT_LIMITS = {
    "clipboard_max_rows": 500,
    "clipboard_max_cols": 50,
    "clipboard_max_cell_chars": 5000,
}

#: Topes duros: aunque el parámetro pida más, nunca se rebasan.
HARD_CAPS = {
    "clipboard_max_rows": 5000,
    "clipboard_max_cols": 200,
    "clipboard_max_cell_chars": 100000,
}


def get_limit(env, name):
    """Devuelve el límite efectivo ``name``.

    Orden de resolución:
    1. ``ir.config_parameter`` ``abc_web_utils.limit_<name>`` si es un
       entero positivo válido (acotado por el tope duro).
    2. El default seguro de :data:`DEFAULT_LIMITS`.

    :raises KeyError: si ``name`` no es un límite conocido.
    """
    default = DEFAULT_LIMITS[name]
    raw = env["ir.config_parameter"].sudo().get_param(PARAM_PREFIX + name)
    try:
        value = int(str(raw).strip())
    except (TypeError, ValueError):
        return default
    if value <= 0:
        return default
    return min(value, HARD_CAPS.get(name, value))


def get_limits(env):
    """Devuelve el dict completo de límites efectivos.

    Es el payload que ``ir.http.session_info()`` expone al web client en
    ``abc_web_utils.settings.limits``.
    """
    return {name: get_limit(env, name) for name in DEFAULT_LIMITS}
