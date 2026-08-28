/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * Tests HOOT de local_store (patrón C1, capa JS pura). Se inyecta un
 * storage falso para no tocar el localStorage real del runner.
 */

import { describe, expect, test } from "@odoo/hoot";

import { buildNamespace, makeLocalStore } from "@abc_web_utils/core/local_store";

function makeFakeStorage() {
    const map = new Map();
    return {
        getItem: (key) => (map.has(key) ? map.get(key) : null),
        setItem: (key, value) => {
            map.set(key, String(value));
        },
        removeItem: (key) => {
            map.delete(key);
        },
        key: (index) => [...map.keys()][index] ?? null,
        get length() {
            return map.size;
        },
        _map: map,
    };
}

describe("abc_web_utils", () => {
    describe("local_store", () => {
        test("las claves quedan namespaced con db, modelo y uid", () => {
            const namespace = buildNamespace("res.partner", { db: "testdb", uid: 7 });
            expect(namespace).toBe("abc_web_utils/testdb/res.partner/7");

            const storage = makeFakeStorage();
            const store = makeLocalStore("res.partner", {
                db: "testdb",
                uid: 7,
                storage,
            });
            store.set("widths", { name: 120 });
            expect(store.key("widths")).toBe(
                "abc_web_utils/testdb/res.partner/7/widths"
            );
            expect(storage._map.has("abc_web_utils/testdb/res.partner/7/widths")).toBe(
                true
            );
        });

        test("modelo vacío usa el namespace 'global'", () => {
            expect(buildNamespace("", { db: "testdb", uid: 3 })).toBe(
                "abc_web_utils/testdb/global/3"
            );
        });

        test("roundtrip set/get conserva los tipos JSON", () => {
            const store = makeLocalStore("res.partner", {
                db: "testdb",
                uid: 7,
                storage: makeFakeStorage(),
            });
            store.set("object", { a: 1, b: [true, "x"] });
            store.set("number", 42);
            store.set("nullable", null);
            expect(store.get("object")).toEqual({ a: 1, b: [true, "x"] });
            expect(store.get("number")).toBe(42);
            expect(store.get("nullable")).toBe(null);
        });

        test("get devuelve el default si falta la clave o el JSON está corrupto", () => {
            const storage = makeFakeStorage();
            const store = makeLocalStore("res.partner", {
                db: "testdb",
                uid: 7,
                storage,
            });
            expect(store.get("missing", "fallback")).toBe("fallback");
            storage.setItem(store.key("broken"), "{not json!!");
            expect(store.get("broken", "fallback")).toBe("fallback");
        });

        test("remove elimina solo la clave pedida", () => {
            const store = makeLocalStore("res.partner", {
                db: "testdb",
                uid: 7,
                storage: makeFakeStorage(),
            });
            store.set("keep", 1);
            store.set("drop", 2);
            store.remove("drop");
            expect(store.get("drop", "gone")).toBe("gone");
            expect(store.get("keep")).toBe(1);
        });

        test("clear limpia únicamente el namespace propio", () => {
            const storage = makeFakeStorage();
            const mine = makeLocalStore("res.partner", {
                db: "testdb",
                uid: 7,
                storage,
            });
            const otherUser = makeLocalStore("res.partner", {
                db: "testdb",
                uid: 8,
                storage,
            });
            const otherDb = makeLocalStore("res.partner", {
                db: "otherdb",
                uid: 7,
                storage,
            });
            mine.set("a", 1);
            mine.set("b", 2);
            otherUser.set("a", 3);
            otherDb.set("a", 4);

            mine.clear();

            expect(mine.get("a", "gone")).toBe("gone");
            expect(mine.get("b", "gone")).toBe("gone");
            expect(otherUser.get("a")).toBe(3);
            expect(otherDb.get("a")).toBe(4);
        });

        test("set devuelve false si el storage falla (cuota/bloqueo)", () => {
            const store = makeLocalStore("res.partner", {
                db: "testdb",
                uid: 7,
                storage: {
                    getItem: () => null,
                    setItem: () => {
                        throw new Error("QuotaExceededError");
                    },
                    removeItem: () => {},
                    key: () => null,
                    length: 0,
                },
            });
            expect(store.set("anything", 1)).toBe(false);
            expect(store.get("anything", "fallback")).toBe("fallback");
        });
    });
});
