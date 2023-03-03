import { ActorType } from "@actor/data";
import { ItemXPRPG, WeaponXPRPG } from "@item";
import { getStrikingDice } from "@item/physical/runes";
import { StrikingSynthetic } from "../synthetics";
import { RuleElementOptions, RuleElementXPRPG, RuleElementSource } from "./";

export class StrikingRuleElement extends RuleElementXPRPG {
    protected static override validActorTypes: ActorType[] = ["character", "npc"];

    selector: string;

    constructor(data: StrikingSource, item: Embedded<ItemXPRPG>, options?: RuleElementOptions) {
        super(data, item, options);

        if (typeof data.selector === "string") {
            this.selector = data.selector;
        } else {
            this.failValidation("Missing string selector property");
            this.selector = "";
        }
    }

    override beforePrepareData(): void {
        if (this.ignored) return;

        const selector = this.resolveInjectedProperties(this.selector);
        const strikingValue =
            "value" in this.data
                ? this.data.value
                : this.item instanceof WeaponXPRPG
                ? getStrikingDice(this.item.system)
                : 0;
        const value = this.resolveValue(strikingValue);
        if (selector && typeof value === "number") {
            const label = this.label.includes(":") ? this.label.replace(/^[^:]+:\s*|\s*\([^)]+\)$/g, "") : this.label;
            const striking: StrikingSynthetic = { label, bonus: value, predicate: this.predicate };
            const strikings = (this.actor.synthetics.striking[selector] ??= []);
            strikings.push(striking);
        } else {
            console.warn("XPRPG | Striking requires at least a selector field and a non-empty value field");
        }
    }
}

interface StrikingSource extends RuleElementSource {
    selector?: string;
}
