# ABC Group Tools (Free) 

Modulo gratuito de la **línea de controles ABC** para Odoo 19 Community. Añade dos comodidades a las vistas **agrupadas**, sin ninguna configuración:

- Agrega los botones **Expand all / Collapse all** en las listas y el kanban al estar agrupados: pliega o despliega todos los grupos de un clic, en vez de uno por uno.
- Una **píldora con el conteo de registros** por grupo (encabezado de grupo en lista y columna en kanban), con la marca ABC.

- **Licencia:** LGPL-3 · **Autor:** ABC · **Versión:** 19.0.1.0.0
- **Depende de:** `web`, `abc_web_utils`

## Cómo funciona

Es **Diseno puro y aditivo**: Le agrega funciones nuevas a las pantallas de lista y de tablero de Odoo, reutilizando una misma pieza de código compartida para no repetirla en cada una. (Los cambios son reversibles) y hereda las plantillas de odoo core. No sobreescribe ningún método nativo, no declara modelos de negocio y **no tiene ajustes**: se activa al instalar y desinstalar no deja rastro.

Puntos de anclaje verificados contra la imagen `odoo:19.0`:

## Qué se añade 

- **Barra de botones** en la lista, solo cuando la lista esta agrupada 
-  **píldora de conteo** en cada grupo
-  **Barra de botones** dentro de la vista **kanban** 
-  **píldora de conteo** tras el título de la columna 

Ambos renderers exponen el mismo contrato, así que expandir/colapsar recorre los grupos de primer nivel y alterna solo los que hacen falta.

## Testing

- **Prueba de pantalla**: Simula una lista y kanban agrupados y revisa que los botones + píldora aparezcan junto con los botones expandir/colapsar, todo opera sobre los grupos.
- **Prueba de Navegador**: Corre la prueba anterior dentro de una pantalla de navegador real, para verificar que funciona ahi que corre la suite HOOT en el navegador.
- **Prueba rapida de instalacion**: confirma que el modulo se instala sin errores .

```bash
odoo-bin -d <db> -i abc_group_tools_free \
    --test-enable --test-tags /abc_group_tools_free --stop-after-init
```

## Parte de la línea de controles ABC

Este es un control **gratuito** de ABC. Comparte la infraestructura común del módulo base `abc_web_utils` con el resto de controles de pago de la línea. Escríbenos en `https://abcsas.com`.
