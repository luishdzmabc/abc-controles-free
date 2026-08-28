/* Copyright (C) 2026 ABC S&S (https://abcsas.com).
 * License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
 *
 * EN — Kanban team selector. When a user belongs to 2+ teams (e.g. two CRM
 * Sales Teams), a Kanban grouped by stage shows every team's stages merged
 * together, because each team can have its own funnel. This hook adds a
 * selector next to the view-switcher icons: picking a team scopes the
 * Kanban to that team's own records AND stage columns.
 *
 * ES — Selector de equipo para el Kanban. Cuando un usuario pertenece a 2+
 * equipos (p. ej. dos Equipos de venta en CRM), un Kanban agrupado por
 * etapa muestra las etapas de todos los equipos mezcladas, porque cada
 * equipo puede tener su propio embudo. Este gancho agrega un selector junto
 * a los íconos de cambio de vista: al elegir un equipo, el Kanban se limita
 * a los registros Y las columnas de etapa propias de ese equipo.
 *
 * DE — Team-Auswahl für das Kanban. Gehört ein Benutzer zu 2+ Teams (z. B.
 * zwei CRM-Verkaufsteams), zeigt ein nach Phase gruppiertes Kanban die
 * Phasen aller Teams gemischt an, da jedes Team einen eigenen Trichter
 * haben kann. Dieser Baustein fügt eine Auswahl neben den Symbolen zum
 * Wechseln der Ansicht hinzu: Die Wahl eines Teams beschränkt das Kanban
 * auf die Datensätze UND Phasenspalten dieses Teams.
 *
 * FR — Sélecteur d'équipe pour le Kanban. Quand un utilisateur appartient à
 * 2 équipes ou plus (par ex. deux équipes commerciales CRM), un Kanban
 * groupé par étape affiche les étapes de toutes les équipes mélangées, car
 * chaque équipe peut avoir son propre entonnoir. Ce module ajoute un
 * sélecteur à côté des icônes de changement de vue : choisir une équipe
 * limite le Kanban aux enregistrements ET aux colonnes d'étape de cette
 * équipe.
 *
 * ---
 *
 * EN — IMPORTANT, learned from a live test (not assumed): CRM's own
 * group_expand for `stage_id` (`_read_group_stage_ids`) always returns
 * EVERY stage, unconditionally — it ignores both the search domain and any
 * `default_<teamField>` context key. So a domain/context trick alone (the
 * approach this file used before) narrows which RECORDS show but not which
 * COLUMNS render: every stage of every team still appears, just empty for
 * the ones that don't apply. To actually narrow the columns we compute the
 * allowed stage names ourselves (`stageModel`/`stageTeamField` below, e.g.
 * crm.stage.team_ids — a Many2many, a stage can belong to several teams or
 * to none, meaning "shared") and hide the rest client-side by column title,
 * next to the KanbanRenderer patch. Deliberately data-driven (title text),
 * not private Model-internals surgery, matching the rest of the ABC line.
 *
 * ES — IMPORTANTE, aprendido en una prueba en vivo (no supuesto): el propio
 * group_expand de CRM para `stage_id` (`_read_group_stage_ids`) siempre
 * devuelve TODAS las etapas, sin condición — ignora tanto el dominio de
 * búsqueda como cualquier clave `default_<teamField>` del contexto. Así que
 * el truco de dominio/contexto por sí solo (lo que este archivo hacía antes)
 * limita qué REGISTROS salen pero no qué COLUMNAS se pintan: siguen
 * apareciendo todas las etapas de todos los equipos, solo que vacías para
 * las que no aplican. Para limitar de verdad las columnas, calculamos
 * nosotros mismos las etapas permitidas (`stageModel`/`stageTeamField` abajo,
 * p. ej. crm.stage.team_ids — un Many2many, una etapa puede ser de varios
 * equipos o de ninguno, es decir "compartida") y ocultamos el resto del
 * lado del cliente por el título de columna, junto al parche de
 * KanbanRenderer. A propósito basado en datos (texto del título), no
 * cirugía sobre internos privados del Model, igual que el resto de la
 * línea ABC.
 *
 * DE — WICHTIG, aus einem Live-Test gelernt (nicht angenommen): CRMs
 * eigene group_expand für `stage_id` (`_read_group_stage_ids`) liefert
 * immer ALLE Phasen zurück, bedingungslos — sie ignoriert sowohl die
 * Such-Domain als auch jeden `default_<teamField>`-Kontextschlüssel. Der
 * Domain-/Kontext-Trick allein (der frühere Ansatz dieser Datei) schränkt
 * also ein, welche DATENSÄTZE angezeigt werden, aber nicht welche SPALTEN
 * gerendert werden: weiterhin erscheinen alle Phasen aller Teams, nur leer
 * für die nicht zutreffenden. Um die Spalten wirklich einzuschränken,
 * berechnen wir die erlaubten Phasennamen selbst (`stageModel`/
 * `stageTeamField` unten, z. B. crm.stage.team_ids) und blenden den Rest
 * clientseitig anhand des Spaltentitels aus, neben dem KanbanRenderer-Patch.
 *
 * FR — IMPORTANT, appris lors d'un test en direct (pas supposé) : le
 * group_expand propre de CRM pour `stage_id` (`_read_group_stage_ids`)
 * renvoie toujours TOUTES les étapes, sans condition — il ignore à la fois
 * le domaine de recherche et toute clé de contexte `default_<teamField>`.
 * L'astuce domaine/contexte seule (l'approche précédente de ce fichier)
 * limite donc quels ENREGISTREMENTS s'affichent mais pas quelles COLONNES
 * se dessinent. Pour vraiment limiter les colonnes, nous calculons
 * nous-mêmes les noms d'étapes autorisés (`stageModel`/`stageTeamField`
 * ci-dessous) et masquons le reste côté client par le titre de colonne, à
 * côté du patch de KanbanRenderer.
 */

