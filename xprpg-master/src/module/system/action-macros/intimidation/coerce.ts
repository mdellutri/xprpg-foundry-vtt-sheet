import { ActionMacroHelpers, SkillActionOptions } from "..";

export function coerce(options: SkillActionOptions) {
    const slug = options?.skill ?? "intimidation";
    const rollOptions = ["action:coerce"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.Coerce.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["auditory", "concentrate", "emotion", "exploration", "linguistic", "mental"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        difficultyClassStatistic: (target) => target.saves.will,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Coerce", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Coerce", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Coerce", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Coerce", "criticalFailure"),
        ],
    });
}
