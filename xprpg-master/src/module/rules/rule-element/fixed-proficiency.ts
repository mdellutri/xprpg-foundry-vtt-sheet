import { CharacterXPRPG } from "@actor";
import { ActorType } from "@actor/data";
import { ModifierXPRPG, MODIFIER_TYPE, StatisticModifier } from "@actor/modifiers";
import { AbilityString } from "@actor/types";
import { ABILITY_ABBREVIATIONS, SKILL_ABBREVIATIONS, SKILL_EXPANDED } from "@actor/values";
import { ItemXPRPG } from "@item";
import { PredicateXPRPG } from "@system/predication";
import { setHasElement, sluggify } from "@util";
import { RuleElementXPRPG, RuleElementSource } from "./";
import { RuleElementOptions } from "./base";

/**
 * @category RuleElement
 */
class FixedProficiencyRuleElement extends RuleElementXPRPG {
    protected static override validActorTypes: ActorType[] = ["character"];

    override slug: string;

    private selector: string;

    private ability: AbilityString | null;

    constructor(data: FixedProficiencySource, item: Embedded<ItemXPRPG>, options?: RuleElementOptions) {
        super(data, item, options);

        if (typeof data.selector === "string") {
            this.selector = data.selector;
        } else {
            this.failValidation("Missing string selector property");
            this.selector = "";
        }

        this.slug = sluggify(typeof data.slug === "string" ? data.slug : this.label);
        this.ability =
            data.ability === null
                ? null
                : setHasElement(ABILITY_ABBREVIATIONS, data.ability)
                ? data.ability
                : data.selector === "ac"
                ? "dex"
                : null;
    }

    override beforePrepareData(): void {
        const selector = this.resolveInjectedProperties(this.selector);
        const proficiencyBonus = Number(this.resolveValue(this.data.value)) || 0;
        const abilityModifier = this.ability ? this.actor.system.abilities[this.ability].mod : 0;

        const modifier = new ModifierXPRPG({
            type: MODIFIER_TYPE.PROFICIENCY,
            slug: this.slug ?? sluggify(this.label),
            label: this.label,
            modifier: proficiencyBonus + abilityModifier,
        });
        const modifiers = (this.actor.synthetics.statisticsModifiers[selector] ??= []);
        modifiers.push(() => modifier);
    }

    override afterPrepareData() {
        const selector = this.resolveInjectedProperties(this.selector);
        const systemData = this.actor.system;
        const skillLongForms: Record<string, { shortform?: string } | undefined> = SKILL_EXPANDED;
        const proficiency = skillLongForms[selector]?.shortform ?? selector;
        const statistic = setHasElement(SKILL_ABBREVIATIONS, proficiency)
            ? this.actor.skills[proficiency]
            : proficiency === "ac"
            ? systemData.attributes.ac
            : null;

        if (statistic) {
            const toIgnore = statistic.modifiers.filter((m) => m.type === "proficiency" && m.slug !== this.slug);
            for (const modifier of toIgnore) {
                modifier.predicate = new PredicateXPRPG(`overridden-by-${this.slug}`);
            }

            // Only AC will be a `StatisticModifier`
            if (statistic instanceof StatisticModifier) {
                const rollOptions = new Set(this.actor.getRollOptions(["ac", `${this.ability}-based`]));
                statistic.calculateTotal(rollOptions);
                statistic.value = 10 + statistic.totalModifier;
            }
        }
    }
}

interface FixedProficiencyRuleElement {
    get actor(): CharacterXPRPG;
}

interface FixedProficiencySource extends RuleElementSource {
    selector?: unknown;
    ability?: unknown;
    force?: unknown;
}

export { FixedProficiencyRuleElement };
