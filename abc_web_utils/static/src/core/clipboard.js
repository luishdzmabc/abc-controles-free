/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * Parseo de portapapeles de Excel/Calc a matriz de celdas.
 *
 * Soporta las dos representaciones que ponen las hojas de cálculo en el
 * portapapeles: text/plain (TSV con celdas entrecomilladas cuando
 * contienen tab/salto de línea) y text/html (una <table>).
 *
 * Guardrails (patrón C5): máximo 500 filas x 50 columnas por default,
 * configurable vía ir.config_parameter y propagado por session_info().
 * Toda celda se sanitiza: sin caracteres de control, sin NBSP, con tope
 * de longitud. Nunca se inyecta HTML: solo se extrae texto.
 */

import { session } from "@web/session";

export const DEFAULT_GUARDRAILS = {
    maxRows: 500,
    maxCols: 50,
    maxCellChars: 5000,
};

function toPositiveInt(value, fallback) {
    const number = parseInt(value, 10);
    return Number.isInteger(number) && number > 0 ? number : fallback;
}

/**
 * Guardrails efectivos leídos de session["abc_web_utils.settings"].limits
 * (con defaults seguros si la sesión no trae el payload).
 *
 * @returns {{maxRows: number, maxCols: number, maxCellChars: number}}
 */
export function getGuardrails() {
    const settings = session["abc_web_utils.settings"] || {};
    const limits = settings.limits || {};
    return {
        maxRows: toPositiveInt(limits.clipboard_max_rows, DEFAULT_GUARDRAILS.maxRows),
        maxCols: toPositiveInt(limits.clipboard_max_cols, DEFAULT_GUARDRAILS.maxCols),
        maxCellChars: toPositiveInt(
            limits.clipboard_max_cell_chars,
            DEFAULT_GUARDRAILS.maxCellChars
        ),
    };
}

/**
 * Sanitiza el contenido de una celda: normaliza NBSP a espacio y los
 * saltos de línea \r\n | \r a \n, elimina caracteres de control
 * (conserva \t y \n internos), recorta espacios en los extremos y
 * acota la longitud.
 *
 * @param {*} value
 * @param {number} [maxCellChars]
 * @returns {string}
 */
export function sanitizeCell(value, maxCellChars = DEFAULT_GUARDRAILS.maxCellChars) {
    let text = String(value ?? "");
    text = text.replace(/\u00a0/g, " ");
    // Saltos internos estilo Windows/Mac clásico a \n (las celdas
    // entrecomilladas de Excel traen \r\n dentro de la celda).
    text = text.replace(/\r\n?/g, "\n");
    // Controles C0 excepto \t (09) y \n (0A); y DEL (7F).
    // eslint-disable-next-line no-control-regex
    text = text.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "");
    text = text.trim();
    if (text.length > maxCellChars) {
        text = text.slice(0, maxCellChars);
    }
    return text;
}

/**
 * Parsea TSV al estilo Excel: separador tab, filas por \n | \r\n | \r,
 * celdas entrecomilladas con `"` cuando contienen tab/saltos, comilla
 * interna escapada como `""`.
 *
 * @param {string} text
 * @param {Object} [guardrails]
 * @returns {{matrix: string[][], truncated: boolean}}
 */