import { KanbanController } from "@web/views/kanban/kanban_controller";
import { KanbanRenderer } from "@web/views/kanban/kanban_renderer";
import { ControlPanel } from "@web/search/control_panel/control_panel";
import { useService } from "@web/core/utils/hooks";
import { Domain } from "@web/core/domain";
import { _t } from "@web/core/l10n/translation";
// EN: `user` is a plain singleton (not a registered service) — useService("user")
// throws "Service user is not available" and breaks the whole Kanban.
// ES: `user` es un singleton simple (no un servicio registrado) — useService("user")
// lanza "Service user is not available" y rompe todo el Kanban.
// DE: `user` ist ein einfaches Singleton (kein registrierter Service) — useService("user")
// wirft "Service user is not available" und zerstört das gesamte Kanban.
// FR: `user` est un singleton simple (pas un service enregistré) — useService("user")
// lève "Service user is not available" et casse tout le Kanban.
import { user } from "@web/core/user";
import { applyPatchOnce } from "@abc_web_utils/core/patch_utils";
import { makeLocalStore } from "@abc_web_utils/core/local_store";
import { onWillStart, useState, useEffect, useChildSubEnv } from "@odoo/owl";

/*
 * EN — resModel -> {teamField, stageField, teamModel, memberField,
 * stageModel, stageTeamField}. The last two are optional: without them the
 * control still scopes which RECORDS show (teamField domain) but not which
 * COLUMNS render, since group_expand can't be trusted to filter (see the
 * long note above). Register another model with the same shape via
 * `registerTeamStageModel` — no core change needed.
 *
 * ES — modelo -> {teamField, stageField, teamModel, memberField,
 * stageModel, stageTeamField}. Los 2 últimos son opcionales: sin ellos el
 * control igual limita qué REGISTROS salen (dominio de teamField) pero no
 * qué COLUMNAS se pintan, porque no se puede confiar en group_expand para
 * filtrar (ver la nota larga arriba). Registra otro modelo con la misma
 * forma con `registerTeamStageModel` — sin tocar el núcleo.
 *
 * DE — Modell -> {teamField, stageField, teamModel, memberField,
 * stageModel, stageTeamField}. Die letzten beiden sind optional: ohne sie
 * schränkt die Steuerung weiterhin ein, welche DATENSÄTZE angezeigt werden,
 * aber nicht welche SPALTEN gerendert werden. Ein weiteres Modell mit
 * derselben Struktur wird über `registerTeamStageModel` registriert.
 *
 * FR — modèle -> {teamField, stageField, teamModel, memberField,
 * stageModel, stageTeamField}. Les 2 derniers sont facultatifs : sans eux,
 * le contrôle limite quand même quels ENREGISTREMENTS s'affichent mais pas
 * quelles COLONNES se dessinent. Enregistrez un autre modèle avec la même
 * forme via `registerTeamStageModel`.
 */
export const TEAM_STAGE_CONFIG = {
    "crm.lead": {
        teamField: "team_id",
        stageField: "stage_id",
        teamModel: "crm.team",
        memberField: "member_ids",
        stageModel: "crm.stage",
        stageTeamField: "team_ids",
    },
};

