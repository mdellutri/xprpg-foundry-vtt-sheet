import { AutomaticBonusProgression as ABP } from "@actor/character/automatic-bonus-progression";
import { ActorType } from "@actor/data";
import { ItemXPRPG, WeaponXPRPG } from "@item";
import { RuleElementOptions, RuleElementXPRPG, RuleElementSource } from ".";
import { PotencySynthetic } from "../synthetics";

/**
 * Copies potency runes from the weapon its attached to, to another weapon based on a predicate.
 * @category RuleElement
 */
export class WeaponPotencyRuleElement extends RuleElementXPRPG {
    protected static override validActorTypes: ActorType[] = ["character", "npc"];

    selector: string;

    constructor(data: WeaponPotencySource, item: Embedded<ItemXPRPG>, options?: RuleElementOptions) {
        super(data, item, options);
        this.selector = String(data.selector);
    }

    override beforePrepareData(): void {
        if (this.ignored) return;

        const { weaponPotency } = this.actor.synthetics;
        const selector = this.resolveInjectedProperties(this.selector);
        const { item } = this;
        const potencyValue = this.data.value ?? (item instanceof WeaponXPRPG ? item.system.potencyRune.value : 0);
        const value = this.resolveValue(potencyValue);
        if (selector && typeof value === "number") {
            const bonusType = ABP.isEnabled(this.actor) ? "potency" : "item";

            const label = this.label.includes(":") ? this.label.replace(/^[^:]+:\s*|\s*\([^)]+\)$/g, "") : this.label;
            const potency: PotencySynthetic = { label, bonus: value, type: bonusType, predicate: this.predicate };
            const synthetics = (weaponPotency[selector] ??= []);
            synthetics.push(potency);
        } else {
            this.failValidation("Weapon potency requires at least a selector field and a non-empty value field");
        }
    }
}

interface WeaponPotencySource extends RuleElementSource {
    selector?: unknown;
}
