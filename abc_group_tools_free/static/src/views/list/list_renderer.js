/* 
Copyright (C) 2026 ABC S&S (https://abcsas.com).
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).

Patch ADITIVO del ListRenderer: solo añade dos métodos nuevos; ningún método nativo se sobreescribe. La plantilla heredada (list_renderer.xml) decide dónde se usan. El patch se aplica una sola vez y es reversible (applyPatchOnce de abc_web_utils).

Contrato del core v19 verificado sobre la imagen odoo:19.0:
- this.props.list.groups   -> array de grupos de primer nivel
- group.isFolded           -> estado plegado
- group.toggle()           -> alterna plegado (lo usa toggleGroup nativo)
*/

import { ListRenderer } from "@web/views/list/list_renderer";
import { applyPatchOnce } from "@abc_web_utils/core/patch_utils";

applyPatchOnce("abc_group_tools_free.ListRenderer", ListRenderer.prototype, {
    // Despliega todos los grupos plegados de primer nivel. 
    async abcExpandAllGroups() {
        const groups = this.props.list.groups || [];
        for (const group of groups) {
            if (group.isFolded) {
                await group.toggle();
            }
        }
    },

    // Pliega todos los grupos desplegados de primer nivel. 
    async abcCollapseAllGroups() {
        const groups = this.props.list.groups || [];
        for (const group of groups) {
            if (!group.isFolded) {
                await group.toggle();
            }
        }
    },
});
