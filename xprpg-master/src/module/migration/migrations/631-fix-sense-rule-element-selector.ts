import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";

/** Correct any sense rule element selector values that are using the old lowercase selector values */
export class Migration631FixSenseRuleElementSelector extends MigrationBase {
    static override version = 0.631;

    private readonly SENSE_SELECTOR_CONVERSION: Record<string, string | undefined> = {
        lowlightvision: "lowLightVision",
        Tremorsense: "tremorsense",
    } as const;

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        const rules: MaybeWithSelector[] = source.system.rules;
        for (const rule of rules) {
            if (rule.key === "XPRPG.RuleElement.Sense" && typeof rule.selector === "string") {
                rule.selector = this.SENSE_SELECTOR_CONVERSION[rule.selector] ?? rule.selector;
            }
        }
    }
}

interface MaybeWithSelector {
    key?: unknown;
    selector?: unknown;
}
