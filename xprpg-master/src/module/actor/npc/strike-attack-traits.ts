import { ModifierXPRPG, MODIFIER_TYPE } from "@actor/modifiers";
import { MeleeXPRPG } from "@item/melee";
import { PredicateXPRPG } from "@system/predication";

class StrikeAttackTraits {
    static createAttackModifiers(strike: MeleeXPRPG): ModifierXPRPG[] {
        const traits = strike.system.traits.value;

        const getLabel = (traitOrTag: string): string => {
            const traits: Record<string, string | undefined> = CONFIG.XPRPG.weaponTraits;
            const tags: Record<string, string | undefined> = CONFIG.XPRPG.otherWeaponTags;
            return traits[traitOrTag] ?? tags[traitOrTag] ?? traitOrTag;
        };

        return traits.flatMap((trait) => {
            switch (trait.replace(/-d?\d{1,3}$/, "")) {
                case "sweep": {
                    return new ModifierXPRPG({
                        label: getLabel(trait),
                        modifier: 1,
                        type: MODIFIER_TYPE.CIRCUMSTANCE,
                        predicate: new PredicateXPRPG("sweep-bonus"),
                    });
                }
                case "backswing": {
                    return new ModifierXPRPG({
                        label: getLabel(trait),
                        modifier: 1,
                        type: MODIFIER_TYPE.CIRCUMSTANCE,
                        predicate: new PredicateXPRPG("backswing-bonus"),
                    });
                }
                default:
                    return [];
            }
        });
    }
}

export { StrikeAttackTraits };
