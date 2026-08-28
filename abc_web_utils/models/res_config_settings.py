# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""Capa de configuración unificada de la línea ABC (patrón A4).

Este modelo NO agrega ninguna opción visible en Ajustes (regla C3: el
módulo base no cambia comportamientos). Aporta:

* Campos transient con ``config_parameter`` para los guardrails, de modo
  que los módulos hijos puedan exponerlos en su propia vista de Ajustes
  sin redeclararlos.
* Helpers genéricos ``abc_get_*_param`` / ``abc_set_bool_param`` para que
  cualquier control ABC lea/escriba sus toggles con semántica uniforme
  (default seguro ante valores ausentes o corruptos).
"""

from odoo import api, fields, models
from odoo.tools import str2bool

from ..helpers import limits as limits_helper


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    abc_limit_clipboard_max_rows = fields.Integer(
        string="ABC: Max Rows Pasted from Clipboard",
        config_parameter="abc_web_utils.limit_clipboard_max_rows",
        default=limits_helper.DEFAULT_LIMITS["clipboard_max_rows"],
        help="Guardrail C5. Empty or invalid = safe default (500). "
        "Hard cap: 5000.",
    )
    abc_limit_clipboard_max_cols = fields.Integer(
        string="ABC: Max Columns Pasted from Clipboard",
        config_parameter="abc_web_utils.limit_clipboard_max_cols",
        default=limits_helper.DEFAULT_LIMITS["clipboard_max_cols"],
        help="Guardrail C5. Empty or invalid = safe default (50). "
        "Hard cap: 200.",
    )
    abc_limit_clipboard_max_cell_chars = fields.Integer(
        string="ABC: Max Characters per Pasted Cell",
        config_parameter="abc_web_utils.limit_clipboard_max_cell_chars",
        default=limits_helper.DEFAULT_LIMITS["clipboard_max_cell_chars"],
        help="Guardrail C5. Empty or invalid = safe default (5000). "
        "Hard cap: 100000.",
    )

    # ------------------------------------------------------------------
    # Helpers genéricos de toggles/parámetros (para todos los controles)
    # ------------------------------------------------------------------

    @api.model
    def abc_get_param(self, key, default=""):
        """Lee un ``ir.config_parameter`` crudo con default."""
        return self.env["ir.config_parameter"].sudo().get_param(key, default)

    @api.model
    def abc_get_bool_param(self, key, default=False):
        """Lee un toggle booleano de forma tolerante.

        Acepta las variantes usuales ('1'/'0', 'True'/'False', 'yes'/'no',
        'on'/'off'). Valor ausente, vacío o corrupto devuelve ``default``
        — un toggle mal capturado jamás activa un feature por accidente.
        """
        raw = self.env["ir.config_parameter"].sudo().get_param(key)
        if raw in (False, None, ""):
            return bool(default)
        try:
            return str2bool(str(raw).strip().lower())
        except ValueError:
            return bool(default)

    @api.model
    def abc_get_int_param(self, key, default=0):
        """Lee un parámetro entero con default ante valores inválidos."""
        raw = self.env["ir.config_parameter"].sudo().get_param(key)
        try:
            return int(str(raw).strip())
        except (TypeError, ValueError):
            return default

    @api.model
    def abc_set_bool_param(self, key, value):
        """Escribe un toggle booleano de forma normalizada ('True'/'False')."""
        self.env["ir.config_parameter"].sudo().set_param(
            key, "True" if value else "False"
        )
