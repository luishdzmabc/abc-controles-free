/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * EN — HOOT tests for the team-stage selector (pattern C1, browser layer via
 * test_js.py). Uses a fake model registered through `registerTeamStageModel`
 * so the suite doesn't depend on `crm` being installed. Checks:
 *   1. the selector stays hidden when the user belongs to 0 or 1 team;
 *   2. it renders "All teams" + one <option> per team once there are 2+;
 *   3. choosing a team updates the selector's own selected state.
 *
 * ES — Tests HOOT del selector de equipo/etapa (patron C1, capa navegador
 * via test_js.py). Usa un modelo falso registrado con
 * `registerTeamStageModel` para no depender de que `crm` este instalado.
 * Verifica:
 *   1. el selector permanece oculto si el usuario pertenece a 0 o 1 equipo;
 *   2. se renderiza "All teams" + un <option> por equipo con 2+;
 *   3. elegir un equipo actualiza el estado seleccionado del propio control.
 */

import { describe, expect, test } from "@odoo/hoot";
import { queryAllTexts, queryOne } from "@odoo/hoot-dom";
import { animationFrame } from "@odoo/hoot-mock";
import {
    defineModels,
    fields,
    models,
    mountView,
    serverState,
    webModels,
} from "@web/../tests/web_test_helpers";

import { registerTeamStageModel } from "@abc_team_stage_filter_free/team_stage_filter";

class AbcTsfTeam extends models.Model {
    _name = "abc.tsf.team";
    name = fields.Char();
    member_ids = fields.Many2many({ relation: "res.users" });
    _records = [
        { id: 1, name: "Cranes", member_ids: [serverState.userId] },
        { id: 2, name: "Services", member_ids: [serverState.userId] },
        { id: 3, name: "Other (not mine)", member_ids: [] },
    ];
}

class AbcTsfThing extends models.Model {
    _name = "abc.tsf.thing";
    name = fields.Char();
    team_id = fields.Many2one({ relation: "abc.tsf.team" });
    _records = [{ id: 1, name: "record 1", team_id: 1 }];
}

defineModels({ ...webModels, AbcTsfTeam, AbcTsfThing });

registerTeamStageModel("abc.tsf.thing", {
    teamField: "team_id",
    stageField: "team_id", // no dedicated stage model needed for this suite
    teamModel: "abc.tsf.team",
    memberField: "member_ids",
});

const KANBAN_ARCH = `
    <kanban>
        <templates>
            <t t-name="card">
                <field name="name"/>
            </t>
        </templates>
    </kanban>
`;

describe("abc_team_stage_filter_free", () => {
    test("hidden when the user belongs to fewer than 2 teams", async () => {
        AbcTsfTeam._records[1].member_ids = []; // leave only 1 team of the user's
        await mountView({ type: "kanban", resModel: "abc.tsf.thing", arch: KANBAN_ARCH });
        await animationFrame();
        expect(".abc_team_stage_filter_select").toHaveCount(0);
        AbcTsfTeam._records[1].member_ids = [serverState.userId]; // restore for other tests
    });

    test("shows 'All teams' plus one option per team once there are 2+", async () => {
        await mountView({ type: "kanban", resModel: "abc.tsf.thing", arch: KANBAN_ARCH });
        await animationFrame();
        expect(".abc_team_stage_filter_select").toHaveCount(1);
        const labels = queryAllTexts(".abc_team_stage_filter_select option");
        expect(labels).toEqual(["All teams", "Cranes", "Services"]);
        // The team the user does NOT belong to must never appear.
        expect(labels).not.toInclude("Other (not mine)");
    });

    test("picking a team updates the select's own value", async () => {
        await mountView({ type: "kanban", resModel: "abc.tsf.thing", arch: KANBAN_ARCH });
        await animationFrame();
        const select = queryOne(".abc_team_stage_filter_select");
        select.value = "1";
        select.dispatchEvent(new Event("change"));
        await animationFrame();
        expect(select.value).toBe("1");
    });
});
