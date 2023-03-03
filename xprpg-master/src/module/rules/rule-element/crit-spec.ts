import { AutomaticBonusProgression as ABP } from "@actor/character/automatic-bonus-progression";
import { ActorType } from "@actor/data";
import { DamageDiceXPRPG, ModifierXPRPG } from "@actor/modifiers";
import { MeleeXPRPG, WeaponXPRPG } from "@item";
import { RollNoteXPRPG } from "@module/notes";
import { BooleanField, ModelPropsFromSchema, StringField } from "types/foundry/common/data/fields.mjs";
import { RuleElementXPRPG, RuleElementSchema } from ".";
import { CritSpecEffect } from "../synthetics";

const { fields } = foundry.data;

/** Substitute a pre-determined result for a check's D20 roll */
class CritSpecRuleElement extends RuleElementXPRPG<CritSpecRuleSchema> {
    static override validActorTypes: ActorType[] = ["character", "npc"];

    static override defineSchema(): CritSpecRuleSchema {
        return {
            ...super.defineSchema(),
            alternate: new fields.BooleanField(),
            text: new fields.StringField({ blank: false, nullable: false, initial: undefined }),
        };
    }

    #validate(): void {
        if (this.alternate && !this.text) {
            return this.failValidation("An alternate critical specialization must include substitute text");
        }
    }

    override beforePrepareData(): void {
        this.#validate();
        if (this.ignored) return;

        const synthetic = (weapon: WeaponXPRPG | MeleeXPRPG, options: Set<string>): CritSpecEffect | null => {
            const predicate = this.resolveInjectedProperties(this.predicate);
            return predicate.test(options) ? this.#getEffect(weapon) : null;
        };

        this.actor.synthetics.criticalSpecalizations[this.alternate ? "alternate" : "standard"].push(synthetic);
    }

    #getEffect(weapon: WeaponXPRPG | MeleeXPRPG): CritSpecEffect {
        const text = this.text ? this.resolveInjectedProperties(this.text.trim()) : null;
        const note = () => [
            new RollNoteXPRPG({
                selector: "strike-damage",
                title: "XPRPG.Actor.Creature.CriticalSpecialization",
                text: text ?? `XPRPG.Item.Weapon.CriticalSpecialization.${weapon.group}`,
                outcome: ["criticalSuccess"],
            }),
        ];

        if (this.alternate) return note();

        const slug = "critical-specialization";

        switch (weapon.group) {
            case "dart":
            case "knife": {
                const dice = new DamageDiceXPRPG({
                    slug,
                    selector: "strike-damage",
                    label: "XPRPG.Actor.Creature.CriticalSpecialization",
                    damageType: "bleed",
                    diceNumber: 1,
                    dieSize: "d6",
                    critical: true,
                });
                const bonusValue = ABP.isEnabled(this.actor)
                    ? ABP.getAttackPotency(this.actor.level)
                    : weapon.isOfType("melee")
                    ? weapon.linkedWeapon?.system.runes.potency ?? 0
                    : weapon.system.runes.potency;
                const bonus =
                    bonusValue > 0
                        ? new ModifierXPRPG({
                              slug,
                              label: "XPRPG.Actor.Creature.CriticalSpecialization",
                              type: "item",
                              damageType: "bleed",
                              modifier: bonusValue,
                              critical: true,
                          })
                        : null;
                return [dice, bonus ?? []].flat();
            }
            case "pick":
                return weapon.baseDamage.die
                    ? [
                          new ModifierXPRPG({
                              slug,
                              label: "XPRPG.Actor.Creature.CriticalSpecialization",
                              type: "untyped",
                              modifier: 2 * weapon.baseDamage.dice,
                              critical: true,
                          }),
                      ]
                    : [];
            default: {
                return weapon.group ? note() : [];
            }
        }
    }
}

interface CritSpecRuleElement extends RuleElementXPRPG<CritSpecRuleSchema>, ModelPropsFromSchema<CritSpecRuleSchema> {}

type CritSpecRuleSchema = RuleElementSchema & {
    /** Whether this critical specialization note substitutes for the standard one of a given weapon group */
    alternate: BooleanField;
    /** Alternative note text: if not provided, the standard one for a given weapon group is used */
    text: StringField<string, string, false, false, false>;
};

export { CritSpecRuleElement };
