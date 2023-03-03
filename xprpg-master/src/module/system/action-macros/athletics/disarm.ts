import { ActionMacroHelpers, SkillActionOptions } from "..";
import { WeaponXPRPG } from "@item";

export function disarm(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:disarm"];
    ActionMacroHelpers.simpleRollActionCheck<Embedded<WeaponXPRPG>>({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.Disarm.Title",
        checkContext: (opts) => {
            // weapon
            const item = (ActionMacroHelpers.getApplicableEquippedWeapons(opts.actor, "disarm") ?? []).shift();

            // modifiers
            const modifiers = options.modifiers?.length ? [...options.modifiers] : [];
            if (item && item.slug !== "basic-unarmed") {
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
        difficultyClassStatistic: (target) => target.saves.reflex,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Disarm", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Disarm", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Disarm", "criticalFailure"),
        ],
    });
}
