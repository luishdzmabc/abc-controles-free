/* 
Copyright (C) 2026 ABC (https://abcsas.com).
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).																  

Tests HOOT del gancho de diálogos redimensionables. Montan un Dialog real del core y verifican:																	  
    - que el parche aditivo inyecta la agarradera en `.modal-content`;
    - que redimensionar (mover la agarradera) fija ancho/alto en el estilo inline del cuadro y marca el nodo como redimensionado;															
    - que el tamaño se persiste y se reaplica en un diálogo posterior.
*/

import { describe, destroy, expect, test } from "@odoo/hoot";
import { queryOne } from "@odoo/hoot-dom";
import { animationFrame } from "@odoo/hoot-mock";
import { Component, xml } from "@odoo/owl";
import {
    defineModels,
    makeDialogMockEnv,
    mountWithCleanup,
    webModels,
} from "@web/../tests/web_test_helpers";

import { Dialog } from "@web/core/dialog/dialog";
import { HANDLE_CLASS, RESIZED_CLASS } from "@abc_dialog_resize_free/dialog_resize";

// El arranque del entorno web (user/session/company) que necesitan los helpers namespaced de abc_web_utils.
defineModels({ ...webModels });

class Parent extends Component {
    static components = { Dialog };
    static template = xml`
        <Dialog title="'ABC Resize'" size="'lg'">
            Contenido de prueba
        </Dialog>
    `;
    static props = ["*"];
}

// Simula un arrastre de la agarradera con eventos de puntero. 
function dragHandle(handle, dx, dy) {
    const rect = handle.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    handle.dispatchEvent(
        new PointerEvent("pointerdown", {
            button: 0,
            clientX: startX,
            clientY: startY,
            bubbles: true,
            cancelable: true,
        })
    );
    window.dispatchEvent(
        new PointerEvent("pointermove", {
            clientX: startX + dx,
            clientY: startY + dy,
            bubbles: true,
        })
    );
    window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
}

describe("abc_dialog_resize_free", () => {
    test("la agarradera de redimensión se inyecta en el diálogo", async () => {
        await makeDialogMockEnv();
        await mountWithCleanup(Parent);
        await animationFrame();

        expect(".o_dialog").toHaveCount(1);
        expect(`.modal-content > .${HANDLE_CLASS}`).toHaveCount(1);
    });

    test("arrastrar la agarradera fija tamaño y marca el nodo", async () => {
        await makeDialogMockEnv();
        await mountWithCleanup(Parent);
        await animationFrame();

        const content = queryOne(".modal-content");
        const handle = queryOne(`.modal-content > .${HANDLE_CLASS}`);

        dragHandle(handle, 120, 80);
        await animationFrame();

        expect(content.classList.contains(RESIZED_CLASS)).toBe(true);
        // El estilo inline (vía el getter contentStyle del parche) lleva el tamaño.
        expect(content.style.width).not.toBe("");
        expect(content.style.height).not.toBe("");
    });

    test("el tamaño se recuerda en el siguiente diálogo del mismo size", async () => {
        // Un solo entorno mock por test (HOOT prohíbe declararlo dos veces); los dos diálogos se montan secuencialmente sobre el mismo env.																  
        await makeDialogMockEnv();

        // Primer diálogo: redimensionar y persistir.
        const first = await mountWithCleanup(Parent);
        await animationFrame();
        const handle = queryOne(`.modal-content > .${HANDLE_CLASS}`);
        dragHandle(handle, 150, 90);
        await animationFrame();
        const savedWidth = queryOne(".modal-content").style.width;
        expect(savedWidth).not.toBe("");
        destroy(first);
        await animationFrame();

        // Segundo diálogo del mismo tamaño base: debe abrir ya redimensionado.
        await mountWithCleanup(Parent);
        await animationFrame();
        const content2 = queryOne(".modal-content");
        expect(content2.classList.contains(RESIZED_CLASS)).toBe(true);
        expect(content2.style.width).toBe(savedWidth);
    });
});
