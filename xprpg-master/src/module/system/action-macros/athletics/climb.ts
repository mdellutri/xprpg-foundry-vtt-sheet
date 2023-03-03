import { ActionMacroHelpers, SkillActionOptions } from "..";

export function climb(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:climb"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.Climb.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["move"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Climb", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Climb", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Climb", "criticalFailure"),
        ],
    });
}
