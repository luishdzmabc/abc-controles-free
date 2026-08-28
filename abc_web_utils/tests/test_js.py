# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""Puente Python -> HOOT (capa HttpCase del patrón C1): lanza la suite
JS del módulo en el runner /web/tests y espera la señal de éxito."""

from odoo.tests import tagged
from odoo.tests.common import HttpCase


@tagged("post_install", "-at_install", "abc_web_utils")
class TestJsSuite(HttpCase):
    def test_hoot_suite(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&filter=abc_web_utils",
            "",
            "",
            login="admin",
            timeout=300,
            success_signal="[HOOT] Test suite succeeded",
        )
