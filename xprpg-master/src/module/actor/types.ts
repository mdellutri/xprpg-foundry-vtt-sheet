import { ActorXPRPG } from "@actor";
import { MeleeXPRPG, SpellXPRPG, WeaponXPRPG } from "@item";
import { EffectTrait } from "@item/abstract-effect";
import { TokenDocumentXPRPG } from "@scene";
import { immunityTypes, resistanceTypes, weaknessTypes } from "@scripts/config/iwr";
import { DamageRoll } from "@system/damage/roll";
import { CheckDC } from "@system/degree-of-success";
import { PredicateXPRPG } from "@system/predication";
import { TraitViewData } from "./data/base";
import { ModifierXPRPG } from "./modifiers";
import {
    ABILITY_ABBREVIATIONS,
    DC_SLUGS,
    SAVE_TYPES,
    SKILL_ABBREVIATIONS,
    SKILL_LONG_FORMS,
    UNAFFECTED_TYPES,
} from "./values";

type AbilityString = SetElement<typeof ABILITY_ABBREVIATIONS>;

interface ActorDimensions {
    length: number;
    width: number;
    height: number;
}

type SkillAbbreviation = SetElement<typeof SKILL_ABBREVIATIONS>;
type SkillLongForm = SetElement<typeof SKILL_LONG_FORMS>;

type ActorAlliance = "party" | "opposition" | null;

type DCSlug = SetElement<typeof DC_SLUGS>;

type SaveType = (typeof SAVE_TYPES)[number];

interface AuraData {
    slug: string;
    radius: number;
    effects: AuraEffectData[];
    colors: AuraColors | null;
    traits: EffectTrait[];
}

interface AuraEffectData {
    uuid: string;
    level: number | null;
    affects: "allies" | "enemies" | "all";
    events: ("enter" | "turn-start" | "turn-end")[];
    save: {
        type: SaveType;
        dc: number;
    } | null;
    predicate: PredicateXPRPG;
    removeOnExit: boolean;
    includesSelf: boolean;
}

interface AuraColors {
    border: `#${string}`;
    fill: `#${string}`;
}

/* -------------------------------------------- */
/*  Attack Rolls                                */
/* -------------------------------------------- */

type AttackItem = WeaponXPRPG | MeleeXPRPG | SpellXPRPG;

interface StrikeSelf<A extends ActorXPRPG = ActorXPRPG, I extends AttackItem = AttackItem> {
    actor: A;
    token: TokenDocumentXPRPG | null;
    /** The item used for the strike */
    item: I;
    /** Bonuses and penalties added at the time of a strike */
    modifiers: ModifierXPRPG[];
}

interface AttackTarget {
    actor: ActorXPRPG;
    token: TokenDocumentXPRPG;
    distance: number;
    rangeIncrement: number | null;
}

/** Context for the attack or damage roll of a strike */
interface StrikeRollContext<A extends ActorXPRPG, I extends AttackItem> {
    /** Roll options */
    options: Set<string>;
    self: StrikeSelf<A, I>;
    target: AttackTarget | null;
    traits: TraitViewData[];
}

interface StrikeRollContextParams<T extends AttackItem> {
    /** The item being used in the attack or damage roll */
    item: T;
    /** Domains from which to draw roll options */
    domains: string[];
    /** Initial roll options for the strike */
    options: Set<string>;
    /** Whether the request is for display in a sheet view. If so, targets are not considered */
    viewOnly?: boolean;
}

interface AttackRollContext<A extends ActorXPRPG, I extends AttackItem> extends StrikeRollContext<A, I> {
    dc: CheckDC | null;
}

interface ApplyDamageParams {
    damage: number | Rolled<DamageRoll>;
    token: TokenDocumentXPRPG;
    skipIWR?: boolean;
    /** Predicate statements from the damage roll */
    rollOptions?: Set<string>;
    shieldBlockRequest?: boolean;
}

type ImmunityType = keyof typeof immunityTypes;
type WeaknessType = keyof typeof weaknessTypes;
type ResistanceType = keyof typeof resistanceTypes;
/** Damage types a creature or hazard is possibly unaffected by, outside the IWR framework */
type UnaffectedType = SetElement<typeof UNAFFECTED_TYPES>;
type IWRType = ImmunityType | WeaknessType | ResistanceType;

export {
    AbilityString,
    ActorAlliance,
    ActorDimensions,
    ApplyDamageParams,
    AttackItem,
    AttackRollContext,
    AttackTarget,
    AuraColors,
    AuraData,
    AuraEffectData,
    DCSlug,
    IWRType,
    ImmunityType,
    ResistanceType,
    SaveType,
    SkillAbbreviation,
    SkillLongForm,
    StrikeRollContext,
    StrikeRollContextParams,
    StrikeSelf,
    UnaffectedType,
    WeaknessType,
};
