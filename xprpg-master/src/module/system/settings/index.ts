import { resetActors } from "@actor/helpers";
import { ActorSheetXPRPG } from "@actor/sheet/base";
import { ItemXPRPG, ItemSheetXPRPG } from "@item";
import { StatusEffects } from "@module/canvas/status-effects";
import { MigrationRunner } from "@module/migration/runner";
import { isImageOrVideoPath } from "@util";
import { AutomationSettings } from "./automation";
import { HomebrewElements } from "./homebrew";
import { MetagameSettings } from "./metagame";
import { VariantRulesSettings } from "./variant-rules";
import { WorldClockSettings } from "./world-clock";

export function registerSettings(): void {
    if (BUILD_MODE === "development") {
        registerWorldSchemaVersion();
    }

    game.settings.register("xprpg", "tokens.autoscale", {
        name: "XPRPG.SETTINGS.Tokens.Autoscale.Name",
        hint: "XPRPG.SETTINGS.Tokens.Autoscale.Hint",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings.register("xprpg", "identifyMagicNotMatchingTraditionModifier", {
        name: "XPRPG.SETTINGS.IdentifyMagicNotMatchingTraditionModifier.Name",
        hint: "XPRPG.SETTINGS.IdentifyMagicNotMatchingTraditionModifier.Hint",
        choices: {
            0: "XPRPG.SETTINGS.IdentifyMagicNotMatchingTraditionModifier.Choices.0",
            2: "XPRPG.SETTINGS.IdentifyMagicNotMatchingTraditionModifier.Choices.2",
            5: "XPRPG.SETTINGS.IdentifyMagicNotMatchingTraditionModifier.Choices.5",
            10: "XPRPG.SETTINGS.IdentifyMagicNotMatchingTraditionModifier.Choices.10",
        },
        type: Number,
        default: 5,
        scope: "world",
        config: true,
    });

    game.settings.register("xprpg", "critRule", {
        name: "XPRPG.SETTINGS.CritRule.Name",
        hint: "XPRPG.SETTINGS.CritRule.Hint",
        scope: "world",
        config: true,
        default: "doubledamage",
        type: String,
        choices: {
            doubledamage: "XPRPG.SETTINGS.CritRule.Choices.Doubledamage",
            doubledice: "XPRPG.SETTINGS.CritRule.Choices.Doubledice",
        },
        onChange: () => {
            for (const sheet of Object.values(ui.windows).filter((w) => w instanceof ActorSheetXPRPG)) {
                sheet.render();
            }
        },
    });

    game.settings.register("xprpg", "compendiumBrowserPacks", {
        name: "XPRPG.SETTINGS.CompendiumBrowserPacks.Name",
        hint: "XPRPG.SETTINGS.CompendiumBrowserPacks.Hint",
        default: {},
        type: Object,
        scope: "world",
        onChange: () => {
            game.xprpg.compendiumBrowser.initCompendiumList();
        },
    });

    game.settings.register("xprpg", "enabledRulesUI", {
        name: "XPRPG.SETTINGS.EnabledRulesUI.Name",
        hint: "XPRPG.SETTINGS.EnabledRulesUI.Hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => {
            const itemSheets = Object.values(ui.windows).filter(
                (w): w is ItemSheetXPRPG<ItemXPRPG> => w instanceof ItemSheetXPRPG
            );
            for (const sheet of itemSheets) {
                sheet.render();
            }
        },
    });

    game.settings.register("xprpg", "critFumbleButtons", {
        name: game.i18n.localize("XPRPG.SETTINGS.critFumbleCardButtons.name"),
        hint: game.i18n.localize("XPRPG.SETTINGS.critFumbleCardButtons.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        requiresReload: true,
    });

    game.settings.register("xprpg", "drawCritFumble", {
        name: game.i18n.localize("XPRPG.SETTINGS.critFumbleCards.name"),
        hint: game.i18n.localize("XPRPG.SETTINGS.critFumbleCards.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        requiresReload: true,
    });

    const iconChoices = {
        blackWhite: "XPRPG.SETTINGS.statusEffectType.blackWhite",
        default: "XPRPG.SETTINGS.statusEffectType.default",
    };
    game.settings.register("xprpg", "statusEffectType", {
        name: "XPRPG.SETTINGS.statusEffectType.name",
        hint: "XPRPG.SETTINGS.statusEffectType.hint",
        scope: "world",
        config: true,
        default: "default",
        type: String,
        choices: iconChoices,
        onChange: (iconType) => {
            StatusEffects.migrateStatusEffectUrls(iconType);
        },
    });

    game.settings.register("xprpg", "totmToggles", {
        name: "XPRPG.SETTINGS.TOTMToggles.Name",
        hint: "XPRPG.SETTINGS.TOTMToggles.Hint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: () => {
            resetActors();
        },
    });

    game.settings.register("xprpg", "deathIcon", {
        name: "XPRPG.Settings.DeathIcon.Name",
        hint: "XPRPG.Settings.DeathIcon.Hint",
        scope: "world",
        config: false,
        default: "icons/svg/skull.svg",
        type: String,
        onChange: (choice?: string) => {
            if (isImageOrVideoPath(choice)) CONFIG.controlIcons.defeated = choice;
        },
    });

    // Don't tell Nath
    game.settings.register("xprpg", "nathMode", {
        name: "XPRPG.SETTINGS.NathMode.Name",
        hint: "XPRPG.SETTINGS.NathMode.Hint",
        scope: "world",
        config: BUILD_MODE === "development",
        default: false,
        type: Boolean,
    });

    game.settings.register("xprpg", "statusEffectShowCombatMessage", {
        name: "XPRPG.SETTINGS.statusEffectShowCombatMessage.name",
        hint: "XPRPG.SETTINGS.statusEffectShowCombatMessage.hint",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings.register("xprpg", "worldSystemVersion", {
        name: "World System Version",
        scope: "world",
        config: false,
        default: game.system.version,
        type: String,
    });

    game.settings.registerMenu("xprpg", "automation", {
        name: "XPRPG.SETTINGS.Automation.Name",
        label: "XPRPG.SETTINGS.Automation.Label",
        hint: "XPRPG.SETTINGS.Automation.Hint",
        icon: "fas fa-robot",
        type: AutomationSettings,
        restricted: true,
    });
    game.settings.register("xprpg", "automation.actorsDeadAtZero", {
        name: CONFIG.XPRPG.SETTINGS.automation.actorsDeadAtZero.name,
        scope: "world",
        config: false,
        default: "npcsOnly",
        type: String,
    });
    AutomationSettings.registerSettings();

    game.settings.registerMenu("xprpg", "metagame", {
        name: "XPRPG.SETTINGS.Metagame.Name",
        label: "XPRPG.SETTINGS.Metagame.Label",
        hint: "XPRPG.SETTINGS.Metagame.Hint",
        icon: "fas fa-brain",
        type: MetagameSettings,
        restricted: true,
    });
    MetagameSettings.registerSettings();

    game.settings.registerMenu("xprpg", "variantRules", {
        name: "XPRPG.SETTINGS.Variant.Name",
        label: "XPRPG.SETTINGS.Variant.Label",
        hint: "XPRPG.SETTINGS.Variant.Hint",
        icon: "fas fa-book",
        type: VariantRulesSettings,
        restricted: true,
    });
    VariantRulesSettings.registerSettings();

    game.settings.registerMenu("xprpg", "homebrew", {
        name: "XPRPG.SETTINGS.Homebrew.Name",
        label: "XPRPG.SETTINGS.Homebrew.Label",
        hint: "XPRPG.SETTINGS.Homebrew.Hint",
        icon: "fas fa-beer",
        type: HomebrewElements,
        restricted: true,
    });
    HomebrewElements.registerSettings();

    game.settings.registerMenu("xprpg", "worldClock", {
        name: game.i18n.localize(CONFIG.XPRPG.SETTINGS.worldClock.name),
        label: game.i18n.localize(CONFIG.XPRPG.SETTINGS.worldClock.label),
        hint: game.i18n.localize(CONFIG.XPRPG.SETTINGS.worldClock.hint),
        icon: "far fa-clock",
        type: WorldClockSettings,
        restricted: true,
    });
    WorldClockSettings.registerSettings();

    game.settings.register("xprpg", "campaignFeats", {
        name: CONFIG.XPRPG.SETTINGS.CampaignFeats.name,
        hint: CONFIG.XPRPG.SETTINGS.CampaignFeats.hint,
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    // Secret for now until the user side is complete and a UI is built
    game.settings.register("xprpg", "campaignFeatSections", {
        name: "Campaign Feat Sections",
        scope: "world",
        config: false,
        default: [],
        type: Array,
    });

    // This only exists to not break existing macros (yet). We'll keep it for a few versions
    game.settings.register("xprpg", "RAI.TreatWoundsAltSkills", {
        name: "Treat Wounds Macro Compat",
        scope: "world",
        config: false,
        default: true,
        type: Boolean,
    });

    // Increase brightness of darkness color for GMs
    game.settings.register("xprpg", "gmVision", {
        name: "XPRPG.SETTINGS.GMVision",
        scope: "client",
        config: false,
        default: false,
        type: Boolean,
        onChange: (value) => {
            const color = value ? CONFIG.XPRPG.Canvas.darkness.gmVision : CONFIG.XPRPG.Canvas.darkness.default;
            CONFIG.Canvas.darknessColor = color;
            canvas.colorManager.initialize();
        },
    });

    if (BUILD_MODE === "production") {
        registerWorldSchemaVersion();
    }
}

function registerWorldSchemaVersion(): void {
    game.settings.register("xprpg", "worldSchemaVersion", {
        name: "XPRPG.SETTINGS.WorldSchemaVersion.Name",
        hint: "XPRPG.SETTINGS.WorldSchemaVersion.Hint",
        scope: "world",
        config: true,
        default: MigrationRunner.LATEST_SCHEMA_VERSION,
        type: Number,
    });
}
