/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * Persistencia ligera en localStorage con claves namespaced (patrón B4).
 *
 * Regla: la clave SIEMPRE incluye base de datos, modelo y uid para no
 * contaminar preferencias entre bases ni entre usuarios del mismo
 * navegador. Los valores se serializan como JSON; cualquier error de
 * cuota, de parseo o de storage inaccesible degrada al default sin
 * romper el flujo del llamador.
 */

import { user } from "@web/core/user";
import { session } from "@web/session";

const PREFIX = "abc_web_utils";

/**
 * Construye el namespace "abc_web_utils/<db>/<modelo>/<uid>".
 *
 * @param {string} model modelo Odoo dueño de la preferencia ("global" si no aplica)
 * @param {Object} [options]
 * @param {string} [options.db] override de base (default: session.db)
 * @param {number} [options.uid] override de uid (default: user.userId)
 * @returns {string}
 */
export function buildNamespace(model, options = {}) {
    const db = options.db ?? session.db ?? "nodb";
    const uid = options.uid ?? user?.userId ?? session.uid ?? 0;
    return `${PREFIX}/${db}/${model || "global"}/${uid}`;
}

/**
 * Crea un pequeño store namespaced sobre localStorage.
 *
 *     const store = makeLocalStore("account.move");
 *     store.set("column_widths", { name: 120 });
 *     store.get("column_widths", {});
 *
 * @param {string} model modelo Odoo (parte del namespace)
 * @param {Object} [options]
 * @param {string} [options.db] ver buildNamespace
 * @param {number} [options.uid] ver buildNamespace
 * @param {Storage} [options.storage] storage inyectable (tests)
 * @returns {Object} { namespace, key, get, set, remove, clear }
 */
export function makeLocalStore(model, options = {}) {
    const storage = options.storage || window.localStorage;
    const namespace = buildNamespace(model, options);
    const fullKey = (key) => `${namespace}/${key}`;
    return {
        namespace,

        /** Clave completa que se usaría en storage (útil para depurar). */
        key(key) {
            return fullKey(key);
        },

        /**
         * Lee y deserializa un valor; devuelve defaultValue si no existe,
         * si el JSON está corrupto o si el storage no es accesible.
         */
        get(key, defaultValue = null) {
            try {
                const raw = storage.getItem(fullKey(key));
                if (raw === null || raw === undefined) {
                    return defaultValue;
                }
                return JSON.parse(raw);
            } catch {
                return defaultValue;
            }
        },

        /**
         * Serializa y guarda un valor JSON-serializable.
         * @returns {boolean} false si falló (cuota llena, storage bloqueado)
         */
        set(key, value) {
            try {
                storage.setItem(fullKey(key), JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },

        /** Elimina una clave del namespace (silencioso si no existe). */
        remove(key) {
            try {
                storage.removeItem(fullKey(key));
            } catch {
                // storage inaccesible: nada que limpiar
            }
        },

        /** Elimina TODAS las claves de ESTE namespace y solo de este. */
        clear() {
            try {
                const doomed = [];
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(`${namespace}/`)) {
                        doomed.push(key);
                    }
                }
                for (const key of doomed) {
                    storage.removeItem(key);
                }
            } catch {
                // storage inaccesible: nada que limpiar
            }
        },
    };
}
