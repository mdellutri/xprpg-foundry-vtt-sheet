import { ActionMacroHelpers, SkillActionOptions } from "..";

export function balance(options: SkillActionOptions) {
    const slug = options?.skill ?? "acrobatics";
    const rollOptions = ["action:balance"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.Balance.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["move"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Balance", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Balance", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Balance", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Balance", "criticalFailure"),
        ],
    });
}
