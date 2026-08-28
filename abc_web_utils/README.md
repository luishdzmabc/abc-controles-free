# ABC Web Utils (`abc_web_utils`)

Módulo base de la **línea UI de ABC** para Odoo 19 Community. Contiene
**exclusivamente infraestructura compartida** — cero features visibles.
Instalarlo **no cambia ningún comportamiento** de Odoo (regla C3) y
desinstalarlo no deja rastro (limpieza de parámetros vía `uninstall_hook`,
regla A10).

- **Licencia:** LGPL-3 · **Autor:** ABC · **Versión:** 19.0.1.0.0
- **Depende de:** `web`, `base_setup`

## ¿Para qué sirve?

Todos los controles ABC (`abc_xlsx_paste`, `abc_list_totals`,
`abc_preview_cfdi`, ganchos gratuitos, etc.) consumen esta caja de
herramientas en lugar de reimplementarla. Los puntos de contacto frágiles
con el core se concentran aquí para migrar una sola vez en cada release
anual de Odoo.

## Componentes

### Frontend (`static/src/`)

| Archivo | Qué aporta |
|---|---|
| `core/patch_utils.js` | Helpers de `patch()` **aditivo** con unpatch de limpieza: `applyPatch`, `applyPatchOnce(key, ...)` y `PatchGroup` (cleanup LIFO). |
| `core/local_store.js` | Persistencia `localStorage` con claves namespaced `abc_web_utils/<db>/<modelo>/<uid>/<clave>`: nunca contamina entre bases ni usuarios; JSON corrupto o cuota llena degradan al default. |
| `core/clipboard.js` | Parseo de portapapeles de Excel/Calc (TSV con celdas entrecomilladas y tabla HTML) a matriz rectangular sanitizada. Guardrails: **500 filas × 50 columnas** por default. |
| `core/viewer_registry.js` | Registry propio `registry.category("abc_viewers")` mimetype → componente OWL, con resolución exacto → familia (`image/*`) → comodín. Base de los visores futuros. |
| `services/progress_overlay.js/.xml/.scss` | Servicio `abc_progress_overlay` (registry de servicios) que monta un overlay bloqueante en `main_components` con barra de progreso, % y tiempo transcurrido/estimado. |

Uso del overlay:

```js
const progress = useService("abc_progress_overlay");
progress.start(nLotes, "Importando facturas...");
// ... por cada lote procesado:
progress.update(lotesHechos);
progress.stop();
```

Uso del store local:

```js
import { makeLocalStore } from "@abc_web_utils/core/local_store";
const store = makeLocalStore("account.move");
store.set("column_widths", { name: 120 });
const widths = store.get("column_widths", {});
```

Uso del portapapeles:

```js
import { parseClipboard } from "@abc_web_utils/core/clipboard";
const { matrix, truncated } = parseClipboard({
    html: ev.clipboardData.getData("text/html"),
    text: ev.clipboardData.getData("text/plain"),
});
```

### Backend (`models/`, `helpers/`)

| Archivo | Qué aporta |
|---|---|
| `helpers/limits.py` | Guardrails de recursos (C5): límites con defaults seguros, configurables por `ir.config_parameter` (`abc_web_utils.limit_*`) y con **topes duros** que un valor mal capturado no puede rebasar. |
| `models/res_config_settings.py` | Capa de config (A4): campos transient con `config_parameter` para los límites + helpers genéricos `abc_get_bool_param` / `abc_get_int_param` / `abc_set_bool_param` con semántica tolerante. |
| `models/ir_http.py` | Puente sesión (B5): `session_info()` expone `abc_web_utils.settings` (límites + toggles) al arranque del web client, **sin RPCs extra**. Punto de extensión `_abc_web_utils_toggles()` para módulos hijos. |
| `hooks.py` | `uninstall_hook` que elimina todos los `ir.config_parameter` del namespace `abc_web_utils.` (A10). |

Cómo declara un módulo hijo su toggle (sin sobreescribir `session_info`):

```python
class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def _abc_web_utils_toggles(self):
        toggles = super()._abc_web_utils_toggles()
        toggles["sticky_headers"] = ("abc_list_sticky.enabled", False)
        return toggles
```

Y cómo lo lee en JS:

```js
import { session } from "@web/session";
const settings = session["abc_web_utils.settings"] || {};
if (settings.sticky_headers) { /* ... */ }
```

### Guardrails configurables

| Parámetro (`ir.config_parameter`) | Default | Tope duro |
|---|---|---|
| `abc_web_utils.limit_clipboard_max_rows` | 500 | 5000 |
| `abc_web_utils.limit_clipboard_max_cols` | 50 | 200 |
| `abc_web_utils.limit_clipboard_max_cell_chars` | 5000 | 100000 |

Valores vacíos, no numéricos o ≤ 0 caen siempre al default: la mala
configuración **nunca desactiva un guardrail**.

## Testing (patrón C1, tres capas)

- `tests/test_config.py` — `TransactionCase`: límites, toggles, payload de
  sesión y limpieza del `uninstall_hook`.
- `static/tests/*.test.js` — suite **HOOT** de `local_store` y `clipboard`
  (funciones puras con dependencias inyectadas).
- `tests/test_js.py` — `HttpCase` que corre la suite HOOT en el navegador
  (`/web/tests?...&filter=abc_web_utils`).

Ejecución:

```bash
odoo-bin -d <db> -i abc_web_utils --test-tags /abc_web_utils --stop-after-init
```

## Convenciones

- OWL 2.x (`Component`, `useState`, `useService`), **sin jQuery ni
  `odoo.define` legacy**.
- Templates con prefijo `abc_web_utils.`.
- Solo `patch()` aditivo / `_inherit`: nunca fork del core (A1).
- Encabezado de copyright ABC + LGPL-3 en cada archivo.
- i18n: `i18n/es_MX.po` (los strings fuente están en inglés).
