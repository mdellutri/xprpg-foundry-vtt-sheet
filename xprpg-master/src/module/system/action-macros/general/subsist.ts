import { ActionMacroHelpers, SkillActionOptions } from "..";
import { ModifierXPRPG } from "@actor/modifiers";

export function subsist(options: SkillActionOptions) {
    if (!options?.skill) {
        ui.notifications.warn(game.i18n.localize("XPRPG.Actions.Subsist.Warning.NoSkill"));
        return;
    }
    const modifiers = [
        new ModifierXPRPG({
            label: "XPRPG.Actions.Subsist.AfterExplorationPenalty",
            modifier: -5,
            predicate: ["action:subsist:after-exploration"],
        }),
    ].concat(options?.modifiers ?? []);
    const { skill: slug } = options;
    const rollOptions = ["action:subsist", `action:subsist:${slug}`];
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.Subsist.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["downtime"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Subsist", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Subsist", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Subsist", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Subsist", "criticalFailure"),
        ],
    });
}
