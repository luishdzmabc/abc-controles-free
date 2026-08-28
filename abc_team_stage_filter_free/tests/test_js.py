# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""EN: Python -> HOOT bridge (pattern C1, HttpCase layer): launches the
module's JS suite on the /web/tests runner and waits for the success signal.
Skipped only if the CI environment has no browser/websocket-client.

ES: puente Python -> HOOT (patron C1, capa HttpCase): lanza la suite JS del
modulo en el runner /web/tests y espera la senal de exito. Se omite solo si
el entorno de CI no trae navegador/websocket-client.
"""

from odoo.tests import tagged
from odoo.tests.common import HttpCase


@tagged("post_install", "-at_install", "abc_team_stage_filter_free")
class TestJsSuite(HttpCase):
    def test_hoot_suite(self):
        self.browser_js(
            "/web/tests?headless&loglevel=2&preset=desktop"
            "&filter=abc_team_stage_filter_free",
            "",
            "",
            login="admin",
            timeout=300,
            success_signal="[HOOT] Test suite succeeded",
        )
