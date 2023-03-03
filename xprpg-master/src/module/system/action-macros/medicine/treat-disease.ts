import { ActionMacroHelpers, SkillActionOptions } from "..";

export function treatDisease(options: SkillActionOptions) {
    const slug = options?.skill ?? "medicine";
    const rollOptions = ["action:treat-disease"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.TreatDisease.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["downtime", "manipulate"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.TreatDisease", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.TreatDisease", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.TreatDisease", "criticalFailure"),
        ],
    });
}
