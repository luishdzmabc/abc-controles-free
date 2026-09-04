# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).


# Puente Python -> HOOT: lanza la suite JS del módulo en el runner /web/tests y espera la señal de que todo salio bien. 
# Se lo salta si el entorno de CI no trae navegador/websocket-client.


from odoo.tests import tagged
from odoo.tests.common import HttpCase


@tagged("post_install", "-at_install", "abc_group_tools_free")
class TestJsSuite(HttpCase):
    def test_hoot_suite(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop"
            "&filter=abc_group_tools_free",
            "",
            "",
            login="admin",
            timeout=300,
            success_signal="[HOOT] Test suite succeeded",
        )
