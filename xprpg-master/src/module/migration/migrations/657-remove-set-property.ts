import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";
import { RuleElementSource, RuleValue } from "@module/rules/rule-element";
import { ActorSourceXPRPG } from "@actor/data";

export class Migration657RemoveSetProperty extends MigrationBase {
    static override version = 0.657;

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        const systemFlags = actorSource.flags.xprpg ?? {};
        delete systemFlags["set-property"];
        if ("game" in globalThis && "set-property" in systemFlags) {
            systemFlags["-=set-property"] = null;
        }
    }

    override async updateItem(itemSource: ItemSourceXPRPG): Promise<void> {
        itemSource.system.rules ??= [];
        const rules = itemSource.system.rules;
        const setPropertyRules = itemSource.system.rules.filter(
            (rule: Record<string, unknown>): rule is SetPropertySource =>
                typeof rule.key === "string" &&
                ["SetProperty", "XPRPG.RuleElement.SetProperty"].includes(rule.key) &&
                typeof rule["property"] === "string" &&
                typeof rule["on"] === "object" &&
                rule["on"] !== null &&
                "added" in rule["on"]
        );
        const aeLikes = setPropertyRules.map(
            (setProperty): AELikeSource => ({
                key: "ActiveEffectLike",
                mode: "override",
                path: setProperty.property.replace(/^flags\.2e/, "flags.xprpg"),
                value: setProperty.on.added,
                priority: 10,
            })
        );
        for (const setPropertyRule of setPropertyRules) {
            const index = rules.indexOf(setPropertyRule);
            rules.splice(index, 1, aeLikes.shift()!);
        }

        // Remove any surviving (likely malformed) SetProperty rule elements
        itemSource.system.rules = itemSource.system.rules.filter(
            (rule) => rule && typeof rule.key === "string" && !rule.key.trim().endsWith("SetProperty")
        );
    }
}

type SetPropertySource = RuleElementSource & {
    property: string;
    on: {
        added: RuleValue;
    };
};

interface AELikeSource extends RuleElementSource {
    mode: "override";
    path: string;
    value: RuleValue;
}
