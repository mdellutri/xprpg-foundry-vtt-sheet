import { RuleElementXPRPG, RuleElementData, RuleElementSource, RuleElementOptions } from ".";
import { CharacterXPRPG } from "@actor";
import { MartialProficiency } from "@actor/character/data";
import { ActorType } from "@actor/data";
import { ItemXPRPG } from "@item";
import { ProficiencyRank } from "@item/data";
import { WeaponCategory } from "@item/weapon/types";
import { PROFICIENCY_RANKS, ZeroToFour } from "@module/data";
import { PredicateXPRPG, RawPredicate } from "@system/predication";

class MartialProficiencyRuleElement extends RuleElementXPRPG {
    protected static override validActorTypes: ActorType[] = ["character"];

    /** Predication test for whether a weapon matches this proficiency */
    definition: PredicateXPRPG;

    constructor(data: MartialProficiencySource, item: Embedded<ItemXPRPG>, options?: RuleElementOptions) {
        data.priority = 9;
        data.immutable = Boolean(data.immutable ?? true);
        data.value ??= 1;

        super(data, item, options);

        this.definition = new PredicateXPRPG(Array.isArray(data.definition) ? data.definition : []);
    }

    private validateData(): void {
        const data = this.data;

        if (typeof data.slug !== "string") {
            this.failValidation("A martial proficiency must have a slug");
        }

        if (!Array.isArray(data.definition)) {
            this.failValidation("A martial proficiency must have a definition");
        }

        if ("sameAs" in data) {
            if (typeof data.sameAs !== "string" || !(data.sameAs in CONFIG.XPRPG.weaponCategories)) {
                this.failValidation('The "sameAs" property is invalid');
            }
        }

        if ("maxRank" in data) {
            const validRanks: string[] = PROFICIENCY_RANKS.filter((rank) => rank !== "untrained");
            if (!(typeof data.maxRank === "string") || !validRanks.includes(data.maxRank)) {
                this.failValidation('The "maxRank" property is invalid');
            }
        }
    }

    override onApplyActiveEffects(): void {
        this.validateData();
        if (!this.test()) return;

        this.actor.system.martial[this.data.slug] = this.createValue();
    }

    /** Set this martial proficiency as an AELike value  */
    private createValue(): MartialProficiency {
        const rank = Math.clamped(Number(this.resolveValue()), 1, 4) as ZeroToFour;
        const proficiency: MartialProficiency = {
            definition: this.resolveInjectedProperties(this.definition),
            immutable: this.data.immutable ?? true,
            label: this.label,
            rank,
            value: 0,
            breakdown: "",
        };
        if (this.data.sameAs) proficiency.sameAs = this.data.sameAs;
        if (this.data.maxRank) proficiency.maxRank = this.data.maxRank;

        return proficiency;
    }
}

interface MartialProficiencyRuleElement extends RuleElementXPRPG {
    data: MartialProficiencyData;

    get actor(): CharacterXPRPG;
}

interface MartialProficiencyData extends RuleElementData {
    key: "MartialProficiency";
    /** The key to be used for this proficiency in `CharacterXPRPG#system#martial` */
    slug: string;
    /** The criteria for matching qualifying weapons and other attacks */
    definition: RawPredicate;
    /** Whether this proficiency's rank can be manually changed */
    immutable: boolean;
    /** The attack category to which this proficiency's rank is linked */
    sameAs: WeaponCategory;
    /** The maximum rank this proficiency can reach, if any */
    maxRank?: Exclude<ProficiencyRank, "untrained">;
    /** Initially a number indicating rank, changed into a `MartialProficiency` object for overriding as an AE-like */
    value: number | MartialProficiency;
}

export interface MartialProficiencySource extends RuleElementSource {
    definition?: unknown;
    sameAs?: unknown;
    immutable?: unknown;
    maxRank?: unknown;
}

export { MartialProficiencyRuleElement };
