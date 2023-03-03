import { PartialSettingsData, SettingsMenuXPRPG } from "./menu";

type ConfigXPRPGListName = (typeof AutomationSettings.SETTINGS)[number];

export class AutomationSettings extends SettingsMenuXPRPG {
    static override readonly namespace = "automation";

    static override readonly SETTINGS = [
        "rulesBasedVision",
        "iwr",
        "effectExpiration",
        "removeExpiredEffects",
        "flankingDetection",
        "lootableNPCs",
    ] as const;

    protected static override get settings(): Record<ConfigXPRPGListName, PartialSettingsData> {
        return {
            rulesBasedVision: {
                name: CONFIG.XPRPG.SETTINGS.automation.rulesBasedVision.name,
                hint: CONFIG.XPRPG.SETTINGS.automation.rulesBasedVision.hint,
                default: true,
                type: Boolean,
                requiresReload: true,
            },
            iwr: {
                name: CONFIG.XPRPG.SETTINGS.automation.iwr.name,
                hint: CONFIG.XPRPG.SETTINGS.automation.iwr.hint,
                default: BUILD_MODE === "development",
                type: Boolean,
            },
            effectExpiration: {
                name: CONFIG.XPRPG.SETTINGS.automation.effectExpiration.name,
                hint: CONFIG.XPRPG.SETTINGS.automation.effectExpiration.hint,
                default: true,
                type: Boolean,
                onChange: () => {
                    for (const actor of game.actors) {
                        actor.reset();
                        actor.sheet.render(false);
                        for (const token of actor.getActiveTokens()) {
                            token.drawEffects();
                        }
                    }
                },
            },
            removeExpiredEffects: {
                name: CONFIG.XPRPG.SETTINGS.automation.removeExpiredEffects.name,
                hint: CONFIG.XPRPG.SETTINGS.automation.removeExpiredEffects.hint,
                default: false,
                type: Boolean,
            },
            flankingDetection: {
                name: CONFIG.XPRPG.SETTINGS.automation.flankingDetection.name,
                hint: CONFIG.XPRPG.SETTINGS.automation.flankingDetection.hint,
                default: true,
                type: Boolean,
            },
            lootableNPCs: {
                name: CONFIG.XPRPG.SETTINGS.automation.lootableNPCs.name,
                hint: CONFIG.XPRPG.SETTINGS.automation.lootableNPCs.hint,
                default: true,
                type: Boolean,
            },
        };
    }
}