/** EN/ES/DE/FR: add a resModel to TEAM_STAGE_CONFIG (e.g. from another module). */
export function registerTeamStageModel(resModel, config) {
    TEAM_STAGE_CONFIG[resModel] = config;
}

applyPatchOnce("abc_team_stage_filter_free.KanbanController", KanbanController.prototype, {
    setup() {
        super.setup(...arguments);
        this.abcConfig = TEAM_STAGE_CONFIG[this.props.resModel];
        if (!this.abcConfig) {
            return;
        }

        this.orm = useService("orm");
        this.abcState = useState({ teams: [], selectedTeamId: null, allowedStageNames: null });
        this._abcStageCache = new Map();
        // EN: namespaced by db/model/uid, so preferences never bleed across
        // databases or users on the same browser (abc_web_utils helper).
        // ES: con namespace por base/modelo/uid, así las preferencias nunca
        // se mezclan entre bases ni entre usuarios del mismo navegador.
        // DE: nach db/Modell/uid mit Namespace versehen, sodass sich
        // Einstellungen nie zwischen Datenbanken oder Benutzern vermischen.
        // FR: avec un espace de noms par base/modèle/uid, les préférences
        // ne se mélangent jamais entre bases ni entre utilisateurs.
        this.abcStore = makeLocalStore(`abc_team_stage_filter_free.${this.props.resModel}`);

        useChildSubEnv({
            abcTeamStageFilter: {
                state: this.abcState,
                select: (teamId) => this.abcSelectTeam(teamId),
            },
        });

        onWillStart(async () => {
            const { teamModel, memberField } = this.abcConfig;
            this.abcState.teams = await this.orm.searchRead(
                teamModel,
                [[memberField, "in", [user.userId]]],
                ["id", "name"],
                { order: "name" }
            );
            if (this.abcState.teams.length < 2) {
                return; // EN: nothing to disambiguate / ES: nada que desambiguar.
            }
            const savedId = this.abcStore.get("selected_team_id", null);
            if (savedId && this.abcState.teams.some((t) => t.id === savedId)) {
                this.abcState.selectedTeamId = savedId;
            }
        });

        /* EN: reacts ONLY to the search bar changing props.domain (e.g. the
         * user adds an unrelated filter): the framework's own reload for
         * that happens first, without our team leg, but this effect fires
         * right after and re-applies the CURRENT team, so the team scope
         * survives search bar activity. Also covers the very first render,
         * re-applying a team restored from storage in onWillStart.
         *
         * Deliberately NOT watching `selectedTeamId` here — verified live,
         * with temporary console patches, that mutating it from
         * `abcSelectTeam` (a plain instance method, called from the
         * ControlPanel's own onChange handler through the env bridge) does
         * not reliably re-trigger this effect in practice, for reasons that
         * did not fully surface even instrumenting Owl's own reactive
         * plumbing. Rather than depend on that dependency link, the
         * interactive path calls `_abcApplyTeamFilter` directly below —
         * imperative and provably correct beats a reactive link that
         * silently doesn't fire.
         *
         * ES: reacciona SOLO a que la barra de búsqueda cambie props.domain
         * (p. ej. el usuario agrega otro filtro): la recarga propia del
         * framework para eso ocurre primero, sin nuestra pata de equipo,
         * pero este efecto se dispara justo después y reaplica el equipo
         * ACTUAL, así la acotación por equipo sobrevive a la actividad de
         * la barra de búsqueda. También cubre el primer render, reaplicando
         * un equipo restaurado del storage en onWillStart.
         *
         * A propósito NO se observa `selectedTeamId` aquí — se verificó en
         * vivo, con parches temporales de consola, que mutarlo desde
         * `abcSelectTeam` (un método normal de instancia, llamado desde el
         * manejador de cambio del propio ControlPanel a través del puente
         * de entorno) no vuelve a disparar este efecto de forma confiable
         * en la práctica, por razones que no terminaron de salir a la luz
         * ni instrumentando la plomería reactiva propia de Owl. En vez de
         * depender de ese enlace reactivo, la ruta interactiva llama
         * `_abcApplyTeamFilter` directo más abajo — imperativo y
         * comprobadamente correcto le gana a un enlace reactivo que en
         * silencio no se dispara.
         *
         * DE: reagiert NUR auf eine Änderung von props.domain durch die
         * Suchleiste. Beobachtet `selectedTeamId` hier ABSICHTLICH NICHT —
         * live mit temporären Konsolen-Patches verifiziert, dass das
         * Mutieren dieses Werts aus `abcSelectTeam` diesen Effekt in der
         * Praxis nicht zuverlässig erneut auslöst. Der interaktive Pfad
         * ruft stattdessen `_abcApplyTeamFilter` direkt auf.
         *
         * FR: réagit UNIQUEMENT à un changement de props.domain par la
         * barre de recherche. N'observe DÉLIBÉRÉMENT PAS `selectedTeamId`
         * ici — vérifié en direct que muter cette valeur depuis
         * `abcSelectTeam` ne redéclenche pas cet effet de façon fiable. Le
         * chemin interactif appelle directement `_abcApplyTeamFilter`.
         *
         * EN/ES/DE/FR: braced so the callback returns undefined — a
         * returned value is treated as the cleanup function; returning the
         * Promise from an earlier version of this call made Owl try to
         * invoke a Promise as a function ("cleanup is not a function"),
         * which took down Owl's entire scheduler (every view went blank,
         * confirmed from a real user-reported traceback). Never return
         * anything from a useEffect callback. */
        useEffect(
            () => {
                if (this.abcState.selectedTeamId) {
                    this._abcApplyTeamFilter(this.abcState.selectedTeamId);
                }
            },
            () => [JSON.stringify(this.props.domain)]
        );
    },

    abcSelectTeam(teamId) {
        this.abcState.selectedTeamId = teamId || null;
        this.abcStore.set("selected_team_id", this.abcState.selectedTeamId);
        this._abcApplyTeamFilter(this.abcState.selectedTeamId);
    },

    async _abcApplyTeamFilter(teamId) {
        const { teamField } = this.abcConfig;
        const extraDomain = teamId ? [[teamField, "=", teamId]] : [];
        this.model.load({
            domain: Domain.and([this.props.domain || [], extraDomain]).toList(),
            context: { ...this.props.context, [`default_${teamField}`]: teamId || false },
        });
        this.abcState.allowedStageNames = await this._abcAllowedStageNames(teamId);
    },

    /* EN: null = no restriction (show every column, "All teams"). Otherwise
     * the list of stage names allowed for this team: stages with no team
     * at all (shared/global) plus the ones that include this team. Cached
     * per team for the controller's lifetime — stage/team assignments don't
     * change mid-session, and this runs on every team switch.
     * ES: null = sin restricción (mostrar todas las columnas, "Todos los
     * equipos"). Si no, la lista de nombres de etapa permitidos para ese
     * equipo: etapas sin ningún equipo (compartidas/globales) más las que
     * incluyen a ese equipo. Cacheado por equipo durante la vida del
     * controlador. */
    async _abcAllowedStageNames(teamId) {
        const { stageModel, stageTeamField } = this.abcConfig;
        if (!teamId || !stageModel || !stageTeamField) {
            return null;
        }
        if (this._abcStageCache.has(teamId)) {
            return this._abcStageCache.get(teamId);
        }
        const stages = await this.orm.searchRead(
            stageModel,
            ["|", [stageTeamField, "=", false], [stageTeamField, "in", [teamId]]],
            ["name"]
        );
        const names = stages.map((s) => s.name);
        this._abcStageCache.set(teamId, names);
        return names;
    },
});

