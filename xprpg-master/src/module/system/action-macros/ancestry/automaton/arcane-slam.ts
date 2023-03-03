import { ActionMacroHelpers, SkillActionOptions } from "../..";
import { RollNoteXPRPG } from "@module/notes";
import { PredicateXPRPG } from "@system/predication";
import { CreatureXPRPG } from "@actor";
import { MODIFIER_TYPE, ModifierXPRPG } from "@actor/modifiers";

export function arcaneSlam(options: SkillActionOptions) {
    const { actor: target, token } = ActionMacroHelpers.target();
    const slug = options?.skill ?? "acrobatics";
    const rollOptions = ["action:arcane-slam"];
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "D",
        title: "XPRPG.Actions.ArcaneSlam.Title",
        checkContext: (opts) => {
            const modifiers = options.modifiers?.length ? [...options.modifiers] : [];
            if (opts.actor instanceof CreatureXPRPG && opts.target instanceof CreatureXPRPG) {
                const attackerSize = opts.actor.system.traits.size;
                const targetSize = opts.target.system.traits.size;
                const sizeDifference = attackerSize.difference(targetSize);
                const sizeModifier = new ModifierXPRPG(
                    "XPRPG.Actions.ArcaneSlam.Modifier.SizeDifference",
                    Math.clamped(2 * sizeDifference, -4, 4),
                    MODIFIER_TYPE.CIRCUMSTANCE
                );
                if (sizeModifier.modifier) {
                    modifiers.push(sizeModifier);
                }
            }
            return ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug });
        },
        traits: ["automaton"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        difficultyClassStatistic: (target) => target.saves.fortitude,
        extraNotes: (selector: string) => {
            const notes = [
                ActionMacroHelpers.note(selector, "XPRPG.Actions.ArcaneSlam", "criticalSuccess"),
                ActionMacroHelpers.note(selector, "XPRPG.Actions.ArcaneSlam", "success"),
                ActionMacroHelpers.note(selector, "XPRPG.Actions.ArcaneSlam", "failure"),
                ActionMacroHelpers.note(selector, "XPRPG.Actions.ArcaneSlam", "criticalFailure"),
            ];
            if (!target) {
                const translated = game.i18n.localize("XPRPG.Actions.ArcaneSlam.Notes.NoTarget");
                notes.unshift(
                    new RollNoteXPRPG({
                        selector,
                        text: `<p class="compact-text">${translated}</p>`,
                        predicate: new PredicateXPRPG(),
                        outcome: [],
                    })
                );
            }
            return notes;
        },
        target: () => (target && token ? { actor: target, token } : null),
    });
}
