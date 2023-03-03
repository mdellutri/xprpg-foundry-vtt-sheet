import type { ItemXPRPG } from "@item";
import { LaxSchemaField } from "@system/schema-data-fields";
import {
    RuleElementData,
    RuleElementOptions,
    RuleElementXPRPG,
    RuleElementSchema,
    RuleElementSource,
} from "./rule-element";
import { ActorTraitsRuleElement } from "./rule-element/actor-traits";
import { AdjustDegreeOfSuccessRuleElement } from "./rule-element/adjust-degree-of-success";
import { AdjustModifierRuleElement } from "./rule-element/adjust-modifier";
import { AdjustStrikeRuleElement } from "./rule-element/adjust-strike";
import { AELikeRuleElement } from "./rule-element/ae-like";
import { AuraRuleElement } from "./rule-element/aura";
import { BaseSpeedRuleElement } from "./rule-element/base-speed";
import { BattleFormRuleElement } from "./rule-element/battle-form/rule-element";
import { ChoiceSetRuleElement } from "./rule-element/choice-set/rule-element";
import { CraftingEntryRuleElement } from "./rule-element/crafting/entry";
import { CraftingFormulaRuleElement } from "./rule-element/crafting/formula";
import { CreatureSizeRuleElement } from "./rule-element/creature-size";
import { CritSpecRuleElement } from "./rule-element/crit-spec";
import { DamageDiceRuleElement } from "./rule-element/damage-dice";
import { DexterityModifierCapRuleElement } from "./rule-element/dexterity-modifier-cap";
import { FastHealingRuleElement } from "./rule-element/fast-healing";
import { FixedProficiencyRuleElement } from "./rule-element/fixed-proficiency";
import { FlatModifierRuleElement } from "./rule-element/flat-modifier";
import { GrantItemRuleElement } from "./rule-element/grant-item";
import { ImmunityRuleElement } from "./rule-element/iwr/immunity";
import { ResistanceRuleElement } from "./rule-element/iwr/resistance";
import { WeaknessRuleElement } from "./rule-element/iwr/weakness";
import { LoseHitPointsRuleElement } from "./rule-element/lose-hit-points";
import { MarkTokenRuleElement } from "./rule-element/mark-token/rule-element";
import { MartialProficiencyRuleElement } from "./rule-element/martial-proficiency";
import { MultipleAttackPenaltyRuleElement } from "./rule-element/multiple-attack-penalty";
import { EphemeralEffectRuleElement } from "./rule-element/ephemeral-effect";
import { RollNoteRuleElement } from "./rule-element/roll-note";
import { RollOptionRuleElement } from "./rule-element/roll-option";
import { RollTwiceRuleElement } from "./rule-element/roll-twice";
import { SenseRuleElement } from "./rule-element/sense";
import { StrikeRuleElement } from "./rule-element/strike";
import { StrikingRuleElement } from "./rule-element/striking";
import { SubstituteRollRuleElement } from "./rule-element/substitute-roll";
import { TempHPRuleElement } from "./rule-element/temp-hp";
import { TokenEffectIconRuleElement } from "./rule-element/token-effect-icon";
import { TokenImageRuleElement } from "./rule-element/token-image";
import { TokenLightRuleElement } from "./rule-element/token-light";
import { TokenNameRuleElement } from "./rule-element/token-name";
import { WeaponPotencyRuleElement } from "./rule-element/weapon-potency";
export { RuleElementSynthetics } from "./synthetics";

/**
 * @category RuleElement
 */
class RuleElements {
    static readonly builtin: Record<string, RuleElementConstructor | undefined> = {
        ActiveEffectLike: AELikeRuleElement,
        ActorTraits: ActorTraitsRuleElement,
        AdjustDegreeOfSuccess: AdjustDegreeOfSuccessRuleElement,
        AdjustModifier: AdjustModifierRuleElement,
        AdjustStrike: AdjustStrikeRuleElement,
        Aura: AuraRuleElement,
        BaseSpeed: BaseSpeedRuleElement,
        BattleForm: BattleFormRuleElement,
        ChoiceSet: ChoiceSetRuleElement,
        CraftingEntry: CraftingEntryRuleElement,
        CraftingFormula: CraftingFormulaRuleElement,
        CreatureSize: CreatureSizeRuleElement,
        CriticalSpecialization: CritSpecRuleElement,
        DamageDice: DamageDiceRuleElement,
        DexterityModifierCap: DexterityModifierCapRuleElement,
        EphemeralEffect: EphemeralEffectRuleElement,
        FastHealing: FastHealingRuleElement,
        FixedProficiency: FixedProficiencyRuleElement,
        FlatModifier: FlatModifierRuleElement,
        GrantItem: GrantItemRuleElement,
        Immunity: ImmunityRuleElement,
        LoseHitPoints: LoseHitPointsRuleElement,
        MarkToken: MarkTokenRuleElement,
        MartialProficiency: MartialProficiencyRuleElement,
        MultipleAttackPenalty: MultipleAttackPenaltyRuleElement,
        Note: RollNoteRuleElement,
        Resistance: ResistanceRuleElement,
        RollOption: RollOptionRuleElement,
        RollTwice: RollTwiceRuleElement,
        Sense: SenseRuleElement,
        Strike: StrikeRuleElement,
        Striking: StrikingRuleElement,
        SubstituteRoll: SubstituteRollRuleElement,
        TempHP: TempHPRuleElement,
        TokenEffectIcon: TokenEffectIconRuleElement,
        TokenImage: TokenImageRuleElement,
        TokenLight: TokenLightRuleElement,
        TokenName: TokenNameRuleElement,
        Weakness: WeaknessRuleElement,
        WeaponPotency: WeaponPotencyRuleElement,
    };

    static custom: Record<string, RuleElementConstructor | undefined> = {};

    static get all() {
        return { ...this.builtin, ...this.custom };
    }

    static fromOwnedItem(item: Embedded<ItemXPRPG>, options?: RuleElementOptions): RuleElementXPRPG[] {
        const rules: RuleElementXPRPG[] = [];
        for (const [sourceIndex, source] of item.system.rules.entries()) {
            if (typeof source.key !== "string") {
                console.error(
                    `XPRPG System | Missing key in rule element ${source.key} on item ${item.name} (${item.uuid})`
                );
                continue;
            }
            const REConstructor = this.custom[source.key] ?? this.custom[source.key] ?? this.builtin[source.key];
            if (REConstructor) {
                const rule = ((): RuleElementXPRPG | null => {
                    try {
                        return new REConstructor(source, item, { ...(options ?? {}), sourceIndex });
                    } catch (error) {
                        if (!options?.suppressWarnings) {
                            console.warn(
                                `XPRPG System | Failed to construct rule element ${source.key} on item ${item.name}`,
                                `(${item.uuid})`
                            );
                            console.warn(error);
                        }
                        return null;
                    }
                })();
                if (rule) rules.push(rule);
            } else {
                const { name, uuid } = item;
                console.warn(`XPRPG System | Unrecognized rule element ${source.key} on item ${name} (${uuid})`);
            }
        }
        return rules;
    }
}

type RuleElementConstructor = { schema: LaxSchemaField<RuleElementSchema> } & (new (
    data: RuleElementSource,
    item: Embedded<ItemXPRPG>,
    options?: RuleElementOptions
) => RuleElementXPRPG);

export { RuleElements, RuleElementXPRPG, RuleElementSource, RuleElementData, RuleElementOptions };
