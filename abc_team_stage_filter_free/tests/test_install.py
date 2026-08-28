# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""EN: browser-less smoke test (pattern C1, Python layer): this module is a
pure frontend hook, so the only server-side invariant is that it installs
cleanly and carries no business models or data.

ES: smoke test sin navegador (patron C1, capa Python): este modulo es un
gancho puro de frontend, asi que la unica invariante de servidor es que
instala limpio y no arrastra modelos de negocio ni datos.
"""

from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install", "abc_team_stage_filter_free")
class TestInstall(TransactionCase):
    def test_module_installed(self):
        module = self.env["ir.module.module"].search(
            [("name", "=", "abc_team_stage_filter_free")]
        )
        self.assertEqual(len(module), 1)
        self.assertEqual(module.state, "installed")

    def test_no_business_models(self):
        # EN: the hook declares no models of its own: zero data surface.
        # ES: el gancho no declara modelos propios: cero superficie de datos.
        leaked = self.env["ir.model"].search(
            [("model", "=like", "abc.team.stage%")]
        )
        self.assertFalse(
            leaked,
            "The free hook must not declare business models.",
        )
