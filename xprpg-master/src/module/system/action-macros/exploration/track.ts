import { ActionMacroHelpers, SkillActionOptions } from "..";

export function track(options: SkillActionOptions) {
    const slug = options?.skill ?? "survival";
    const rollOptions = ["action:track"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.Track.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["concentrate", "exploration", "move"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Track", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Track", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Track", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Track", "criticalFailure"),
        ],
    });
}
