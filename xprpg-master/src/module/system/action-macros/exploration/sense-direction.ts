import { ActionMacroHelpers, SkillActionOptions } from "..";
import { ModifierXPRPG } from "@actor/modifiers";

export function senseDirection(options: SkillActionOptions) {
    const modifiers = [
        new ModifierXPRPG({
            label: "XPRPG.Actions.SenseDirection.Modifier.NoCompass",
            modifier: -2,
            predicate: [{ not: "compass-in-possession" }],
        }),
    ].concat(options?.modifiers ?? []);
    const slug = options?.skill ?? "survival";
    const rollOptions = ["action:sense-direction"];
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.SenseDirection.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["exploration", "secret"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.SenseDirection", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.SenseDirection", "success"),
        ],
    });
}
