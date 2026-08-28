/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * Servicio de overlay bloqueante con barra de progreso y tiempo estimado
 * (patrón B2: servicio en registry + montaje dinámico en main_components).
 *
 * API (useService("abc_progress_overlay")):
 *   start(total, message)  monta el overlay y arranca el cronómetro
 *   update(done, message?) avanza la barra (y opcionalmente el mensaje)
 *   stop()                 desmonta el overlay
 *   active                 getter: true mientras el overlay está montado
 *
 * El estado es un objeto reactivo compartido por referencia: mutarlo vía
 * update() re-renderiza el overlay sin lógica adicional. La estimación de
 * tiempo restante es lineal: transcurrido * (total - hecho) / hecho.
 */

import { Component, onWillDestroy, reactive, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";

const MAIN_COMPONENT_KEY = "AbcProgressOverlay";

/**
 * Formatea milisegundos como "mm:ss" (u "hh:mm:ss" si excede la hora).
 *
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return hours ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export class ProgressOverlay extends Component {
    static template = "abc_web_utils.ProgressOverlay";
    static props = {
        state: Object,
    };

    setup() {
        // Tick de 1s para refrescar transcurrido/restante aunque no haya
        // updates del llamador; limpieza garantizada al desmontar.
        this.tick = useState({ now: Date.now() });
        const timer = setInterval(() => {
            this.tick.now = Date.now();
        }, 1000);
        onWillDestroy(() => clearInterval(timer));
    }

    get percent() {
        const { done, total } = this.props.state;
        if (!total) {
            return 0;
        }
        return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
    }

    get elapsedText() {
        return formatDuration(this.tick.now - this.props.state.startedAt);
    }

    get remainingText() {
        const { done, total, startedAt } = this.props.state;
        if (!done || done >= total) {
            return "";
        }
        const elapsed = Math.max(0, this.tick.now - startedAt);
        return formatDuration((elapsed * (total - done)) / done);
    }
}

export const progressOverlayService = {
    start() {
        const mainComponents = registry.category("main_components");
        let state = null;

        // Funciones cerradas sobre `state` (no métodos con `this`): la API
        // sobrevive al destructuring típico de los consumidores, p. ej.
        // `const { start, stop } = useService("abc_progress_overlay")`.

        /** Desmonta el overlay. Idempotente. */
        const stop = () => {
            if (!state) {
                return;
            }
            mainComponents.remove(MAIN_COMPONENT_KEY);
            state = null;
        };

        /**
         * Monta el overlay bloqueante y arranca el cronómetro.
         * @param {number} total número total de unidades de trabajo (>= 1)
         * @param {string} [message] texto mostrado sobre la barra
         */
        const start = (total, message = "") => {
            stop();
            state = reactive({
                total: Math.max(1, Math.floor(Number(total) || 1)),
                done: 0,
                message: String(message || ""),
                startedAt: Date.now(),
            });
            mainComponents.add(
                MAIN_COMPONENT_KEY,
                { Component: ProgressOverlay, props: { state } },
                { force: true }
            );
        };

        /**
         * Reporta avance. Ignorado si el overlay no está activo.
         * @param {number} done unidades completadas (se acota a [0, total])
         * @param {string} [message] nuevo mensaje (opcional)
         */
        const update = (done, message) => {
            if (!state) {
                return;
            }
            state.done = Math.min(
                state.total,
                Math.max(0, Math.floor(Number(done) || 0))
            );
            if (message !== undefined) {
                state.message = String(message);
            }
        };

        return {
            /** true mientras el overlay está montado. */
            get active() {
                return state !== null;
            },
            start,
            update,
            stop,
        };
    },
};

registry.category("services").add("abc_progress_overlay", progressOverlayService);
