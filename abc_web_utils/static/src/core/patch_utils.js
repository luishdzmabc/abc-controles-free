/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * Helpers para patch() ADITIVO (patrón B1) con limpieza garantizada.
 *
 * Regla de la línea ABC: todo patch llama al original (super) y extiende;
 * y todo patch debe poder deshacerse (tests HOOT, desinstalación limpia).
 */

import { patch } from "@web/core/utils/patch";

const appliedOnceKeys = new Set();

/**
 * Aplica un patch aditivo y devuelve su función de limpieza.
 *
 * Envoltura mínima sobre patch() del core que homogeneiza el contrato:
 * SIEMPRE devuelve el unpatch (el llamador decide si lo conserva).
 *
 * @param {Object} target objeto a parchear (prototype, clase o descriptor)
 * @param {Object} extension métodos/props a añadir; usar super.xxx()
 * @returns {Function} unpatch que restaura el objetivo
 */
export function applyPatch(target, extension) {
    return patch(target, extension);
}

/**
 * Aplica un patch identificado por clave una sola vez por sesión del
 * webclient (evita doble patch cuando dos módulos comparten un helper).
 *
 * @param {string} key clave única, convención: "modulo.objetivo.rasgo"
 * @param {Object} target
 * @param {Object} extension
 * @returns {Function|null} unpatch, o null si la clave ya estaba aplicada
 */
export function applyPatchOnce(key, target, extension) {
    if (appliedOnceKeys.has(key)) {
        return null;
    }
    const unpatch = patch(target, extension);
    appliedOnceKeys.add(key);
    return () => {
        appliedOnceKeys.delete(key);
        unpatch();
    };
}

/**
 * Grupo de patches con limpieza en orden inverso (LIFO), para módulos
 * que parchean varios objetivos y quieren un único cleanup().
 *
 *     const patches = new PatchGroup()
 *         .add(ListController.prototype, {...})
 *         .add(ListRenderer.prototype, {...});
 *     // ... en un test o al desmontar:
 *     patches.cleanup();
 */
export class PatchGroup {
    constructor() {
        this._unpatchers = [];
    }

    /**
     * @param {Object} target
     * @param {Object} extension
     * @returns {PatchGroup} this (encadenable)
     */
    add(target, extension) {
        this._unpatchers.push(patch(target, extension));
        return this;
    }

    /** Número de patches vivos. */
    get size() {
        return this._unpatchers.length;
    }

    /** Deshace todos los patches en orden inverso al aplicado. */
    cleanup() {
        while (this._unpatchers.length) {
            this._unpatchers.pop()();
        }
    }
}
