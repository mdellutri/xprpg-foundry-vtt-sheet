import { ActionMacroHelpers, SkillActionOptions } from "..";
import { MODIFIER_TYPE, ModifierXPRPG } from "@actor/modifiers";
import { extractModifierAdjustments } from "@module/rules/helpers";
import { WeaponXPRPG } from "@item";

export function trip(options: SkillActionOptions) {
    const slug = options?.skill ?? "athletics";
    const rollOptions = ["action:trip"];
    ActionMacroHelpers.simpleRollActionCheck<Embedded<WeaponXPRPG>>({
        actors: options.actors,
        actionGlyph: options.glyph ?? "A",
        title: "XPRPG.Actions.Trip.Title",
        checkContext: (opts) => {
            // weapon
            const item = [
                ...(ActionMacroHelpers.getApplicableEquippedWeapons(opts.actor, "trip") ?? []),
                ...(ActionMacroHelpers.getApplicableEquippedWeapons(opts.actor, "ranged-trip") ?? []),
            ].shift();

            // context
            const context = ActionMacroHelpers.defaultCheckContext(opts, {
                item,
                modifiers: options.modifiers,
                rollOptions,
                slug,
            });

            // modifiers
            if (item && context) {
                const modifiers = context.modifiers?.length ? [...context.modifiers] : [];
                if (item.traits.has("trip") || item.traits.has("ranged-trip")) {
                    const modifier = ActionMacroHelpers.getWeaponPotencyModifier(item, slug);
                    if (modifier) {
                        modifiers.push(modifier);
                    }
                }
                if (item.traits.has("ranged-trip")) {
                    modifiers.push(
                        new ModifierXPRPG({
                            slug: "ranged-trip",
                            adjustments: extractModifierAdjustments(
                                opts.actor.synthetics.modifierAdjustments,
                                context.rollOptions,
                                "ranged-trip"
                            ),
                            type: MODIFIER_TYPE.CIRCUMSTANCE,
                            label: CONFIG.XPRPG.weaponTraits["ranged-trip"],
                            modifier: -2,
                        })
                    );
                }
                context.modifiers = modifiers;
            }

            return context;
        },
        traits: ["attack"],
        event: options.event,
        callback: options.callback,
        difficultyClass: options.difficultyClass,
        difficultyClassStatistic: (target) => target.saves.reflex,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Trip", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Trip", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Trip", "criticalFailure"),
        ],
    });
}
