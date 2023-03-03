import { ActionMacroHelpers, SkillActionOptions } from "..";

export function avoidNotice(options: SkillActionOptions) {
    const slug = options?.skill ?? "stealth";
    const rollOptions = ["action:avoid-notice"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.AvoidNotice.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["exploration"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.AvoidNotice", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.AvoidNotice", "success"),
        ],
    });
}
