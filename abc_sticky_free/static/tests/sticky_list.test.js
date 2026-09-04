/* 
Copyright (C) 2026 ABC S&S (https://abcsas.com).
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).																	  

Tests HOOT de sticky (capa navegador via test_js.py).
Verifican que el parche sobre ListRenderer se aplique: el nodo raiz de la lista recibe la clase `o_abc_sticky` y el pie de totales (tfoot) 
sigue presente en el DOM para poder fijarse.
*/

import { describe, expect, test } from "@odoo/hoot";
import { queryAll, queryOne } from "@odoo/hoot-dom";
import { animationFrame } from "@odoo/hoot-mock";
import {
    defineModels,
    fields,
    models,
    mountView,
    webModels,
} from "@web/../tests/web_test_helpers";

class AbcStickyThing extends models.Model {
    _name = "abc.sticky.thing";

    name = fields.Char();
    amount = fields.Float();

    _records = [
        { id: 1, name: "a", amount: 1 },
        { id: 2, name: "b", amount: 2 },
        { id: 3, name: "c", amount: 3 },
    ];
}

// Registrar los modelos base del web (res.users, res.company, etc.) que el ListRenderer necesita en su arranque, ademas del modelo de prueba.
defineModels({ ...webModels, AbcStickyThing });

const LIST_ARCH = `
    <list>
        <field name="name"/>
        <field name="amount" sum="Total"/>
    </list>
`;

describe("abc_sticky_free", () => {
    test("la clase-gancho o_abc_sticky se aplica al montar la lista", async () => {
        await mountView({
            type: "list",
            resModel: "abc.sticky.thing",
            arch: LIST_ARCH,
        });
        await animationFrame();
        const renderer = queryOne(".o_list_renderer");
        expect(renderer.classList.contains("o_abc_sticky")).toBe(true);
    });

    test("el encabezado y el pie de totales existen para poder fijarse", async () => {
        await mountView({
            type: "list",
            resModel: "abc.sticky.thing",
            arch: LIST_ARCH,
        });
        await animationFrame();
        // thead con al menos una celda de encabezado dentro del renderer marcado.
        const headerCells = queryAll(
            ".o_list_renderer.o_abc_sticky .o_list_table > thead th"
        );
        expect(headerCells.length).toBeGreaterThan(0);
        // tfoot presente (el agregado sum pinta el pie).
        expect(".o_list_renderer.o_abc_sticky .o_list_table > tfoot").toHaveCount(1);
    });
});
