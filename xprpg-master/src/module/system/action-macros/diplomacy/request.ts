import { ActionMacroHelpers, SkillActionOptions } from "..";

export function request(options: SkillActionOptions) {
    const slug = options?.skill ?? "diplomacy";
    const rollOptions = ["action:request"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.Request.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["auditory", "concentrate", "linguistic", "mental"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Request", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Request", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Request", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Request", "criticalFailure"),
        ],
    });
}
