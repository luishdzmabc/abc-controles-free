/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * Tests HOOT del parseo de portapapeles (patrón C1). Los guardrails se
 * inyectan explícitamente para no depender de session_info.
 */

import { describe, expect, test } from "@odoo/hoot";

import {
    DEFAULT_GUARDRAILS,
    parseClipboard,
    parseHtmlTable,
    parseTsv,
    sanitizeCell,
} from "@abc_web_utils/core/clipboard";

const WIDE_LIMITS = { maxRows: 500, maxCols: 50, maxCellChars: 5000 };

describe("abc_web_utils", () => {
    describe("clipboard", () => {
        test("parsea TSV simple a matriz", () => {
            const { matrix, truncated } = parseTsv("a\tb\tc\n1\t2\t3\n", WIDE_LIMITS);
            expect(matrix).toEqual([
                ["a", "b", "c"],
                ["1", "2", "3"],
            ]);
            expect(truncated).toBe(false);
        });

        test("acepta finales de línea \\r\\n y \\r", () => {
            const { matrix } = parseTsv("a\tb\r\nc\td\re\tf", WIDE_LIMITS);
            expect(matrix).toEqual([
                ["a", "b"],
                ["c", "d"],
                ["e", "f"],
            ]);
        });

        test("celdas entrecomilladas estilo Excel: saltos, tabs y comillas escapadas", () => {
            const text = '"linea1\nlinea2"\t"con\ttab"\t"di""jo"\nx\ty\tz\n';
            const { matrix } = parseTsv(text, WIDE_LIMITS);
            expect(matrix[0]).toEqual(["linea1\nlinea2", "con\ttab", 'di"jo']);
            expect(matrix[1]).toEqual(["x", "y", "z"]);
        });

        test("trunca filas y columnas según guardrails y lo reporta", () => {
            const tight = { maxRows: 2, maxCols: 2, maxCellChars: 5000 };
            const text = "a\tb\tc\nd\te\tf\ng\th\ti\n";
            const { matrix, truncated } = parseTsv(text, tight);
            expect(matrix).toEqual([
                ["a", "b"],
                ["d", "e"],
            ]);
            expect(truncated).toBe(true);
        });

        test("sanitizeCell: NBSP, caracteres de control, trim y tope de longitud", () => {
            expect(sanitizeCell("\u00a0hola\u00a0mundo ")).toBe("hola mundo");
            expect(sanitizeCell("a\u0000b\u0007c\u007Fd")).toBe("abcd");
            expect(sanitizeCell("  con\ninterno  ")).toBe("con\ninterno");
            expect(sanitizeCell("abcdef", 3)).toBe("abc");
            expect(sanitizeCell("linea1\r\nlinea2")).toBe("linea1\nlinea2");
            expect(sanitizeCell("a\rb")).toBe("a\nb");
            expect(sanitizeCell(null)).toBe("");
            expect(sanitizeCell(123)).toBe("123");
        });

        test("parsea una tabla HTML de Excel y expande colspan", () => {
            const html =
                "<html><body><table><tr><td>a</td><td colspan='2'>b</td></tr>" +
                "<tr><th>c</th><td>d</td><td>e</td></tr></table></body></html>";
            const parsed = parseHtmlTable(html, WIDE_LIMITS);
            expect(parsed.matrix).toEqual([
                ["a", "b", ""],
                ["c", "d", "e"],
            ]);
            expect(parsed.truncated).toBe(false);
        });

        test("expande rowspan con celdas vacías en las filas siguientes", () => {
            const html =
                "<table>" +
                "<tr><td rowspan='2'>a</td><td>b</td><td>c</td></tr>" +
                "<tr><td>d</td><td>e</td></tr>" +
                "<tr><td>f</td><td>g</td><td>h</td></tr>" +
                "</table>";
            const parsed = parseHtmlTable(html, WIDE_LIMITS);
            expect(parsed.matrix).toEqual([
                ["a", "b", "c"],
                ["", "d", "e"],
                ["f", "g", "h"],
            ]);
            expect(parsed.truncated).toBe(false);
        });

        test("combina rowspan y colspan sin desplazar columnas", () => {
            // Celda fusionada 2x2 en la esquina superior izquierda.
            const html =
                "<table>" +
                "<tr><td rowspan='2' colspan='2'>a</td><td>b</td></tr>" +
                "<tr><td>c</td></tr>" +
                "</table>";
            expect(parseHtmlTable(html, WIDE_LIMITS).matrix).toEqual([
                ["a", "", "b"],
                ["", "", "c"],
            ]);
        });

        test("HTML sin tabla devuelve null y parseClipboard cae a TSV", () => {
            expect(parseHtmlTable("<div>sin tabla</div>", WIDE_LIMITS)).toBe(null);
            const result = parseClipboard(
                { html: "<div>sin tabla</div>", text: "a\tb\n" },
                WIDE_LIMITS
            );
            expect(result.source).toBe("text");
            expect(result.matrix).toEqual([["a", "b"]]);
        });

        test("parseClipboard prefiere la tabla HTML sobre el texto", () => {
            const result = parseClipboard(
                {
                    html: "<table><tr><td>html</td></tr></table>",
                    text: "texto\tplano\n",
                },
                WIDE_LIMITS
            );
            expect(result.source).toBe("html");
            expect(result.matrix).toEqual([["html"]]);
        });

        test("parseClipboard normaliza la matriz a rectangular", () => {
            const result = parseClipboard({ text: "a\tb\tc\nd\n" }, WIDE_LIMITS);
            expect(result.colCount).toBe(3);
            expect(result.matrix[1]).toEqual(["d", "", ""]);
        });

        test("entrada vacía produce matriz vacía sin errores", () => {
            const result = parseClipboard({ text: "   \n" }, WIDE_LIMITS);
            expect(result.matrix).toEqual([]);
            expect(result.rowCount).toBe(0);
            expect(result.source).toBe("empty");
        });

        test("los defaults de guardrails son 500x50 (regla C5)", () => {
            expect(DEFAULT_GUARDRAILS.maxRows).toBe(500);
            expect(DEFAULT_GUARDRAILS.maxCols).toBe(50);
        });
    });
});
