import { ActorXPRPG } from "@actor/base";
import { AutomaticBonusProgression } from "@actor/character/automatic-bonus-progression";
import { FeatCategoryOptions } from "@actor/character/feats";
import { CheckModifier, ModifierXPRPG, MODIFIER_TYPE, StatisticModifier } from "@actor/modifiers";
import { ItemXPRPG } from "@item/base";
import { CoinsXPRPG } from "@item/physical/helpers";
import { ActiveEffectXPRPG } from "@module/active-effect";
import { CompendiumBrowser, CompendiumBrowserSettings } from "@module/apps/compendium-browser";
import { EffectsPanel } from "@module/apps/effects-panel";
import { HotbarXPRPG } from "@module/apps/hotbar";
import { LicenseViewer } from "@module/apps/license-viewer";
import { ActorDirectoryXPRPG, ChatLogXPRPG, CompendiumDirectoryXPRPG, EncounterTrackerXPRPG } from "@module/apps/sidebar";
import { WorldClock } from "@module/apps/world-clock";
import { CanvasXPRPG, EffectsCanvasGroupXPRPG } from "@module/canvas";
import { StatusEffects } from "@module/canvas/status-effects";
import { ChatMessageXPRPG } from "@module/chat-message";
import { ActorsXPRPG } from "@module/collection/actors";
import { MacroXPRPG } from "@module/macro";
import { RuleElementXPRPG, RuleElements } from "@module/rules";
import {
    AmbientLightDocumentXPRPG,
    MeasuredTemplateDocumentXPRPG,
    SceneXPRPG,
    TileDocumentXPRPG,
    TokenDocumentXPRPG,
} from "@module/scene";
import { UserXPRPG } from "@module/user";
import { XPRPGCONFIG, StatusEffectIconTheme } from "@scripts/config";
import { DiceXPRPG } from "@scripts/dice";
import {
    calculateXP,
    editPersistent,
    launchTravelSheet,
    perceptionForSelected,
    rollActionMacro,
    rollItemMacro,
    stealthForSelected,
} from "@scripts/macros";
import { remigrate } from "@scripts/system/remigrate";
import { CheckXPRPG } from "@system/check";
import { EffectTracker } from "@system/effect-tracker";
import { ModuleArt } from "@system/module-art";
import { CustomDamageData, HomebrewTag, HomebrewTraitSettingsKey } from "@system/settings/homebrew";
import { TextEditorXPRPG } from "@system/text-editor";
import { sluggify } from "@util";
import { CombatantXPRPG, EncounterXPRPG } from "./module/encounter";
import { ConditionManager } from "./module/system/conditions";

