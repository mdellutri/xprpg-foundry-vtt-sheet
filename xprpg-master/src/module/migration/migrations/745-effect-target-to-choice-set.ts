import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG, WeaponSource } from "@item/data";
import { RuleElementSource } from "@module/rules";
import { ChoiceSetSource } from "@module/rules/rule-element/choice-set/data";
import { PredicateStatement } from "@system/predication";
import { isObject, sluggify } from "@util";
import { MigrationBase } from "../base";

/** Convert EffectTarget REs into ChoiceSets */
export class Migration745EffectTargetToChoiceSet extends MigrationBase {
    static override version = 0.745;

    #isEffectTargetRE(rule: RuleElementSource): rule is EffectTargetSource {
        return rule.key === "EffectTarget";
    }

    #toChoiceSet(
        rule: EffectTargetSource,
        itemSource: ItemSourceXPRPG,
        actorSource: ActorSourceXPRPG | null
    ): ChoiceSetSource {
        const newRE: OwnedWeaponChoiceSetSource = {
            key: "ChoiceSet",
            choices: { ownedItems: true, types: ["weapon"] },
            prompt: "XPRPG.SpecificRule.Prompt.Weapon",
        };

        if (typeof rule.targetId === "string" && actorSource) {
            const weapon = actorSource.items.find(
                (i): i is WeaponSource => i.type === "weapon" && i._id === rule.targetId
            );
            if (weapon) newRE.selection = weapon.system.slug ?? sluggify(weapon.name);
        }

        if (itemSource.system.slug?.includes("blade-ally")) {
            newRE.choices.includeHandwraps = true;
        } else if (itemSource.system.slug?.includes("weapon-surge")) {
            newRE.choices.predicate = { all: ["item:equipped"] };
        } else if (itemSource.system.slug === "shillelagh") {
            newRE.adjustName = false;
            newRE.prompt = "XPRPG.SpecificRule.Prompt.Shillelagh";
            newRE.choices.predicate = {
                all: ["item:equipped"],
                any: ["item:base:club", "item:base:staff"],
            };
        } else if (isObject(rule.predicate)) {
            newRE.choices.predicate = deepClone(rule.predicate);
        }

        return newRE;
    }

    override async updateItem(source: ItemSourceXPRPG, actorSource?: ActorSourceXPRPG): Promise<void> {
        const { rules } = source.system;
        for (const rule of rules) {
            if (this.#isEffectTargetRE(rule)) {
                rules[rules.indexOf(rule)] = this.#toChoiceSet(rule, source, actorSource ?? null);
                const otherRules = rules.filter(
                    (r: RuleElementSource & { selector?: unknown }): r is RuleElementSource & { selector: string } =>
                        typeof r.selector === "string" && /item\|data\.target/.test(r.selector)
                );
                for (const other of otherRules) {
                    const flag = sluggify(source.system.slug ?? source.name, { camel: "dromedary" });
                    other.selector = other.selector.replace(/\bdata\.target\b/, `flags.xprpg.rulesSelections.${flag}`);
                }
            }
        }
    }
}

interface EffectTargetSource extends RuleElementSource {
    key: "EffectTarget";
    type?: string;
    targetId?: string;
}

interface OwnedWeaponChoiceSetSource extends ChoiceSetSource {
    choices: {
        ownedItems: true;
        types: ["weapon"];
        includeHandwraps?: true;
        predicate?: OldRawPredicate;
    };
}

interface OldRawPredicate {
    all?: PredicateStatement[];
    any?: PredicateStatement[];
    not?: PredicateStatement[];
}
