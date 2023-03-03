import { ActionMacroHelpers, SkillActionOptions } from "..";

export function highJump(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:stride", "action:leap", "action:high-jump"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "D",
        title: "XPRPG.Actions.HighJump.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["move"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.HighJump", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.HighJump", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.HighJump", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.HighJump", "criticalFailure"),
        ],
    });
}