export function parseTsv(text, guardrails = getGuardrails()) {
    const source = String(text ?? "");
    const matrix = [];
    let truncated = false;
    let row = [];
    let cell = "";
    let inQuotes = false;

    const pushCell = () => {
        if (row.length < guardrails.maxCols) {
            row.push(sanitizeCell(cell, guardrails.maxCellChars));
        } else {
            truncated = true;
        }
        cell = "";
    };
    const pushRow = () => {
        pushCell();
        matrix.push(row);
        row = [];
    };

    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        if (inQuotes) {
            if (char === '"') {
                if (source[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += char;
            }
            continue;
        }
        if (char === '"' && cell === "") {
            inQuotes = true;
        } else if (char === "\t") {
            pushCell();
        } else if (char === "\n" || char === "\r") {
            if (char === "\r" && source[i + 1] === "\n") {
                i++;
            }
            pushRow();
            if (matrix.length >= guardrails.maxRows) {
                if (i < source.length - 1) {
                    truncated = true;
                }
                return { matrix, truncated };
            }
        } else {
            cell += char;
        }
    }
    if (cell !== "" || row.length) {
        pushRow();
    }
    return { matrix, truncated };
}

function spanOf(cellEl, attribute) {
    return Math.max(1, parseInt(cellEl.getAttribute(attribute) || "1", 10) || 1);
}

/**
 * Parsea la primera <table> de un fragmento HTML de portapapeles.
 * Solo extrae textContent (jamás interpreta scripts/atributos) y expande
 * colspan y rowspan con celdas vacías para conservar la geometría: un
 * carry por columna (pendingSpans) reserva las posiciones ocupadas por
 * celdas fusionadas verticalmente para que las filas siguientes no se
 * desplacen.
 *
 * @param {string} html
 * @param {Object} [guardrails]
 * @returns {{matrix: string[][], truncated: boolean}|null} null si no hay tabla
 */
export function parseHtmlTable(html, guardrails = getGuardrails()) {
    if (!html) {
        return null;
    }
    let doc;
    try {
        doc = new DOMParser().parseFromString(String(html), "text/html");
    } catch {
        return null;
    }
    const table = doc.querySelector("table");
    if (!table) {
        return null;
    }
    const matrix = [];
    let truncated = false;
    // pendingSpans[col] = filas restantes en las que `col` sigue ocupada
    // por el rowspan de una celda de una fila anterior.
    const pendingSpans = [];
    for (const tr of table.querySelectorAll("tr")) {
        if (matrix.length >= guardrails.maxRows) {
            truncated = true;
            break;
        }
        const row = [];
        const cellEls = tr.querySelectorAll("td, th");
        let next = 0;
        while (
            row.length < guardrails.maxCols &&
            (next < cellEls.length || pendingSpans[row.length] > 0)
        ) {
            if (pendingSpans[row.length] > 0) {
                pendingSpans[row.length]--;
                row.push("");
                continue;
            }
            const cellEl = cellEls[next++];
            const colspan = spanOf(cellEl, "colspan");
            const rowspan = spanOf(cellEl, "rowspan");
            const value = sanitizeCell(
                cellEl.textContent || "",
                guardrails.maxCellChars
            );
            for (let span = 0; span < colspan; span++) {
                if (row.length >= guardrails.maxCols) {
                    truncated = true;
                    break;
                }
                if (rowspan > 1) {
                    pendingSpans[row.length] = rowspan - 1;
                }
                row.push(span === 0 ? value : "");
            }
        }
        if (next < cellEls.length) {
            truncated = true;
        }
        matrix.push(row);
    }
    return { matrix, truncated };
}

function normalizeMatrix(matrix) {
    let width = 0;
    for (const row of matrix) {
        width = Math.max(width, row.length);
    }
    for (const row of matrix) {
        while (row.length < width) {
            row.push("");
        }
    }
    return width;
}

/**
 * Punto de entrada: parsea el contenido de un evento paste.
 *
 *     const { matrix } = parseClipboard({
 *         html: ev.clipboardData.getData("text/html"),
 *         text: ev.clipboardData.getData("text/plain"),
 *     });
 *
 * Prefiere la tabla HTML (geometría fiel, celdas multilinea sin
 * ambigüedad) y cae a TSV si no hay tabla. La matriz resultante siempre
 * es rectangular (filas rellenadas con "").
 *
 * @param {{html?: string, text?: string}} data
 * @param {Object} [guardrails] inyectable en tests
 * @returns {{matrix: string[][], rowCount: number, colCount: number,
 *            truncated: boolean, source: "html"|"text"|"empty"}}
 */
export function parseClipboard(data = {}, guardrails = getGuardrails()) {
    let parsed = parseHtmlTable(data.html, guardrails);
    let source = "html";
    if (!parsed) {
        const text = String(data.text ?? "");
        if (!text.trim()) {
            return { matrix: [], rowCount: 0, colCount: 0, truncated: false, source: "empty" };
        }
        parsed = parseTsv(text, guardrails);
        source = "text";
    }
    const colCount = normalizeMatrix(parsed.matrix);
    return {
        matrix: parsed.matrix,
        rowCount: parsed.matrix.length,
        colCount,
        truncated: parsed.truncated,
        source,
    };
}
