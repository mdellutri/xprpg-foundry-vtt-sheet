import { ActionMacroHelpers, SkillActionOptions } from "..";
import { MODIFIER_TYPE, ModifierXPRPG } from "@actor/modifiers";
import { CreatureXPRPG } from "@actor";
import { ActorSizeXPRPG } from "@actor/data/size";

function determineSizeBonus(actorSize: ActorSizeXPRPG, targetSize: ActorSizeXPRPG) {
    const sizeDifference = actorSize.difference(targetSize);

    return Math.clamped(2 * sizeDifference, -4, 4);
}

export function whirlingThrow(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:whirling-throw"];
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.WhirlingThrow.Title",
        checkContext: (opts) => {
            const modifiers = options.modifiers?.length ? [...options.modifiers] : [];
            if (opts.actor instanceof CreatureXPRPG && opts.target instanceof CreatureXPRPG) {
                const actorSize = opts.actor.system.traits.size;
                const targetSize = opts.target.system.traits.size;
                const sizeModifier = new ModifierXPRPG(
                    "Size Modifier",
                    determineSizeBonus(actorSize, targetSize),
                    MODIFIER_TYPE.CIRCUMSTANCE
                );
                if (sizeModifier.modifier) {
                    modifiers.push(sizeModifier);
                }
            }
            return ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug });
        },
        traits: ["monk"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        difficultyClassStatistic: (target) => target.saves.fortitude,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.WhirlingThrow", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.WhirlingThrow", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.WhirlingThrow", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.WhirlingThrow", "criticalFailure"),
        ],
    });
}
