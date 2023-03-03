import { ActionMacroHelpers, SkillActionOptions } from "..";
import { CheckResultCallback } from "@system/action-macros/types";
import { CreatureXPRPG } from "@actor";
import { RawModifier, ModifierXPRPG } from "@actor/modifiers";

interface ChatMessageCheckFlags {
    context: {
        options: string[];
    };
    modifiers: RawModifier[];
}

export function createForgery(options: SkillActionOptions) {
    const modifiers = [
        new ModifierXPRPG({
            label: "XPRPG.Actions.CreateForgery.UnspecificHandwriting",
            modifier: 4,
            predicate: ["action:create-forgery:unspecific-handwriting"],
            type: "circumstance",
        }),
    ].concat(options?.modifiers ?? []);
    const slug = options?.skill ?? "society";
    const rollOptions = ["action:create-forgery"];
    return ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.CreateForgery.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        traits: ["downtime", "secret"],
        event: options.event,
        callback: async (result: CheckResultCallback) => {
            // consider any modifiers enabled in the roll dialog
            const societyDC = (() => {
                if (result.actor instanceof CreatureXPRPG) {
                    const systemFlags = result.message?.flags.xprpg as unknown as ChatMessageCheckFlags;
                    const modifiers = (systemFlags.modifiers as RawModifier[])
                        .filter((modifier) => modifier.enabled)
                        .map((modifier) => {
                            return { ...modifier, predicate: [] };
                        })
                        .map((modifier) => new ModifierXPRPG(modifier));
                    return result.actor.skills.society
                        .extend({
                            slug: result.actor.skills.society.slug,
                            modifiers,
                        })
                        .withRollOptions({
                            extraRollOptions: systemFlags.context.options,
                            origin: result.actor,
                        }).dc;
                }
                return null;
            })();
            const gmNotes = (() => {
                if (["criticalSuccess", "success"].includes(result.outcome ?? "")) {
                    return game.i18n.format("XPRPG.Actions.CreateForgery.ForgedDocument.SuccessGmNote", {
                        societyDC: societyDC?.value ?? null,
                    });
                } else if (["criticalFailure", "failure"].includes(result.outcome ?? "")) {
                    return game.i18n.format("XPRPG.Actions.CreateForgery.ForgedDocument.FailureGmNote", {
                        failure: game.i18n.localize("XPRPG.Actions.CreateForgery.Notes.failure"),
                        success: game.i18n.localize("XPRPG.Actions.CreateForgery.Notes.success"),
                        total: result.roll.total,
                    });
                }
                return "";
            })();

            // create forged document item
            await Item.create(
                {
                    img: "systems/xprpg/icons/equipment/adventuring-gear/scroll-case.webp",
                    name: game.i18n.localize("XPRPG.Actions.CreateForgery.ForgedDocument.Name"),
                    type: "equipment",
                    system: {
                        description: {
                            gm: gmNotes,
                            value: game.i18n.format("XPRPG.Actions.CreateForgery.ForgedDocument.Description", {
                                societyDC: societyDC?.value ?? null,
                            }),
                        },
                    },
                },
                {
                    parent: result.actor,
                }
            );

            // remind user that an item was created in the actor's inventory
            const notification = game.i18n.format("XPRPG.Actions.CreateForgery.ForgedDocumentCreatedNotification", {
                name: result.actor.name,
            });
            ui.notifications.info(notification);

            options?.callback?.(result);
        },
        difficultyClass: options.difficultyClass ?? { value: 20 },
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.CreateForgery", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.CreateForgery", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.CreateForgery", "failure"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.CreateForgery", "criticalFailure"),
        ],
    });
}
