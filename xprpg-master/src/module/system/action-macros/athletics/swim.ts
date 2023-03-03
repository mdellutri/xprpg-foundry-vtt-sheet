import { ActionMacroHelpers, SkillActionOptions } from "..";

export function swim(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:swim"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.Swim.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["move"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Swim", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Swim", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Swim", "criticalFailure"),
        ],
    });
}