/*
 * EN: hides the Kanban columns (by title, not by touching Model internals)
 * whose stage isn't allowed for the selected team — see the long note at
 * the top of this file for why group_expand can't do this for us.
 *
 * Uses useEffect with an EXPLICIT dependency, not onRendered: Owl's
 * reactivity only tracks a state property as a dependency when it is READ
 * during that component's actual render/effect-dependency evaluation.
 * Reading `allowedStageNames` only inside an onRendered callback (i.e.
 * *after* rendering already happened) never registers as a dependency, so
 * the component would simply never re-render when it changes — verified
 * live: the columns froze on whichever team was selected first and never
 * updated again on later switches. useEffect's selector function IS
 * evaluated as a dependency read, so this actually reacts to changes.
 *
 * ES: oculta las columnas del Kanban (por título, no tocando internos del
 * Model) cuya etapa no está permitida para el equipo elegido — ver la nota
 * larga al inicio del archivo sobre por qué group_expand no puede hacerlo
 * por nosotros.
 *
 * Usa useEffect con una dependencia EXPLÍCITA, no onRendered: la
 * reactividad de Owl solo rastrea una propiedad de estado como dependencia
 * cuando se LEE durante el render real del componente o la evaluación de
 * dependencias de un efecto. Leer `allowedStageNames` solo dentro de un
 * callback de onRendered (es decir, *después* de que ya se renderizó) nunca
 * se registra como dependencia, así que el componente simplemente nunca se
 * volvía a renderizar cuando cambiaba — verificado en vivo: las columnas se
 * quedaban congeladas en el primer equipo elegido y ya no se actualizaban
 * en cambios posteriores. La función selectora de useEffect SÍ se evalúa
 * como una lectura de dependencia, así que esto sí reacciona a los cambios.
 *
 * DE: blendet die Kanban-Spalten aus (nach Titel, ohne Model-Interna
 * anzufassen), deren Phase für das gewählte Team nicht erlaubt ist.
 * Verwendet useEffect mit einer EXPLIZITEN Abhängigkeit statt onRendered —
 * live bestätigt, dass onRendered hier nie erneut ausgelöst wurde.
 *
 * FR: masque les colonnes du Kanban (par titre, sans toucher aux internes
 * du Model) dont l'étape n'est pas autorisée pour l'équipe choisie.
 * Utilise useEffect avec une dépendance EXPLICITE plutôt que onRendered —
 * confirmé en direct que onRendered ne se redéclenchait jamais ici.
 */
