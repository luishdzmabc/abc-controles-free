/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * Registro extensible de visores por mimetype (patrón B2).
 *
 * Base para los visores futuros de la línea ABC (p. ej. abc_preview_cfdi,
 * abc_report_preview): cada módulo registra su componente OWL para uno o
 * varios mimetypes y los consumidores resuelven con getViewer().
 *
 * Resolución en cascada: mimetype exacto -> familia ("application/*")
 * -> comodín total ("*" + "/*"). Este módulo base NO registra ningún
 * visor (regla C3).
 */

import { registry } from "@web/core/registry";

export const VIEWER_REGISTRY_CATEGORY = "abc_viewers";

export const viewerRegistry = registry.category(VIEWER_REGISTRY_CATEGORY);

/**
 * Registra un visor para un mimetype.
 *
 *     registerViewer("application/xml", CfdiViewer, { sequence: 10 });
 *     registerViewer("image/*", ImageViewer);
 *
 * @param {string} mimetype exacto ("application/pdf"), familia ("image/*")
 *        o comodín total ("*" + "/*")
 * @param {typeof import("@odoo/owl").Component} Component componente OWL;
 *        contrato de props sugerido: { url, mimetype, filename, close }
 * @param {Object} [options]
 * @param {number} [options.sequence=100] menor = mayor prioridad (informativo)
 * @param {boolean} [options.force=false] permite reemplazar un registro previo
 */
export function registerViewer(mimetype, Component, options = {}) {
    const key = String(mimetype || "").trim().toLowerCase();
    if (!key) {
        throw new Error("abc_web_utils: registerViewer requiere un mimetype");
    }
    viewerRegistry.add(
        key,
        { Component, mimetype: key, sequence: options.sequence ?? 100 },
        { force: Boolean(options.force) }
    );
}

/**
 * Resuelve el visor para un mimetype (exacto -> familia -> comodín).
 *
 * @param {string} mimetype
 * @returns {{Component: Function, mimetype: string, sequence: number}|null}
 */
export function getViewer(mimetype) {
    const key = String(mimetype || "").trim().toLowerCase();
    if (!key) {
        return null;
    }
    if (viewerRegistry.contains(key)) {
        return viewerRegistry.get(key);
    }
    const family = `${key.split("/")[0]}/*`;
    if (viewerRegistry.contains(family)) {
        return viewerRegistry.get(family);
    }
    if (viewerRegistry.contains("*/*")) {
        return viewerRegistry.get("*/*");
    }
    return null;
}

/**
 * @param {string} mimetype
 * @returns {boolean} true si existe un visor capaz de mostrarlo
 */
export function hasViewer(mimetype) {
    return getViewer(mimetype) !== null;
}
