import { AutomaticBonusProgression } from "@actor/character/automatic-bonus-progression";
import { CheckModifier, ModifierXPRPG, MODIFIER_TYPE, StatisticModifier } from "@actor/modifiers";
import { CoinsXPRPG } from "@item/physical/helpers";
import { CompendiumBrowser } from "@module/apps/compendium-browser";
import { EffectsPanel } from "@module/apps/effects-panel";
import { LicenseViewer } from "@module/apps/license-viewer";
import { WorldClock } from "@module/apps/world-clock";
import { StatusEffects } from "@module/canvas/status-effects";
import { RuleElementXPRPG, RuleElements } from "@module/rules";
import { DiceXPRPG } from "@scripts/dice";
import {
    calculateXP,
    editPersistent,
    encouragingWords,
    launchTravelSheet,
    perceptionForSelected,
    raiseAShield,
    restForTheNight,
    rollActionMacro,
    rollItemMacro,
    showEarnIncomePopup,
    stealthForSelected,
    steelYourResolve,
    treatWounds,
} from "@scripts/macros";
import { remigrate } from "@scripts/system/remigrate";
import { ActionMacros } from "@system/action-macros";
import { CheckXPRPG } from "@system/check";
import { ConditionManager } from "@system/conditions";
import { EffectTracker } from "@system/effect-tracker";
import { ModuleArt } from "@system/module-art";
import { TextEditorXPRPG } from "@system/text-editor";
import { sluggify } from "@util";

/** Expose public game.xprpg interface */
export const SetGameXPRPG = {
    onInit: (): void => {
        const actions: Record<string, Function> = {
            encouragingWords,
            raiseAShield,
            restForTheNight,
            earnIncome: showEarnIncomePopup,
            steelYourResolve,
            treatWounds,
            ...ActionMacros,
        };

        const initSafe: Partial<(typeof game)["xprpg"]> = {
            Check: CheckXPRPG,
            CheckModifier: CheckModifier,
            Coins: CoinsXPRPG,
            ConditionManager: ConditionManager,
            Dice: DiceXPRPG,
            Modifier: ModifierXPRPG,
            ModifierType: MODIFIER_TYPE,
            RuleElement: RuleElementXPRPG,
            RuleElements: RuleElements,
            StatisticModifier: StatisticModifier,
            StatusEffects: StatusEffects,
            TextEditor: TextEditorXPRPG,
            actions,
            effectPanel: new EffectsPanel(),
            effectTracker: new EffectTracker(),
            gm: { calculateXP, launchTravelSheet, perceptionForSelected, stealthForSelected, editPersistent },
            licenseViewer: new LicenseViewer(),
            rollActionMacro,
            rollItemMacro,
            system: { moduleArt: new ModuleArt(), remigrate, sluggify },
            variantRules: { AutomaticBonusProgression },
        };

        game.xprpg = mergeObject(game.xprpg ?? {}, initSafe);
    },

    onSetup: (): void => {},

    onReady: (): void => {
        game.xprpg.compendiumBrowser = new CompendiumBrowser();
        game.xprpg.worldClock = new WorldClock();
    },
};
