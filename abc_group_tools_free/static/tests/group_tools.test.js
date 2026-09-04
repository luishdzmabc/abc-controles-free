/* 
Copyright (C) 2026 ABC S&S (https://abcsas.com).
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).

Tests HOOT del gancho gratuito: montan una vista agrupada real con ORM mockeado y verifican que el patch aditivo aplica (botones + píldora de conteo presentes) 
y que expandir/colapsar todo opera sobre los grupos del core.
*/

import { describe, expect, test } from "@odoo/hoot";
import { animationFrame } from "@odoo/hoot-mock";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    webModels,
} from "@web/../tests/web_test_helpers";

class AbcGtThing extends models.Model {
    _name = "abc.gt.thing";

    name = fields.Char();
    category = fields.Char();

    _records = [
        { id: 1, name: "a", category: "X" },
        { id: 2, name: "b", category: "X" },
        { id: 3, name: "c", category: "Y" },
    ];
}

defineModels({ ...webModels, AbcGtThing });

const LIST_ARCH = `
    <list>
        <field name="name"/>
        <field name="category"/>
    </list>`;

const KANBAN_ARCH = `
    <kanban>
        <field name="category"/>
        <templates>
            <t t-name="card">
                <field name="name"/>
            </t>
        </templates>
    </kanban>`;

describe("abc_group_tools_free", () => {
    describe("list grouped", () => {
        test("el patch pinta la barra y la píldora de conteo", async () => {
            await mountView({
                type: "list",
                resModel: "abc.gt.thing",
                arch: LIST_ARCH,
                groupBy: ["category"],
            });
            // Botones presentes.
            expect(".o_list_renderer .o_abc_expand_all").toHaveCount(1);
            expect(".o_list_renderer .o_abc_collapse_all").toHaveCount(1);
            // Una píldora de conteo por grupo (2 grupos: X, Y).
            expect(".o_group_header .abc_group_count").toHaveCount(2);
        });

        test("colapsar todo y expandir todo operan sobre los grupos", async () => {
            await mountView({
                type: "list",
                resModel: "abc.gt.thing",
                arch: LIST_ARCH,
                groupBy: ["category"],
            });
            // Colapsar todo: ningún grupo queda abierto ni fila visible.
            await contains(".o_abc_collapse_all").click();
            await animationFrame();
            expect(".o_group_header.o_group_open").toHaveCount(0);
            expect(".o_data_row").toHaveCount(0);
            // Expandir todo: los 2 grupos abren y se ven los 3 registros.
            await contains(".o_abc_expand_all").click();
            await animationFrame();
            expect(".o_group_header.o_group_open").toHaveCount(2);
            expect(".o_data_row").toHaveCount(3);
        });
    });

    describe("kanban grouped", () => {
        test("el patch pinta la barra en el renderer agrupado", async () => {
            await mountView({
                type: "kanban",
                resModel: "abc.gt.thing",
                arch: KANBAN_ARCH,
                groupBy: ["category"],
            });
            expect(".o_kanban_renderer .o_abc_expand_all").toHaveCount(1);
            expect(".o_kanban_renderer .o_abc_collapse_all").toHaveCount(1);
        });

        test("colapsar todo pliega las columnas y expandir todo las abre", async () => {
            await mountView({
                type: "kanban",
                resModel: "abc.gt.thing",
                arch: KANBAN_ARCH,
                groupBy: ["category"],
            });
            expect(".o_kanban_group").toHaveCount(2);
            // Colapsar todo: ambas columnas quedan plegadas.
            await contains(".o_abc_collapse_all").click();
            await animationFrame();
            expect(".o_kanban_group.o_column_folded").toHaveCount(2);
            // Expandir todo: ninguna columna plegada.
            await contains(".o_abc_expand_all").click();
            await animationFrame();
            expect(".o_kanban_group.o_column_folded").toHaveCount(0);
        });
    });
});
