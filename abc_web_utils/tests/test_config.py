# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""Tests de la capa de configuración: guardrails, toggles y el payload
que session_info() expone al web client (patrones A4/B5/C5, capa
TransactionCase del patrón C1)."""

from odoo.tests import tagged
from odoo.tests.common import TransactionCase

from odoo.addons.abc_web_utils.helpers import limits as limits_helper
from odoo.addons.abc_web_utils.hooks import uninstall_hook


@tagged("abc_web_utils")
class TestLimits(TransactionCase):
    """Guardrails de recursos (patrón C5)."""

    def _set_param(self, name, value):
        self.env["ir.config_parameter"].sudo().set_param(
            limits_helper.PARAM_PREFIX + name, value
        )

    def test_defaults_when_unset(self):
        for name, default in limits_helper.DEFAULT_LIMITS.items():
            self.assertEqual(limits_helper.get_limit(self.env, name), default)

    def test_default_values_are_the_agreed_guardrails(self):
        self.assertEqual(limits_helper.DEFAULT_LIMITS["clipboard_max_rows"], 500)
        self.assertEqual(limits_helper.DEFAULT_LIMITS["clipboard_max_cols"], 50)

    def test_valid_override(self):
        self._set_param("clipboard_max_rows", "100")
        self.assertEqual(
            limits_helper.get_limit(self.env, "clipboard_max_rows"), 100
        )

    def test_invalid_values_fall_back_to_default(self):
        for bad in ("abc", "", "  ", "12.5", "-3", "0"):
            self._set_param("clipboard_max_rows", bad)
            self.assertEqual(
                limits_helper.get_limit(self.env, "clipboard_max_rows"),
                limits_helper.DEFAULT_LIMITS["clipboard_max_rows"],
                "el valor %r debe caer al default" % bad,
            )

    def test_hard_cap_is_enforced(self):
        self._set_param("clipboard_max_rows", "999999")
        self.assertEqual(
            limits_helper.get_limit(self.env, "clipboard_max_rows"),
            limits_helper.HARD_CAPS["clipboard_max_rows"],
        )

    def test_unknown_limit_raises(self):
        with self.assertRaises(KeyError):
            limits_helper.get_limit(self.env, "no_such_limit")

    def test_get_limits_returns_all(self):
        limits = limits_helper.get_limits(self.env)
        self.assertEqual(set(limits), set(limits_helper.DEFAULT_LIMITS))


@tagged("abc_web_utils")
class TestToggleHelpers(TransactionCase):
    """Helpers genéricos de toggles en res.config.settings (patrón A4)."""

    def setUp(self):
        super().setUp()
        self.config = self.env["res.config.settings"]
        self.icp = self.env["ir.config_parameter"].sudo()

    def test_bool_param_variants(self):
        key = "abc_web_utils.test_toggle"
        for raw, expected in [
            ("True", True),
            ("true", True),
            ("1", True),
            ("on", True),
            ("yes", True),
            ("False", False),
            ("false", False),
            ("0", False),
            ("off", False),
            ("no", False),
        ]:
            self.icp.set_param(key, raw)
            self.assertEqual(
                self.config.abc_get_bool_param(key), expected,
                "valor crudo %r" % raw,
            )

    def test_bool_param_missing_or_garbage_uses_default(self):
        key = "abc_web_utils.test_toggle_missing"
        self.assertFalse(self.config.abc_get_bool_param(key))
        self.assertTrue(self.config.abc_get_bool_param(key, default=True))
        self.icp.set_param(key, "quizas")
        self.assertTrue(self.config.abc_get_bool_param(key, default=True))
        self.assertFalse(self.config.abc_get_bool_param(key, default=False))

    def test_set_bool_param_normalizes(self):
        key = "abc_web_utils.test_toggle_set"
        self.config.abc_set_bool_param(key, 1)
        self.assertEqual(self.icp.get_param(key), "True")
        self.config.abc_set_bool_param(key, False)
        self.assertEqual(self.icp.get_param(key), "False")

    def test_int_param(self):
        key = "abc_web_utils.test_int"
        self.assertEqual(self.config.abc_get_int_param(key, 7), 7)
        self.icp.set_param(key, " 42 ")
        self.assertEqual(self.config.abc_get_int_param(key), 42)
        self.icp.set_param(key, "nan")
        self.assertEqual(self.config.abc_get_int_param(key, 7), 7)

    def test_settings_fields_persist_parameters(self):
        settings = self.config.create({"abc_limit_clipboard_max_rows": 200})
        settings.execute()
        self.assertEqual(
            limits_helper.get_limit(self.env, "clipboard_max_rows"), 200
        )


@tagged("abc_web_utils")
class TestSessionInfoPayload(TransactionCase):
    """Payload abc_web_utils.settings propagado por session_info (B5)."""

    def test_payload_structure(self):
        payload = self.env["ir.http"]._abc_web_utils_settings()
        self.assertIn("limits", payload)
        self.assertEqual(set(payload["limits"]), set(limits_helper.DEFAULT_LIMITS))

    def test_payload_reflects_parameter_overrides(self):
        self.env["ir.config_parameter"].sudo().set_param(
            limits_helper.PARAM_PREFIX + "clipboard_max_cols", "20"
        )
        payload = self.env["ir.http"]._abc_web_utils_settings()
        self.assertEqual(payload["limits"]["clipboard_max_cols"], 20)

    def test_base_module_declares_no_toggles(self):
        # Regla C3: el módulo base no activa ningún comportamiento.
        self.assertEqual(self.env["ir.http"]._abc_web_utils_toggles(), {})

    def test_session_info_is_extended_by_this_module(self):
        # session_info() completo requiere un request HTTP; aquí se
        # verifica que el override de este módulo está en el MRO del
        # modelo registrado (el HttpCase de test_js cubre el arranque
        # real del web client con el payload incluido).
        cls = type(self.env["ir.http"])
        overriding = [
            base.__module__
            for base in cls.mro()
            if "session_info" in vars(base)
        ]
        self.assertTrue(
            any("abc_web_utils" in module for module in overriding),
            "abc_web_utils debe sobreescribir ir.http.session_info()",
        )


@tagged("abc_web_utils")
class TestUninstallCleanup(TransactionCase):
    """uninstall_hook limpia el namespace de parámetros (patrón A10)."""

    def test_uninstall_hook_removes_namespaced_parameters(self):
        icp = self.env["ir.config_parameter"].sudo()
        icp.set_param("abc_web_utils.limit_clipboard_max_rows", "123")
        icp.set_param("abc_web_utils.test_toggle", "True")
        icp.set_param("otro_modulo.parametro_ajeno", "intacto")
        # Namespace "parecido": sin escapar los '_' del patrón LIKE
        # ('_' = comodín de un carácter) este parámetro sería borrado.
        icp.set_param("abcXwebYutils.parametro_ajeno", "intacto")

        uninstall_hook(self.env)

        self.assertFalse(icp.get_param("abc_web_utils.limit_clipboard_max_rows"))
        self.assertFalse(icp.get_param("abc_web_utils.test_toggle"))
        self.assertEqual(icp.get_param("otro_modulo.parametro_ajeno"), "intacto")
        self.assertEqual(icp.get_param("abcXwebYutils.parametro_ajeno"), "intacto")
