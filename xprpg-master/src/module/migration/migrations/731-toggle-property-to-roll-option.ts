import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { RuleElementSource } from "@module/rules";
import { sluggify } from "@util";
import { Migration727TrimSelfRollOptions } from "./727-trim-self-roll-options";

/** Retire ToggleProperty rule element, converting them to toggleable RollOption ones */
export class Migration731TogglePropertyToRollOption extends Migration727TrimSelfRollOptions {
    static override version = 0.731;

    protected override optionPattern = /^target:flatFooted$/;

    protected override optionReplacement = "target:condition:flat-footed";

    #pathPattern = /^flags\.xprpg\.rollOptions\.([^.]+)\.([^.]+)$/;

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        source.system.rules = source.system.rules.map((r) => this.trimPredicates(r)) as RuleElementSource[];

        const rules: TogglePropertyOrRollOption[] = source.system.rules;
        for (const rule of [...rules]) {
            if (rule.key !== "ToggleProperty") continue;

            const match = this.#pathPattern.exec(rule.property?.trim() ?? "");
            if (!(match?.length === 3 && match[1].length >= 2 && match[2].length >= 1)) {
                rules.splice(rules.indexOf(rule), 1);
                continue;
            }

            rule.key = "RollOption";
            rule.domain = match[1];
            rule.option = match[2];
            rule.toggleable = true;
            delete rule.property;

            if (typeof rule.default === "boolean") {
                rule.value = rule.default;
                delete rule.default;
            }

            if (sluggify(String(rule.label ?? "")) === source.system.slug) {
                delete rule.label;
            }
        }
    }

    override async updateActor(source: ActorSourceXPRPG): Promise<void> {
        if (source.flags.xprpg?.rollOptions?.all) {
            source.flags.xprpg.rollOptions.all["-=panache"] = false;
            source.flags.xprpg.rollOptions.all["-=rage"] = false;
            source.flags.xprpg.rollOptions.all["-=target:flatFooted"] = false;
        }
    }
}

type TogglePropertyOrRollOption = RuleElementSource & {
    domain?: string;
    option?: string;
    toggleable?: boolean;
    default?: boolean;
    property?: string;
};
