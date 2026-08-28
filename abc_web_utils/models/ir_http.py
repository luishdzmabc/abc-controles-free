# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""Puente backend -> frontend vía ``session_info()`` (patrones A4/B5).

Toda la configuración de la línea ABC viaja al web client en el payload
de arranque bajo la clave ``abc_web_utils.settings`` — cero RPCs extra.

Los módulos hijos NO sobreescriben ``session_info()``: extienden el punto
de extensión ``_abc_web_utils_toggles()`` (o, para payloads no booleanos,
``_abc_web_utils_settings()``) llamando a ``super()``.
"""

from odoo import models

from ..helpers import limits as limits_helper


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def _abc_web_utils_toggles(self):
        """Punto de extensión: toggles a propagar al web client.

        Devuelve un dict ``{clave_de_sesion: (config_parameter, default)}``.
        El módulo base no declara ninguno (regla C3: instalarlo no cambia
        ningún comportamiento). Ejemplo en un módulo hijo::

            def _abc_web_utils_toggles(self):
                toggles = super()._abc_web_utils_toggles()
                toggles["sticky_headers"] = (
                    "abc_list_sticky.enabled", False)
                return toggles
        """
        return {}

    def _abc_web_utils_settings(self):
        """Construye el payload ``abc_web_utils.settings``."""
        config = self.env["res.config.settings"]
        settings = {
            "limits": limits_helper.get_limits(self.env),
        }
        for key, (parameter, default) in self._abc_web_utils_toggles().items():
            settings[key] = config.abc_get_bool_param(parameter, default)
        return settings

    def session_info(self):
        result = super().session_info()
        result["abc_web_utils.settings"] = self._abc_web_utils_settings()
        return result
