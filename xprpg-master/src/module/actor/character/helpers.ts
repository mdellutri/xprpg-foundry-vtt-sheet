import { ArmorXPRPG, WeaponXPRPG } from "@item";
import { ModifierXPRPG, MODIFIER_TYPE } from "@actor/modifiers";
import { PredicateXPRPG } from "@system/predication";
import { ErrorXPRPG, objectHasKey, setHasElement } from "@util";
import { DAMAGE_DIE_FACES } from "@system/damage/values";
import { extractModifierAdjustments } from "@module/rules/helpers";
import { type CharacterXPRPG } from ".";

/** Handle weapon traits that introduce modifiers or add other weapon traits */
class StrikeWeaponTraits {
    static adjustWeapon(weapon: WeaponXPRPG): void {
        const traits = weapon.system.traits.value;
        for (const trait of [...traits]) {
            switch (trait.replace(/-d?\d{1,3}$/, "")) {
                case "fatal-aim": {
                    if (weapon.rangeIncrement && weapon.handsHeld === 2) {
                        const fatal = trait.replace("-aim", "");
                        if (objectHasKey(CONFIG.XPRPG.weaponTraits, fatal) && !traits.includes(fatal)) {
                            traits.push(fatal);
                        }
                    }
                    break;
                }
                case "jousting": {
                    if (weapon.handsHeld === 1) {
                        const die = /(d\d{1,2})$/.exec(trait)?.[1];
                        if (setHasElement(DAMAGE_DIE_FACES, die)) {
                            weapon.system.damage.die = die;
                        }
                    }
                    break;
                }
                default:
                    break;
            }
        }
    }

    static createAttackModifiers(weapon: WeaponXPRPG, domains: string[]): ModifierXPRPG[] {
        const { actor } = weapon;
        if (!actor) throw ErrorXPRPG("The weapon must be embedded");

        const traitsAndTags = [weapon.system.traits.value, weapon.system.traits.otherTags].flat();

        const getLabel = (traitOrTag: string): string => {
            const traits: Record<string, string | undefined> = CONFIG.XPRPG.weaponTraits;
            const tags: Record<string, string | undefined> = CONFIG.XPRPG.otherWeaponTags;
            return traits[traitOrTag] ?? tags[traitOrTag] ?? traitOrTag;
        };

        return traitsAndTags
            .flatMap((trait) => {
                const reducedTrait = trait.replace(/-d?\d{1,3}$/, "");
                switch (reducedTrait) {
                    case "kickback": {
                        // "Firing a kickback weapon gives a –2 circumstance penalty to the attack roll, but characters with
                        // 14 or more Strength ignore the penalty."
                        return new ModifierXPRPG({
                            slug: reducedTrait,
                            label: CONFIG.XPRPG.weaponTraits.kickback,
                            modifier: -2,
                            type: MODIFIER_TYPE.CIRCUMSTANCE,
                            predicate: new PredicateXPRPG({ lt: ["ability:str:score", 14] }),
                        });
                    }
                    case "volley": {
                        if (!weapon.rangeIncrement) return [];

                        const penaltyRange = Number(/-(\d+)$/.exec(trait)![1]);
                        return new ModifierXPRPG({
                            slug: reducedTrait,
                            label: getLabel(trait),
                            modifier: -2,
                            type: MODIFIER_TYPE.UNTYPED,
                            ignored: true,
                            predicate: new PredicateXPRPG(
                                { lte: ["target:distance", penaltyRange] },
                                { not: "self:ignore-volley-penalty" }
                            ),
                        });
                    }
                    case "improvised": {
                        return new ModifierXPRPG({
                            slug: reducedTrait,
                            label: getLabel(trait),
                            modifier: -2,
                            type: MODIFIER_TYPE.ITEM,
                            predicate: new PredicateXPRPG({ not: "self:ignore-improvised-penalty" }),
                        });
                    }
                    case "sweep": {
                        return new ModifierXPRPG({
                            slug: reducedTrait,
                            label: getLabel(trait),
                            modifier: 1,
                            type: MODIFIER_TYPE.CIRCUMSTANCE,
                            predicate: new PredicateXPRPG("self:sweep-bonus"),
                        });
                    }
                    case "backswing": {
                        return new ModifierXPRPG({
                            slug: reducedTrait,
                            label: getLabel(trait),
                            modifier: 1,
                            type: MODIFIER_TYPE.CIRCUMSTANCE,
                            predicate: new PredicateXPRPG("self:backswing-bonus"),
                        });
                    }
                    default:
                        return [];
                }
            })
            .map((modifier) => {
                const synthetics = actor.synthetics.modifierAdjustments;
                modifier.adjustments = extractModifierAdjustments(synthetics, domains, modifier.slug);
                return modifier;
            });
    }
}

/** Create a penalty for attempting to Force Open without a crowbar or equivalent tool */
function createForceOpenPenalty(actor: CharacterXPRPG, domains: string[]): ModifierXPRPG {
    const slug = "no-crowbar";
    const { modifierAdjustments } = actor.synthetics;
    return new ModifierXPRPG({
        slug,
        label: "XPRPG.Actions.ForceOpen.NoCrowbarPenalty",
        type: "item",
        modifier: -2,
        predicate: ["action:force-open", "action:force-open:prying"],
        hideIfDisabled: true,
        adjustments: extractModifierAdjustments(modifierAdjustments, domains, slug),
    });
}

function createShoddyPenalty(
    actor: CharacterXPRPG,
    item: WeaponXPRPG | ArmorXPRPG,
    domains: string[]
): ModifierXPRPG | null {
    if (!item.isShoddy) return null;

    const slug = "shoddy";
    const { modifierAdjustments } = actor.synthetics;
    return new ModifierXPRPG({
        label: "XPRPG.Item.Physical.OtherTag.Shoddy",
        type: "item",
        slug,
        modifier: -2,
        adjustments: extractModifierAdjustments(modifierAdjustments, domains, slug),
    });
}

export { createForceOpenPenalty, createShoddyPenalty, StrikeWeaponTraits };
