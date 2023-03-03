import { ActionMacroHelpers, SkillActionOptions } from "..";

export function pickALock(options: SkillActionOptions) {
    const slug = options?.skill ?? "thievery";
    const rollOptions = ["action:pick-a-lock"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "D",
        title: "XPRPG.Actions.PickALock.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["manipulate"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.PickALock", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.PickALock", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.PickALock", "criticalFailure"),
        ],
    });
}
