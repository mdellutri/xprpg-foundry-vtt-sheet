import { ActionMacroHelpers, SkillActionOptions } from "..";

export function senseMotive(options: SkillActionOptions) {
    const slug = options?.skill ?? "perception";
    const rollOptions = ["action:sense-motive"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.SenseMotive.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["concentrate", "secret"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        difficultyClassStatistic: (target) => target.skills.deception,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.SenseMotive", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.SenseMotive", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.SenseMotive", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.SenseMotive", "criticalFailure"),
        ],
    });
}
