import type { CharacterXPRPG, NPCXPRPG } from "@actor";
import { ActorType } from "@actor/data";
import { RuleElementXPRPG } from "./";

/**
 * @category RuleElement
 */
class DexterityModifierCapRuleElement extends RuleElementXPRPG {
    protected static override validActorTypes: ActorType[] = ["character", "npc"];

    override beforePrepareData(): void {
        if (!this.test()) return;

        const value = this.resolveValue(this.data.value);
        if (typeof value === "number") {
            this.actor.synthetics.dexterityModifierCaps.push({
                value,
                source: this.label,
            });
        } else {
            console.warn("XPRPG | Dexterity modifier cap requires at least a label field or item name, and a value");
        }
    }
}

interface DexterityModifierCapRuleElement extends RuleElementXPRPG {
    get actor(): CharacterXPRPG | NPCXPRPG;
}

export { DexterityModifierCapRuleElement };
