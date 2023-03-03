import { SceneDarknessAdjuster } from "@module/apps/scene-darkness-adjuster";

/** Insert system tool buttons to the control bar */
export const GetSceneControlButtons = {
    listen: (): void => {
        Hooks.on("getSceneControlButtons", (controls) => {
            // World Clock
            const tokenTools = controls.find((c) => c.name === "token")?.tools;
            tokenTools?.push({
                name: "worldclock",
                title: "CONTROLS.WorldClock",
                icon: "fas fa-clock",
                button: true,
                visible:
                    game.settings.get("xprpg", "worldClock.showClockButton") &&
                    (game.user.isGM || game.settings.get("xprpg", "worldClock.playersCanView")),
                onClick: () => {
                    if (game.xprpg.worldClock.rendered) {
                        game.xprpg.worldClock.close({ force: true });
                    } else {
                        game.xprpg.worldClock.render(true);
                    }
                },
            });

            const lightingControls = controls.find((c) => c.name === "lighting");
            const lightingTools = lightingControls?.tools;
            const dayTool = lightingTools?.find((tool) => tool.name === "day");
            if (!(lightingControls && lightingTools && dayTool)) return;

            // Scene Darkness Adjuster
            if (lightingControls.visible && SceneDarknessAdjuster.instance.rendered) {
                SceneDarknessAdjuster.instance.close({ force: true });
            }
            const adjusterTool: SceneControlTool = {
                name: "darkness-adjuster",
                title: "CONTROLS.AdjustSceneDarkness",
                icon: "fa-solid fa-adjust",
                visible: game.user.isGM && game.settings.get("xprpg", "automation.rulesBasedVision"),
                toggle: true,
                active: false,
                onClick: (): void => {
                    const adjuster = SceneDarknessAdjuster.instance;
                    if (adjuster.rendered) {
                        adjuster.close({ force: true });
                    } else {
                        adjuster.render(true);
                    }
                },
            };

            // GM Vision
            const gmVisionTool = ((): SceneControlTool | null => {
                const binding = game.keybindings.actions.get("xprpg.gm-vision")?.editable?.[0];
                if (!(binding && game.user.isGM)) return null;

                const gmVisionLabel = game.i18n.localize("XPRPG.Keybinding.GMVision.Label");
                const bindingLabel = KeybindingsConfig._humanizeBinding(binding);
                const gmVisionIcon = (active = game.settings.get("xprpg", "gmVision")): string =>
                    active ? "fa-solid fa-lightbulb-cfl-on" : "fa-solid fa-lightbulb-cfl";

                return {
                    name: "gm-vision",
                    title: `${gmVisionLabel} [${bindingLabel}]`,
                    icon: gmVisionIcon(),
                    visible: game.user.isGM,
                    toggle: true,
                    active: game.settings.get("xprpg", "gmVision"),
                    onClick: (): void => {
                        const newStatus = !game.settings.get("xprpg", "gmVision");
                        game.settings.set("xprpg", "gmVision", newStatus);
                        const toggle = ui.controls.control?.tools.find((t) => t.name === "gm-vision");
                        if (toggle) {
                            toggle.active = newStatus;
                            toggle.icon = gmVisionIcon(newStatus);
                            ui.controls.render();
                        }
                    },
                };
            })();

            const tools = [adjusterTool, gmVisionTool ?? []].flat();
            lightingTools.splice(lightingTools?.indexOf(dayTool), 0, ...tools);
        });
    },
};
