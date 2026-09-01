# Copyright (C) 2026 ABC (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).

#Puente Python -> HOOT: lanza la suite JS del gancho de dialogos redimensionables en el runner /web/tests y espera la senal de exito.

from odoo.tests import tagged
from odoo.tests.common import HttpCase


@tagged("post_install", "-at_install", "abc_dialog_resize_free")
class TestJsSuite(HttpCase):
    def test_hoot_suite(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop&filter=abc_dialog_resize_free",
            "",
            "",
            login="admin",
            timeout=300,
            success_signal="[HOOT] Test suite succeeded",
        )
