/*
Copyright (C) 2026 ABC S&S (https://abcsas.com).
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).																		  

Gancho de encabezado/pie de lista fijos. No reescribe el template del core: solo marca el nodo raíz del ListRenderer (`.o_list_renderer`, t-ref="root") con la clase `o_abc_sticky`. Toda la mecánica visual vive en `sticky.scss`, que se aplica ÚNICAMENTE bajo esa clase. Así el parche es aditivo, reversible (helper applyPatchOnce de abc_web_utils) y no toca el arbol renderizado por Odoo.
*/

import { ListRenderer } from "@web/views/list/list_renderer";
import { applyPatchOnce } from "@abc_web_utils/core/patch_utils";
import { onMounted } from "@odoo/owl";

// Clase-gancho que dispara las reglas sticky de sticky.scss. 
export const STICKY_LIST_CLASS = "o_abc_sticky";

applyPatchOnce("abc_sticky_free.ListRenderer", ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        onMounted(() => {
            const el = this.rootRef && this.rootRef.el;
            if (el) {
                el.classList.add(STICKY_LIST_CLASS);
            }
        });
    },
});
