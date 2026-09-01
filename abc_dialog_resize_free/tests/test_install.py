# Copyright (C) 2026 ABC (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).

#Smoke test sin navegador: El módulo es gancho puro de frontend, así que la única invariante de servidor es que instala limpio y no arrastra modelos de negocio ni datos.


from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install", "abc_dialog_resize_free")
class TestInstall(TransactionCase):
    def test_module_installed(self):
        module = self.env["ir.module.module"].search(
            [("name", "=", "abc_dialog_resize_free")]
        )
        self.assertEqual(len(module), 1)
        self.assertEqual(module.state, "installed")

    def test_no_business_models(self):
        # El gancho no declara modelos propios: cero superficie de datos.
        leaked = self.env["ir.model"].search(
            [("model", "=like", "abc.dialog.resize%")]
        )
        self.assertFalse(
            leaked,
            "El gancho gratuito no debe declarar modelos de negocio.",
        )