declare global {
    interface Game {
        xprpg: {
            actions: Record<string, Function>;
            compendiumBrowser: CompendiumBrowser;
            licenseViewer: LicenseViewer;
            worldClock: WorldClock;
            effectPanel: EffectsPanel;
            effectTracker: EffectTracker;
            rollActionMacro: typeof rollActionMacro;
            rollItemMacro: typeof rollItemMacro;
            gm: {
                calculateXP: typeof calculateXP;
                launchTravelSheet: typeof launchTravelSheet;
                perceptionForSelected: typeof perceptionForSelected;
                stealthForSelected: typeof stealthForSelected;
                editPersistent: typeof editPersistent;
            };
            system: {
                moduleArt: ModuleArt;
                remigrate: typeof remigrate;
                sluggify: typeof sluggify;
            };
            variantRules: {
                AutomaticBonusProgression: typeof AutomaticBonusProgression;
            };
            Coins: typeof CoinsXPRPG;
            Dice: typeof DiceXPRPG;
            StatusEffects: typeof StatusEffects;
            ConditionManager: typeof ConditionManager;
            ModifierType: typeof MODIFIER_TYPE;
            Modifier: typeof ModifierXPRPG;
            StatisticModifier: typeof StatisticModifier;
            CheckModifier: typeof CheckModifier;
            Check: typeof CheckXPRPG;
            RuleElements: typeof RuleElements;
            RuleElement: typeof RuleElementXPRPG;
            TextEditor: typeof TextEditorXPRPG;
        };
    }

    interface ConfigXPRPG extends ConfiguredConfig {
        debug: ConfiguredConfig["debug"] & {
            ruleElement: boolean;
        };
        XPRPG: typeof XPRPGCONFIG;
        time: {
            roundTime: number;
        };
    }

    const CONFIG: ConfigXPRPG;
    const canvas: CanvasXPRPG;

    namespace globalThis {
        // eslint-disable-next-line no-var
        var game: Game<ActorXPRPG, ActorsXPRPG, ChatMessageXPRPG, EncounterXPRPG, ItemXPRPG, MacroXPRPG, SceneXPRPG, UserXPRPG>;

        // eslint-disable-next-line no-var
        var ui: FoundryUI<ActorXPRPG, ActorDirectoryXPRPG<ActorXPRPG>, ItemXPRPG, ChatLogXPRPG, CompendiumDirectoryXPRPG>;
    }

    interface Window {
        AutomaticBonusProgression: typeof AutomaticBonusProgression;
    }

    interface ClientSettings {
        get(module: "xprpg", setting: "automation.actorsDeadAtZero"): "neither" | "npcsOnly" | "pcsOnly" | "both";
        get(module: "xprpg", setting: "automation.effectExpiration"): boolean;
        get(module: "xprpg", setting: "automation.flankingDetection"): boolean;
        get(module: "xprpg", setting: "automation.iwr"): boolean;
        get(module: "xprpg", setting: "automation.lootableNPCs"): boolean;
        get(module: "xprpg", setting: "automation.removeExpiredEffects"): boolean;
        get(module: "xprpg", setting: "automation.rulesBasedVision"): boolean;

        get(module: "xprpg", setting: "gradualBoostsVariant"): boolean;
        get(module: "xprpg", setting: "ancestryParagonVariant"): boolean;
        get(module: "xprpg", setting: "automaticBonusVariant"): "noABP" | "ABPFundamentalPotency" | "ABPRulesAsWritten";
        get(module: "xprpg", setting: "dualClassVariant"): boolean;
        get(module: "xprpg", setting: "freeArchetypeVariant"): boolean;
        get(module: "xprpg", setting: "proficiencyVariant"): "ProficiencyWithLevel" | "ProficiencyWithoutLevel";
        get(module: "xprpg", setting: "staminaVariant"): 0 | 1;

        get(module: "xprpg", setting: "proficiencyUntrainedModifier"): number;
        get(module: "xprpg", setting: "proficiencyTrainedModifier"): number;
        get(module: "xprpg", setting: "proficiencyExpertModifier"): number;
        get(module: "xprpg", setting: "proficiencyMasterModifier"): number;
        get(module: "xprpg", setting: "proficiencyLegendaryModifier"): number;

        get(module: "xprpg", setting: "metagame_partyVision"): boolean;
        get(module: "xprpg", setting: "metagame_secretCondition"): boolean;
        get(module: "xprpg", setting: "metagame_secretDamage"): boolean;
        get(module: "xprpg", setting: "metagame_showDC"): boolean;
        get(module: "xprpg", setting: "metagame_showResults"): boolean;
        get(module: "xprpg", setting: "metagame_tokenSetsNameVisibility"): boolean;

        get(module: "xprpg", setting: "tokens.autoscale"): boolean;

        get(module: "xprpg", setting: "worldClock.dateTheme"): "AR" | "IC" | "AD" | "CE";
        get(module: "xprpg", setting: "worldClock.playersCanView"): boolean;
        get(module: "xprpg", setting: "worldClock.showClockButton"): boolean;
        get(module: "xprpg", setting: "worldClock.syncDarkness"): boolean;
        get(module: "xprpg", setting: "worldClock.timeConvention"): 24 | 12;
        get(module: "xprpg", setting: "worldClock.worldCreatedOn"): string;

        get(module: "xprpg", setting: "campaignFeats"): boolean;
        get(module: "xprpg", setting: "campaignFeatSections"): FeatCategoryOptions[];

        get(module: "xprpg", setting: "homebrew.weaponCategories"): HomebrewTag<"weaponCategories">[];
        get(module: "xprpg", setting: HomebrewTraitSettingsKey): HomebrewTag[];
        get(module: "xprpg", setting: "homebrew.damageTypes"): CustomDamageData[];

        get(module: "xprpg", setting: "compendiumBrowserPacks"): CompendiumBrowserSettings;
        get(module: "xprpg", setting: "critFumbleButtons"): boolean;
        get(module: "xprpg", setting: "critRule"): "doubledamage" | "doubledice";
        get(module: "xprpg", setting: "deathIcon"): ImageFilePath;
        get(module: "xprpg", setting: "drawCritFumble"): boolean;
        get(module: "xprpg", setting: "enabledRulesUI"): boolean;
        get(module: "xprpg", setting: "gmVision"): boolean;
        get(module: "xprpg", setting: "identifyMagicNotMatchingTraditionModifier"): 0 | 2 | 5 | 10;
        get(module: "xprpg", setting: "nathMode"): boolean;
        get(module: "xprpg", setting: "statusEffectType"): StatusEffectIconTheme;
        get(module: "xprpg", setting: "totmToggles"): boolean;
        get(module: "xprpg", setting: "worldSchemaVersion"): number;
        get(module: "xprpg", setting: "worldSystemVersion"): string;
    }

    interface ClientSettingsMap {
        get(key: "xprpg.worldClock.worldCreatedOn"): SettingConfig & { default: string };
    }

    interface RollMathProxy {
        eq: (a: number, b: number) => boolean;
        gt: (a: number, b: number) => boolean;
        gte: (a: number, b: number) => boolean;
        lt: (a: number, b: number) => boolean;
        lte: (a: number, b: number) => boolean;
        ne: (a: number, b: number) => boolean;
        ternary: (condition: boolean | number, ifTrue: number, ifFalse: number) => number;
    }

    const BUILD_MODE: "development" | "production";
    const ROLL_GRAMMAR: string;
}

type ConfiguredConfig = Config<
    AmbientLightDocumentXPRPG,
    ActiveEffectXPRPG,
    ActorXPRPG,
    ActorDirectoryXPRPG<ActorXPRPG>,
    ChatLogXPRPG,
    ChatMessageXPRPG,
    EncounterXPRPG,
    CombatantXPRPG,
    EncounterTrackerXPRPG<EncounterXPRPG | null>,
    CompendiumDirectoryXPRPG,
    HotbarXPRPG,
    ItemXPRPG,
    MacroXPRPG,
    MeasuredTemplateDocumentXPRPG,
    TileDocumentXPRPG,
    TokenDocumentXPRPG,
    SceneXPRPG,
    UserXPRPG,
    EffectsCanvasGroupXPRPG
>;
