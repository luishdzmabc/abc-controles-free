/* 
Copyright (C) 2026 ABC (https://abcsas.com).
License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).

Gancho de diálogos modales REDIMENSIONABLES.

Delta sobre el core (@web/core/dialog/dialog):
    - El Dialog del core ya es MOVIBLE (arrastrar la cabecera), pero NO redimensionable: `.modal-content` toma su ancho del tamaño fijo (`modal-sm/md/lg/xl`) del `.modal-dialog` y no se puede estirar.
    - Este parche añade una agarradera en la esquina inferior derecha del `.modal-content`; al arrastrarla se fija ancho/alto explícitos.
    - El tamaño se persiste POR USUARIO con `makeLocalStore` de abc_web_utils, indexado por el `size` base del diálogo, y se reaplica al abrir el siguiente diálogo del mismo tamaño.

Diseño:
    - Estado reactivo (`useState`) para que el tamaño viaje por el getter `contentStyle` (único punto de estilo dinámico que el core aplica a `.modal-content` vía t-att-style). Así los re-render del core —al arrastrar la cabecera o al apilar diálogos— NO borran el tamaño.
    - Parche aditivo y reversible (`applyPatchOnce` de abc_web_utils):siempre llama a super y puede deshacerse (tests HOOT / desinstalar).
    - La agarradera se inyecta en el DOM en `onMounted` (sin tocar el template QWeb del core) y toda la mecánica visual vive en el SCSS.
*/

import { Dialog } from "@web/core/dialog/dialog";
import { onMounted } from "@odoo/owl";
import { useState } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { applyPatchOnce } from "@abc_web_utils/core/patch_utils";
import { makeLocalStore } from "@abc_web_utils/core/local_store";

// Clase-gancho que marca un `.modal-content` ya redimensionado. 
export const RESIZED_CLASS = "o_abc_resized";
// Clase de la agarradera de la esquina. 
export const HANDLE_CLASS = "o_abc_resize_handle";

// Tamaños mínimos (px) para no colapsar el diálogo. 
const MIN_WIDTH = 280;
const MIN_HEIGHT = 160;

applyPatchOnce("abc_dialog_resize_free.Dialog", Dialog.prototype, {
    setup() {
        super.setup(...arguments);
        // Store namespaced por base+usuario; el modelo lógico es "web.dialog".
        this._abcStore = makeLocalStore("web.dialog");
        // Se recuerda un tamaño por cada `size` base (sm/md/lg/xl/fs...).
        this._abcSizeKey = `size_${this.props.size}`;
        const saved = this._abcStore.get(this._abcSizeKey, null);
        // Estado reactivo: null = usar el tamaño nativo del core.
        this._abcSize = useState({
            width: saved && saved.width ? saved.width : null,
            height: saved && saved.height ? saved.height : null,
        });

        onMounted(() => this._abcSetupResize());
    },

    //Extiende el estilo dinámico de `.modal-content`: conserva lo que calcula el core (top/left del arrastre) y añade ancho/alto cuando el usuario ya redimensionó.
    get contentStyle() {
        let style = super.contentStyle;
        const { width, height } = this._abcSize;
        if (width) {
            style += ` width: ${width}px;`;
        }
        if (height) {
            style += ` height: ${height}px;`;
        }
        return style;
    },

    // Inyecta la agarradera y engancha el arrastre de redimensión. 
    _abcSetupResize() {
        const modalEl = this.modalRef && this.modalRef.el;
        if (!modalEl) {
            return;
        }
        const content = modalEl.querySelector(".modal-content");
        if (!content || content.querySelector(`.${HANDLE_CLASS}`)) {
            return;
        }
        // Si ya había un tamaño recordado, marcar el nodo para que el SCSS libere el ancho fijo del `.modal-dialog`.
        if (this._abcSize.width || this._abcSize.height) {
            content.classList.add(RESIZED_CLASS);
        }
        const handle = document.createElement("div");
        handle.className = HANDLE_CLASS;
        handle.setAttribute("title", _t("Arrastrar para redimensionar"));
        handle.setAttribute("aria-hidden", "true");
        handle.addEventListener("pointerdown", (ev) =>
            this._abcOnHandlePointerDown(ev, content)
        );
        content.appendChild(handle);
    },

    // Inicia el arrastre desde la agarradera. 
    _abcOnHandlePointerDown(ev, content) {
        // Solo botón principal; ignorar toque múltiple / secundario.
        if (ev.button !== 0) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        const rect = content.getBoundingClientRect();
        const startX = ev.clientX;
        const startY = ev.clientY;
        const startW = rect.width;
        const startH = rect.height;
        content.classList.add(RESIZED_CLASS);

        const onMove = (e) => {
            const width = Math.max(MIN_WIDTH, Math.round(startW + (e.clientX - startX)));
            const height = Math.max(MIN_HEIGHT, Math.round(startH + (e.clientY - startY)));
            this._abcSize.width = width;
            this._abcSize.height = height;
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            this._abcPersistSize();
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    },

    // Guarda el tamaño actual para este `size` base (silencioso si falla). 
    _abcPersistSize() {
        const { width, height } = this._abcSize;
        if (width && height) {
            this._abcStore.set(this._abcSizeKey, { width, height });
        }
    },
});
