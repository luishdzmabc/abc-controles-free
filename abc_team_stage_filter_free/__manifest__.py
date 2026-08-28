# Copyright (C) 2026 ABC S&S (https://abcsas.com).
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0.html).
{
    "name": "ABC Team Stage Filter (Free)",
    "summary": "Kanban team selector that scopes the board to that team's own stages",
    "description": """
Free hook of the ABC controls suite.

When a user belongs to more than one team (e.g. two Sales Teams in the CRM
Pipeline, or two Helpdesk teams), a Kanban grouped by stage shows the stages
of ALL of that user's teams merged together, because each team can define
its own funnel. It gets confusing fast.

This adds a small team selector next to the view-switcher icons (list,
calendar, pivot, ...). Picking a team scopes the Kanban to that team's own
records and stages - the same result as opening that team's own pipeline
action. Picking "All teams" restores the default merged view. The selector
only shows up once the user actually belongs to 2 or more teams for the
current model; everyone else sees no change at all.

Built as a small, reusable, config-driven control (not hardcoded to one
view): out of the box it covers the CRM Pipeline (Sales Team / Stage),
and a new model with the same team + stage shape can be added with one
line of configuration.

Minimal module: zero setup, zero business models. Pure frontend (additive,
reversible patch on Kanban's controller and the shared control panel).
Installing it changes nothing until a user has 2+ teams; uninstalling it
removes the selector cleanly.

### Español

Gancho gratuito de la línea de controles ABC.

Cuando un usuario pertenece a más de un equipo (p. ej. dos Equipos de venta
en el Pipeline de CRM, o dos equipos de Helpdesk), un Kanban agrupado por
etapa muestra las etapas de TODOS sus equipos mezcladas, porque cada equipo
puede tener su propio embudo. Rápido se vuelve confuso.

Esto agrega un pequeño selector de equipo junto a los íconos de cambio de
vista (lista, calendario, pivote, ...). Al elegir un equipo, el Kanban se
limita a los registros y etapas de ese equipo - el mismo resultado que abrir
el pipeline propio de ese equipo. "Todos los equipos" restaura la vista
combinada de siempre. El selector solo aparece cuando el usuario pertenece
a 2 o más equipos del modelo actual; para todos los demás no cambia nada.

Construido como un control chico, reutilizable y configurable (no fijo a una
sola vista): de fábrica cubre el Pipeline de CRM (Equipo de venta / Etapa),
y un modelo nuevo con la misma forma equipo + etapa se agrega con una línea
de configuración.

Módulo mínimo: cero configuración, cero modelos de negocio. Frontend puro
(parche aditivo y reversible sobre el controlador del Kanban y el panel de
control compartido). Instalarlo no cambia nada hasta que un usuario tenga
2+ equipos; desinstalarlo retira el selector sin dejar rastro.

### Deutsch

Kostenloser Baustein der ABC-Steuerungssuite.

Wenn ein Benutzer zu mehr als einem Team gehört (z. B. zwei Verkaufsteams
in der CRM-Pipeline oder zwei Helpdesk-Teams), zeigt ein nach Phase
gruppiertes Kanban die Phasen ALLER Teams dieses Benutzers gemischt an, da
jedes Team seinen eigenen Trichter definieren kann. Das wird schnell
unübersichtlich.

Dies fügt neben den Symbolen zum Wechseln der Ansicht (Liste, Kalender,
Pivot, ...) eine kleine Team-Auswahl hinzu. Die Wahl eines Teams beschränkt
das Kanban auf die Datensätze und Phasen dieses Teams - dasselbe Ergebnis
wie das Öffnen der eigenen Pipeline-Aktion dieses Teams. "Alle Teams"
stellt die standardmäßig zusammengeführte Ansicht wieder her. Die Auswahl
erscheint nur, wenn der Benutzer tatsächlich zu 2 oder mehr Teams des
aktuellen Modells gehört; für alle anderen ändert sich nichts.

Als kleines, wiederverwendbares, konfigurationsgesteuertes Steuerelement
gebaut (nicht fest an eine Ansicht gebunden): von Haus aus deckt es die
CRM-Pipeline ab (Verkaufsteam / Phase), und ein neues Modell mit derselben
Team- + Phasen-Struktur lässt sich mit einer Konfigurationszeile ergänzen.

Minimales Modul: keine Einrichtung, keine Geschäftsmodelle. Reines Frontend
(additiver, reversibler Patch auf dem Kanban-Controller und dem
gemeinsamen Control Panel). Die Installation ändert nichts, bis ein
Benutzer 2+ Teams hat; die Deinstallation entfernt die Auswahl rückstandslos.

### Français

Brique gratuite de la suite de contrôles ABC.

Lorsqu'un utilisateur appartient à plus d'une équipe (par ex. deux équipes
commerciales dans le Pipeline CRM, ou deux équipes Helpdesk), un Kanban
groupé par étape affiche les étapes de TOUTES les équipes de cet
utilisateur mélangées, car chaque équipe peut définir son propre entonnoir.
Cela devient vite confus.

Ceci ajoute un petit sélecteur d'équipe à côté des icônes de changement de
vue (liste, calendrier, pivot, ...). Choisir une équipe limite le Kanban
aux enregistrements et étapes de cette équipe - le même résultat que
d'ouvrir l'action de pipeline propre à cette équipe. "Toutes les équipes"
restaure la vue fusionnée par défaut. Le sélecteur n'apparaît que lorsque
l'utilisateur appartient réellement à 2 équipes ou plus pour le modèle
courant ; pour tous les autres, rien ne change.

Conçu comme un petit contrôle réutilisable, piloté par configuration (pas
figé sur une seule vue) : de base, il couvre le Pipeline CRM (Équipe
commerciale / Étape), et un nouveau modèle avec la même forme équipe +
étape s'ajoute avec une ligne de configuration.

Module minimal : aucune configuration, aucun modèle métier. Frontend pur
(patch additif et réversible sur le contrôleur Kanban et le panneau de
contrôle partagé). L'installation ne change rien tant qu'un utilisateur
n'a pas 2+ équipes ; la désinstallation retire le sélecteur proprement.
    """,
    "version": "19.0.1.0.6",
    "category": "ABC/Free",
    "license": "LGPL-3",
    "author": "ABC S&S",
    "website": "https://abcsas.com",
    "depends": [
        "web",
        "crm",
        "abc_web_utils",
    ],
    "assets": {
        "web.assets_backend": [
            "abc_team_stage_filter_free/static/src/**/*",
        ],
        "web.assets_unit_tests": [
            "abc_team_stage_filter_free/static/tests/**/*",
        ],
    },
    "images": ["static/description/icon.png"],
    "installable": True,
    "application": False,
    "auto_install": False,
}
