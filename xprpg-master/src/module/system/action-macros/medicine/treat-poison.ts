import { ActionMacroHelpers, SkillActionOptions } from "..";

export function treatPoison(options: SkillActionOptions) {
    const slug = options?.skill ?? "medicine";
    const rollOptions = ["action:treat-poison"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.TreatPoison.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["manipulate"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.TreatPoison", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.TreatPoison", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.TreatPoison", "criticalFailure"),
        ],
    });
}
