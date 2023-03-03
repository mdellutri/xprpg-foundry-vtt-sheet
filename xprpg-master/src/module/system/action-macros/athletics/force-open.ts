import { ActionMacroHelpers, SkillActionOptions } from "..";

export function forceOpen(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:force-open"];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.ForceOpen.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["attack"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.ForceOpen", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.ForceOpen", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.ForceOpen", "criticalFailure"),
        ],
    });
}
