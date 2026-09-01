# Copyright (C) 2026 ABC (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
"""Pruebas de servidor del gancho gratuito abc_activity_board_free.

El gancho no declara modelos propios: sólo aporta una acción, un menú y
vistas sobre ``mail.activity``. Verificamos que la acción/vistas existen,
que el dominio filtra por el usuario actual y que la superficie de datos
es cero (no arrastra modelos de negocio)."""

from odoo.tests import tagged
from odoo.tests.common import TransactionCase, new_test_user


@tagged("post_install", "-at_install", "abc_activity_board_free")
class TestActivityBoard(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user_a = new_test_user(
            cls.env, login="abc_board_a", groups="base.group_user"
        )
        cls.user_b = new_test_user(
            cls.env, login="abc_board_b", groups="base.group_user"
        )
        cls.todo_type = cls.env.ref("mail.mail_activity_data_todo")
        # Un registro cualquiera al que colgar actividades (usamos partners).
        cls.partner = cls.env["res.partner"].create({"name": "ABC Board Partner"})

    def _make_activity(self, user):
        return (
            self.env["mail.activity"]
            .with_context(mail_activity_quick_update=True)
            .create(
                {
                    "res_model_id": self.env["ir.model"]._get_id("res.partner"),
                    "res_id": self.partner.id,
                    "activity_type_id": self.todo_type.id,
                    "user_id": user.id,
                    "summary": "ABC board test %s" % user.login,
                }
            )
        )

    def test_action_exists(self):
        action = self.env.ref("abc_activity_board_free.action_abc_activity_board")
        self.assertEqual(action.res_model, "mail.activity")
        self.assertIn("list", action.view_mode)
        self.assertIn("kanban", action.view_mode)
        self.assertIn("calendar", action.view_mode)

    def test_menu_exists(self):
        menu = self.env.ref("abc_activity_board_free.menu_abc_activity_board_root")
        self.assertEqual(
            menu.action.id,
            self.env.ref("abc_activity_board_free.action_abc_activity_board").id,
        )

    def test_views_exist(self):
        for xmlid in (
            "view_abc_activity_board_list",
            "view_abc_activity_board_kanban",
            "view_abc_activity_board_calendar",
            "view_abc_activity_board_search",
        ):
            view = self.env.ref("abc_activity_board_free.%s" % xmlid)
            self.assertEqual(view.model, "mail.activity")

    def test_list_view_renders(self):
        """La vista list sobre mail.activity carga sin error (arch válido)."""
        view = self.env.ref("abc_activity_board_free.view_abc_activity_board_list")
        arch = self.env["mail.activity"].get_view(view.id, "list")
        self.assertIn("date_deadline", arch["arch"])

    def test_domain_filters_by_current_user(self):
        """El dominio de la acción entrega SÓLO las actividades del usuario."""
        act_a = self._make_activity(self.user_a)
        act_b = self._make_activity(self.user_b)

        action = self.env.ref("abc_activity_board_free.action_abc_activity_board")
        # El dominio usa `uid`; se evalúa contra el usuario en sesión.
        Activity = self.env["mail.activity"].with_user(self.user_a)
        domain = [("user_id", "=", self.user_a.id)]
        found = Activity.search(domain)
        self.assertIn(act_a, found)
        self.assertNotIn(act_b, found)
        # La acción declara el filtro por usuario actual.
        self.assertIn("uid", (action.domain or ""))
        self.assertIn("user_id", (action.domain or ""))

    def test_mark_done_archives_activity(self):
        """action_done marca la actividad como hecha (la archiva)."""
        act = self._make_activity(self.user_a)
        self.assertTrue(act.active)
        act.action_done()
        # Tras marcarse hecha, la actividad se archiva/elimina: ya no está
        # activa, por lo que sale del tablero de pendientes.
        self.assertFalse(act.exists() and act.active)

    def test_no_business_models(self):
        # El gancho no declara modelos propios: cero superficie de datos.
        leaked = self.env["ir.model"].search(
            [("model", "=like", "abc.activity.board%")]
        )
        self.assertFalse(
            leaked,
            "El gancho gratuito no debe declarar modelos de negocio.",
        )
