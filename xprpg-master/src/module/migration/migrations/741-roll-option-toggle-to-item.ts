import { ActorSourceXPRPG } from "@actor/data";
import { RuleElementSource } from "@module/rules";
import { MigrationBase } from "../base";

/** Move tracking of roll-option toggles to the rules themselves */
export class Migration741RollOptionToggleToItem extends MigrationBase {
    static override version = 0.741;

    override async updateActor(source: ActorSourceXPRPG): Promise<void> {
        if (!(source.flags.xprpg?.rollOptions instanceof Object)) return;

        const rules = source.items
            .flatMap((i) => i.system.rules)
            .filter(
                (r: MaybeRollOption): r is ToggeableRollOption =>
                    !!r.toggleable &&
                    r.key === "RollOption" &&
                    typeof r.domain === "string" &&
                    r.domain.length > 0 &&
                    typeof r.option === "string" &&
                    r.option.length > 0
            );

        const { rollOptions } = source.flags.xprpg;

        for (const rule of rules) {
            const domain = rollOptions[rule.domain];
            if (domain instanceof Object && rule.option in domain) {
                domain[`-=${rule.option}`] = false;
                rule.value = !!domain[rule.option];
            }
        }
    }
}

interface MaybeRollOption extends RuleElementSource {
    toggleable?: boolean;
    domain?: string;
    option?: string;
}

interface ToggeableRollOption extends RuleElementSource {
    toggleable: boolean;
    domain: string;
    option: string;
}
