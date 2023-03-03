export const RenderCombatTrackerConfig = {
    listen: (): void => {
        Hooks.on("renderCombatTrackerConfig", async (app, $html) => {
            // Add a "death icon" setting
            $("#combat-config").css({ height: "" });
            const $formGroups = $html.find(".form-group");

            const $iconFormGroup = $formGroups.last().clone();
            $iconFormGroup.find("label").text(game.i18n.localize("XPRPG.SETTINGS.DeathIcon.Name"));
            $iconFormGroup.find("p.notes").text(game.i18n.localize("XPRPG.SETTINGS.DeathIcon.Hint"));
            const replacement = await renderTemplate("systems/xprpg/templates/sidebar/encounter-tracker/config.hbs", {
                value: game.settings.get("xprpg", "deathIcon"),
            });
            $iconFormGroup.find("input").replaceWith(replacement);

            // Add an "Actors dead at zero hit points" setting
            const $deadAtZeroFormGroup = $formGroups.first().clone();
            $deadAtZeroFormGroup
                .find("label")
                .text(game.i18n.localize("XPRPG.SETTINGS.Automation.ActorsDeadAtZero.Name"));
            $deadAtZeroFormGroup
                .find("p.notes")
                .text(game.i18n.localize("XPRPG.SETTINGS.Automation.ActorsDeadAtZero.Hint"));
            const options = (["neither", "npcsOnly"] as const)
                .map((value) =>
                    $("<option>")
                        .val(value)
                        .text(game.i18n.localize(CONFIG.XPRPG.SETTINGS.automation.actorsDeadAtZero[value]))
                        .prop("outerHTML")
                )
                .join("");
            const $select = $deadAtZeroFormGroup.find("select");
            $select
                .attr({ name: "actorsDeadAtZero" })
                .html(options)
                .val(game.settings.get("xprpg", "automation.actorsDeadAtZero"));
            $formGroups.last().after($iconFormGroup, $deadAtZeroFormGroup);

            // Reactivate listeners to make the file picker work
            app.activateListeners($html);
        });
    },
};
