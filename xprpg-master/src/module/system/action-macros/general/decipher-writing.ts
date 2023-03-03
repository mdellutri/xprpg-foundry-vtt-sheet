import { ActionMacroHelpers, SkillActionOptions } from "..";

export function decipherWriting(options: SkillActionOptions) {
    if (!options?.skill) {
        ui.notifications.warn(game.i18n.localize("XPRPG.Actions.DecipherWriting.Warning.NoSkill"));
        return;
    }
    const { skill: slug } = options;
    const rollOptions = ["action:decipher-writing", `action:decipher-writing:${slug}`];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.DecipherWriting.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["concentrate", "exploration", "secret"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.DecipherWriting", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.DecipherWriting", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.DecipherWriting", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.DecipherWriting", "criticalFailure"),
        ],
    });
}
