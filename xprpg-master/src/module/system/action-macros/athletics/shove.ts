import { ActionMacroHelpers, SkillActionOptions } from "..";
import { WeaponXPRPG } from "@item";

export function shove(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:shove"];
    ActionMacroHelpers.simpleRollActionCheck<Embedded<WeaponXPRPG>>({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.Shove.Title",
        checkContext: (opts) => {
            // weapon
            const item = (ActionMacroHelpers.getApplicableEquippedWeapons(opts.actor, "shove") ?? []).shift();

            // modifiers
            const modifiers = options.modifiers?.length ? [...options.modifiers] : [];
            if (item && item.traits.has("shove")) {
                const modifier = ActionMacroHelpers.getWeaponPotencyModifier(item, slug);
                if (modifier) {
                    modifiers.push(modifier);
                }
            }

            return ActionMacroHelpers.defaultCheckContext(opts, { item, modifiers, rollOptions, slug });
        },
        traits: ["attack"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        difficultyClassStatistic: (target) => target.saves.fortitude,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Shove", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Shove", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Shove", "criticalFailure"),
        ],
    });
}
