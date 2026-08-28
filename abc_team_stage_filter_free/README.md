# ABC Team Stage Filter (Free)

Free hook of the ABC controls suite (`abc_*`).

## What it does

When a user belongs to more than one team (e.g. two Sales Teams in the CRM
Pipeline, or two Helpdesk teams), a Kanban grouped by stage shows the stages
of **all** of that user's teams merged together, because each team can
define its own funnel. It gets confusing fast — columns from a team that
doesn't apply to the record you're looking at.

This adds a small team selector next to the view-switcher icons (list,
calendar, pivot, ...). Picking a team scopes the Kanban to that team's own
records and stages — the same result as opening that team's own pipeline
action. Picking "All teams" restores the default merged view.

The selector only appears once the user actually belongs to **2 or more**
teams for the current model. For everyone else, nothing changes.

## Usage

Nothing to configure. Install the module and, on a Kanban of a supported
model (CRM Pipeline out of the box), the selector shows up automatically for
any user in 2+ teams.

## Extending to another model

The control is config-driven, not hardcoded to CRM. Register another
model with the same team/stage shape from your own module:

```js
import { registerTeamStageModel } from "@abc_team_stage_filter_free/team_stage_filter";

registerTeamStageModel("helpdesk.ticket", {
    teamField: "team_id",
    stageField: "stage_id",
    teamModel: "helpdesk.team",
    memberField: "member_ids",
});
```

## Design

- **Pure frontend.** Patches `KanbanController` (additive, reversible via
  `applyPatchOnce` from `abc_web_utils`) to expose the selector and
  `ControlPanel` (same helper) to render it next to the view-switcher icons.
- **Reuses the stock stage-scoping mechanism.** Odoo's `group_expand` for a
  team-scoped stage field already limits the columns shown when
  `default_<teamField>` is present in the context — the same thing a team's
  own pipeline action does. This module just sets that context (and the
  matching domain leg) from the selector instead of from a fixed action.
  No core override, no new fields.
- **Per-user, per-database preference**, stored via `makeLocalStore` from
  `abc_web_utils` (namespaced by database + model + user, never bleeds
  across users or databases sharing a browser).
- **Zero configuration, zero business models.** Activates on install,
  deactivates cleanly on uninstall; no server data or behavior changes.

## Español

Gancho gratuito de la línea de controles ABC (`abc_*`).

### Qué hace

Cuando un usuario pertenece a más de un equipo (p. ej. dos Equipos de venta
en el Pipeline de CRM, o dos equipos de Helpdesk), un Kanban agrupado por
etapa muestra las etapas de **todos** sus equipos mezcladas, porque cada
equipo puede tener su propio embudo. Rápido se vuelve confuso.

Esto agrega un pequeño selector de equipo junto a los íconos de cambio de
vista (lista, calendario, pivote, ...). Al elegir un equipo, el Kanban se
limita a los registros y etapas de ese equipo — el mismo resultado que abrir
el pipeline propio de ese equipo. "Todos los equipos" restaura la vista
combinada de siempre.

El selector solo aparece cuando el usuario pertenece a **2 o más** equipos
del modelo actual. Para todos los demás, no cambia nada.

### Uso

Nada que configurar. Al instalar el módulo, en un Kanban de un modelo
soportado (el Pipeline de CRM de fábrica), el selector aparece
automáticamente para cualquier usuario con 2+ equipos.

### Extenderlo a otro modelo

```js
import { registerTeamStageModel } from "@abc_team_stage_filter_free/team_stage_filter";

registerTeamStageModel("helpdesk.ticket", {
    teamField: "team_id",
    stageField: "stage_id",
    teamModel: "helpdesk.team",
    memberField: "member_ids",
});
```

### Licencia

LGPL-3. Parte de la línea de controles ABC (suite `abc_*`).

## Deutsch

Kostenloser Baustein der ABC-Steuerungssuite (`abc_*`).

### Was es tut

Wenn ein Benutzer zu mehr als einem Team gehört (z. B. zwei Verkaufsteams in
der CRM-Pipeline oder zwei Helpdesk-Teams), zeigt ein nach Phase gruppiertes
Kanban die Phasen **aller** Teams dieses Benutzers gemischt an, da jedes
Team seinen eigenen Trichter definieren kann. Das wird schnell
unübersichtlich.

Dies fügt neben den Symbolen zum Wechseln der Ansicht (Liste, Kalender,
Pivot, ...) eine kleine Team-Auswahl hinzu. Die Wahl eines Teams beschränkt
das Kanban auf die Datensätze und Phasen dieses Teams — dasselbe Ergebnis
wie das Öffnen der eigenen Pipeline-Aktion dieses Teams. "Alle Teams"
stellt die standardmäßig zusammengeführte Ansicht wieder her.

Die Auswahl erscheint nur, wenn der Benutzer tatsächlich zu **2 oder mehr**
Teams des aktuellen Modells gehört. Für alle anderen ändert sich nichts.

### Verwendung

Nichts einzurichten. Nach der Installation erscheint die Auswahl in einem
Kanban eines unterstützten Modells (von Haus aus die CRM-Pipeline)
automatisch für jeden Benutzer mit 2+ Teams.

### Lizenz

LGPL-3. Teil der ABC-Steuerungssuite (`abc_*`).

## Français

Brique gratuite de la suite de contrôles ABC (`abc_*`).

### Ce que ça fait

Lorsqu'un utilisateur appartient à plus d'une équipe (par ex. deux équipes
commerciales dans le Pipeline CRM, ou deux équipes Helpdesk), un Kanban
groupé par étape affiche les étapes de **toutes** les équipes de cet
utilisateur mélangées, car chaque équipe peut définir son propre entonnoir.
Cela devient vite confus.

Ceci ajoute un petit sélecteur d'équipe à côté des icônes de changement de
vue (liste, calendrier, pivot, ...). Choisir une équipe limite le Kanban aux
enregistrements et étapes de cette équipe — le même résultat que d'ouvrir
l'action de pipeline propre à cette équipe. "Toutes les équipes" restaure
la vue fusionnée par défaut.

Le sélecteur n'apparaît que lorsque l'utilisateur appartient réellement à
**2 équipes ou plus** pour le modèle courant. Pour tous les autres, rien ne
change.

### Utilisation

Rien à configurer. Après l'installation, dans un Kanban d'un modèle pris en
charge (le Pipeline CRM de base), le sélecteur apparaît automatiquement
pour tout utilisateur ayant 2 équipes ou plus.

### Licence

LGPL-3. Fait partie de la suite de contrôles ABC (`abc_*`).
