import { ItemXPRPG } from "@item";
import { RuleElementSource } from ".";
import { RollTwiceSynthetic } from "../synthetics";
import { RuleElementOptions, RuleElementXPRPG } from "./base";

/** Roll Twice and keep either the higher or lower result */
export class RollTwiceRuleElement extends RuleElementXPRPG {
    selector = "";

    keep: "higher" | "lower" = "higher";

    /** If the hosting item is an effect, remove or expire it after a matching roll is made */
    removeAfterRoll = this.item.isOfType("effect");

    constructor(data: RollTwiceSource, item: Embedded<ItemXPRPG>, options?: RuleElementOptions) {
        super(data, item, options);

        if (this.#isValid(data)) {
            this.selector = this.resolveInjectedProperties(data.selector);
            this.keep = data.keep;

            const expireEffects = game.settings.get("xprpg", "automation.effectExpiration");
            const removeExpired = game.settings.get("xprpg", "automation.removeExpiredEffects");

            this.removeAfterRoll =
                (expireEffects || removeExpired) && item.isOfType("effect")
                    ? Boolean(data.removeAfterRoll ?? true)
                    : false;
        }
    }

    #isValid(data: RollTwiceSource): data is RollTwiceData {
        if (!(typeof data.selector === "string" && data.selector)) {
            this.failValidation("A Roll Twice rule element requires selector");
            return false;
        }

        if (!(typeof data.keep === "string" && ["higher", "lower"].includes(data.keep))) {
            this.failValidation('A Roll Twice rule element requires a "keep" property of either "higher" or "lower"');
            return false;
        }

        return true;
    }

    override beforePrepareData(): void {
        if (this.ignored) return;

        const synthetic: RollTwiceSynthetic = { keep: this.keep };
        if (this.predicate) synthetic.predicate = this.predicate;

        const synthetics = (this.actor.synthetics.rollTwice[this.selector] ??= []);
        synthetics.push(synthetic);
    }

    override async afterRoll({ selectors, roll, rollOptions }: RuleElementXPRPG.AfterRollParams): Promise<void> {
        if (!this.actor.items.has(this.item.id)) {
            return;
        }

        const rolledTwice = roll?.dice.some((d) => ["kh", "kl"].some((m) => d.modifiers.includes(m))) ?? false;
        if (!(rolledTwice && this.removeAfterRoll && selectors.includes(this.selector) && this.test(rollOptions))) {
            return;
        }

        for (const rule of this.item.rules) {
            rule.ignored = true;
        }

        if (game.settings.get("xprpg", "automation.removeExpiredEffects")) {
            await this.item.delete();
        } else if (game.settings.get("xprpg", "automation.effectExpiration")) {
            await this.item.update({ "system.duration.value": -1, "system.expired": true });
        }
    }
}

interface RollTwiceSource extends RuleElementSource {
    selector?: unknown;
    keep?: unknown;
    removeAfterRoll?: unknown;
}

interface RollTwiceData {
    key: "RollTwice";
    selector: string;
    keep: "higher" | "lower";
    removeAfterRoll?: boolean;
}
