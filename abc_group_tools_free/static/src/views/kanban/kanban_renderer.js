/* 
Copyright (C) 2026 ABC S&S (https://abcsas.com).
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).

Patch ADITIVO del KanbanRenderer: Ningún método nativo se sobreescribe.

* Contrato del core v19 verificado sobre la imagen odoo:19.0:
    - this.props.list.groups   -> array de columnas/grupos
    - group.isFolded           -> estado plegado (columna colapsada)
    - group.toggle()           -> alterna plegado (lo usa toggleGroup nativo)
*/

import { KanbanRenderer } from "@web/views/kanban/kanban_renderer";
import { applyPatchOnce } from "@abc_web_utils/core/patch_utils";

applyPatchOnce("abc_group_tools_free.KanbanRenderer", KanbanRenderer.prototype, {
    // Despliega todas las columnas plegadas. 
    async abcExpandAllGroups() {
        const groups = this.props.list.groups || [];
        for (const group of groups) {
            if (group.isFolded) {
                await group.toggle();
            }
        }
    },

    // Pliega todas las columnas desplegadas. 
    async abcCollapseAllGroups() {
        const groups = this.props.list.groups || [];
        for (const group of groups) {
            if (!group.isFolded) {
                await group.toggle();
            }
        }
    },
});
