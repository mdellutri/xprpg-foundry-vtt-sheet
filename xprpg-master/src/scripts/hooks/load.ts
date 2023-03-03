import { ActorProxyXPRPG } from "@actor";
import { AutomaticBonusProgression } from "@actor/character/automatic-bonus-progression";
import { ItemProxyXPRPG } from "@item";
import { ActiveEffectXPRPG } from "@module/active-effect";
import { ChatMessageXPRPG } from "@module/chat-message";
import { ActorsXPRPG } from "@module/collection/actors";
import { CombatantXPRPG, EncounterXPRPG } from "@module/encounter";
import { MacroXPRPG } from "@module/macro";
import { UserXPRPG } from "@module/user";
import {
    AmbientLightDocumentXPRPG,
    MeasuredTemplateDocumentXPRPG,
    SceneXPRPG,
    TileDocumentXPRPG,
    TokenConfigXPRPG,
    TokenDocumentXPRPG,
} from "@scene";
import { monkeyPatchFoundry } from "@scripts/monkeyPatch";
import { CheckRoll, StrikeAttackRoll } from "@system/check";
import { DamageInstance, DamageRoll } from "@system/damage/roll";
import { ArithmeticExpression, Grouping, InstancePool, IntermediateDie } from "@system/damage/terms";

/** Not an actual hook listener but rather things to run on initial load */
export const Load = {
    listen(): void {
        // Assign document classes
        CONFIG.ActiveEffect.documentClass = ActiveEffectXPRPG;
        CONFIG.Actor.collection = ActorsXPRPG;
        CONFIG.Actor.documentClass = ActorProxyXPRPG;
        CONFIG.AmbientLight.documentClass = AmbientLightDocumentXPRPG;
        CONFIG.ChatMessage.documentClass = ChatMessageXPRPG;
        CONFIG.Combat.documentClass = EncounterXPRPG;
        CONFIG.Combatant.documentClass = CombatantXPRPG;
        CONFIG.Item.documentClass = ItemProxyXPRPG;
        CONFIG.Macro.documentClass = MacroXPRPG;
        CONFIG.MeasuredTemplate.documentClass = MeasuredTemplateDocumentXPRPG;
        CONFIG.Scene.documentClass = SceneXPRPG;
        CONFIG.Tile.documentClass = TileDocumentXPRPG;
        CONFIG.Token.documentClass = TokenDocumentXPRPG;
        CONFIG.Token.prototypeSheetClass = TokenConfigXPRPG;
        CONFIG.User.documentClass = UserXPRPG;

        CONFIG.Canvas.darknessColor = 0x2d2d52; // Lightness increased by ~0.4/10 (Munsell value)
        CONFIG.Canvas.exploredColor = 0x262626; // Increased from 0 (black)

        CONFIG.Dice.rolls.push(CheckRoll, StrikeAttackRoll, DamageRoll, DamageInstance);
        for (const TermCls of [ArithmeticExpression, Grouping, InstancePool, IntermediateDie]) {
            CONFIG.Dice.termTypes[TermCls.name] = TermCls;
        }

        // Mystery Man but with a drop shadow
        Actor.DEFAULT_ICON = "systems/xprpg/icons/default-icons/mystery-man.svg";

        Roll.MATH_PROXY = mergeObject(Roll.MATH_PROXY, {
            eq: (a: number, b: number) => a === b,
            gt: (a: number, b: number) => a > b,
            gte: (a: number, b: number) => a >= b,
            lt: (a: number, b: number) => a < b,
            lte: (a: number, b: number) => a <= b,
            ne: (a: number, b: number) => a !== b,
            ternary: (condition: boolean | number, ifTrue: number, ifFalse: number) => (condition ? ifTrue : ifFalse),
        });

        // Make available immediately on load for module subclassing
        window.AutomaticBonusProgression = AutomaticBonusProgression;

        // Monkey-patch `TextEditor.enrichHTML`
        monkeyPatchFoundry();

        // Prevent buttons from retaining focus when clicked so that canvas hotkeys still work
        document.addEventListener("mouseup", (): void => {
            const element = document.activeElement;
            if (element instanceof HTMLButtonElement && !element.classList.contains("pm-dropdown")) {
                element.blur();
            }
        });
    },
};