applyPatchOnce("abc_team_stage_filter_free.KanbanRenderer", KanbanRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        this.abcTeamStageFilter = this.env.abcTeamStageFilter
            ? useState(this.env.abcTeamStageFilter.state)
            : null;
        if (this.abcTeamStageFilter) {
            // EN/ES/DE/FR: braced so the callback returns undefined — see the
            // long note on the other useEffect in this file: a returned value
            // is taken as the cleanup function and brings down Owl's scheduler.
            useEffect(
                () => {
                    this._abcHideDisallowedColumns();
                },
                () => [this.abcTeamStageFilter.allowedStageNames]
            );
        }
    },

    _abcHideDisallowedColumns() {
        const allowed = this.abcTeamStageFilter.allowedStageNames;
        // EN: document-scoped on purpose, same technique abc_row_colors_free
        // uses for list rows — there is only ever one primary Kanban board
        // mounted at a time in practice.
        // ES: a propósito con alcance en document, misma técnica que usa
        // abc_row_colors_free para filas de lista — en la práctica solo hay
        // un tablero Kanban principal montado a la vez.
        for (const group of document.querySelectorAll(".o_kanban_group")) {
            const title = group.querySelector(".o_column_title")?.textContent?.trim();
            const hide = Array.isArray(allowed) && title !== undefined && !allowed.includes(title);
            group.classList.toggle("abc_team_stage_filter_hidden", !!hide);
        }
    },
});

/*
 * EN: selector rendered inside the view-switcher group. The state lives on
 * the KanbanController; the env bridge (abcTeamStageFilter) only exists
 * under a Kanban whose model is configured above, so this renders nowhere
 * else.
 * ES: selector dentro del grupo de cambio de vista. El estado vive en el
 * KanbanController; el puente de entorno (abcTeamStageFilter) solo existe
 * bajo un Kanban de un modelo configurado arriba, así que esto no se
 * renderiza en ningún otro lado.
 * DE: Auswahl innerhalb der Gruppe zum Ansichtswechsel. Der Zustand liegt
 * im KanbanController; die Umgebungsbrücke (abcTeamStageFilter) existiert
 * nur unter einem Kanban eines oben konfigurierten Modells.
 * FR: sélecteur rendu dans le groupe de changement de vue. L'état vit dans
 * le KanbanController ; le pont d'environnement (abcTeamStageFilter)
 * n'existe que sous un Kanban dont le modèle est configuré ci-dessus.
 */
applyPatchOnce("abc_team_stage_filter_free.ControlPanel", ControlPanel.prototype, {
    setup() {
        super.setup(...arguments);
        this.abcTeamStageFilter = this.env.abcTeamStageFilter
            ? useState(this.env.abcTeamStageFilter.state)
            : null;
    },

    // EN/ES/DE/FR: translated at runtime via _t() + the module's .po files
    // (see i18n/), not baked in at build time — the getter re-evaluates on
    // every render, so a language switch takes effect immediately.
    get abcAllTeamsLabel() {
        return _t("All teams");
    },

    get abcTeamFilterTooltip() {
        return _t("Scope the pipeline to the chosen team (limits stages to that team's own)");
    },

    abcOnTeamChange(ev) {
        const value = ev.target.value;
        this.env.abcTeamStageFilter.select(value ? Number(value) : null);
    },
});
