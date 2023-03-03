import { TokenEffect } from "@actor/token-effect";
import { RuleElementXPRPG } from "./";

/**
 * Add an effect icon to an actor's token
 * @category RuleElement
 */
export class TokenEffectIconRuleElement extends RuleElementXPRPG {
    override afterPrepareData(): void {
        if (!this.test()) return;

        const path =
            typeof this.data.value === "string" ? this.resolveInjectedProperties(this.data.value) : this.item.img;
        this.actor.system.tokenEffects.push(new TokenEffect(path.trim() as ImageFilePath));
    }
}
