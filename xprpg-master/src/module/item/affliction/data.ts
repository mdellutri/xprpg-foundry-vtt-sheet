import { SaveType } from "@actor/types";
import { EffectAuraData, EffectContextData, EffectTraits, TimeUnit } from "@item/abstract-effect/data";
import { ConditionSlug } from "@item/condition";
import {
    BaseItemDataXPRPG,
    BaseItemSourceXPRPG,
    ItemFlagsXPRPG,
    ItemLevelData,
    ItemSystemData,
    ItemSystemSource,
} from "@item/data/base";
import { DamageCategoryUnique, DamageType } from "@system/damage";
import { AfflictionXPRPG } from "./document";

type AfflictionSource = BaseItemSourceXPRPG<"affliction", AfflictionSystemSource> & {
    flags: DeepPartial<AfflictionFlags>;
};

type AfflictionData = Omit<AfflictionSource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<AfflictionXPRPG, "affliction", AfflictionSystemData, AfflictionSource> & {
        flags: AfflictionFlags;
    };

type AfflictionFlags = ItemFlagsXPRPG & {
    xprpg: {
        aura?: EffectAuraData;
    };
};

interface AfflictionSystemSource extends ItemSystemSource, ItemLevelData {
    traits: EffectTraits;
    save: {
        type: SaveType;
        value: number;
    };
    stage: number;
    stages: Record<string, AfflictionStageData>;
    onset?: AfflictionOnset;
    duration: {
        value: number;
        unit: TimeUnit | "unlimited";
        expiry?: null;
    };
    /** Origin, target, and roll context of the action that spawned this effect */
    context: EffectContextData | null;
}

interface AfflictionSystemData extends AfflictionSystemSource, Omit<ItemSystemData, "traits"> {}

interface AfflictionOnset {
    value: number;
    unit: TimeUnit;
}

interface AfflictionDamage {
    value: string;
    type: DamageType;
    category?: DamageCategoryUnique;
}

interface AfflictionStageData {
    damage: Record<string, AfflictionDamage>;
    conditions: Record<string, AfflictionConditionData>;
    effects: {
        uuid: ItemUUID;
    }[];
}

interface AfflictionConditionData {
    slug: ConditionSlug;
    value?: number;
}

interface AfflictionSystemData extends Omit<AfflictionSystemSource, "items">, Omit<ItemSystemData, "traits"> {}

export {
    AfflictionConditionData,
    AfflictionDamage,
    AfflictionData,
    AfflictionOnset,
    AfflictionSource,
    AfflictionStageData,
    AfflictionSystemData,
};
