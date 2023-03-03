import { CreatureTrait } from "@actor/creature";
import { ActionTrait } from "@item/action";
import type { ItemXPRPG } from "@item/base";
import { NPCAttackTrait } from "@item/melee";
import type { ActiveEffectXPRPG } from "@module/active-effect";
import { DocumentSchemaRecord, OneToThree, Rarity } from "@module/data";
import { RuleElementSource } from "@module/rules";
import { ItemType } from ".";
import { PhysicalItemTrait } from "../physical/data";

interface BaseItemSourceXPRPG<
    TType extends ItemType = ItemType,
    TSystemSource extends ItemSystemSource = ItemSystemSource
> extends foundry.data.ItemSource<TType, TSystemSource> {
    flags: ItemSourceFlagsXPRPG;
}

interface BaseItemDataXPRPG<
    TItem extends ItemXPRPG = ItemXPRPG,
    TType extends ItemType = ItemType,
    TSystemData extends ItemSystemData = ItemSystemData,
    TSource extends BaseItemSourceXPRPG<TType> = BaseItemSourceXPRPG<TType>
> extends Omit<BaseItemSourceXPRPG<TType, ItemSystemSource>, "system" | "effects">,
        foundry.data.ItemData<TItem, ActiveEffectXPRPG> {
    readonly type: TType;
    readonly system: TSystemData;
    flags: ItemFlagsXPRPG;

    readonly _source: TSource;
}

type ItemTrait = ActionTrait | CreatureTrait | PhysicalItemTrait | NPCAttackTrait;

type ActionType = keyof ConfigXPRPG["XPRPG"]["actionTypes"];

interface ActionCost {
    type: Exclude<ActionType, "passive">;
    value: OneToThree | null;
}

interface ItemTraits<T extends ItemTrait = ItemTrait> {
    value: T[];
    rarity?: Rarity;
}

interface ItemFlagsXPRPG extends foundry.data.ItemFlags {
    xprpg: {
        rulesSelections: Record<string, string | number | object>;
        itemGrants: Record<string, ItemGrantData>;
        grantedBy: ItemGrantData | null;
        [key: string]: unknown;
    };
}

interface ItemSourceFlagsXPRPG extends DeepPartial<foundry.data.ItemFlags> {
    xprpg?: {
        rulesSelections?: Record<string, string | number | object>;
        itemGrants?: Record<string, ItemGrantSource>;
        grantedBy?: ItemGrantSource | null;
        [key: string]: unknown;
    };
}

type ItemGrantData = Required<ItemGrantSource>;

interface ItemGrantSource {
    id: string;
    onDelete?: ItemGrantDeleteAction;
}

type ItemGrantDeleteAction = "cascade" | "detach" | "restrict";

interface ItemLevelData {
    level: {
        value: number;
    };
}

interface ItemSystemSource {
    description: {
        gm: string;
        value: string;
    };
    source: {
        value: string;
    };
    traits?: ItemTraits;
    options?: {
        value: string[];
    };
    rules: RuleElementSource[];
    slug: string | null;
    schema: DocumentSchemaRecord;
}

type ItemSystemData = ItemSystemSource;

interface FrequencySource {
    value?: number;
    max: number;
    /** Gap between recharges as an ISO8601 duration, or "day" for daily prep. */
    per: keyof ConfigXPRPG["XPRPG"]["frequencies"];
}

interface Frequency extends FrequencySource {
    value: number;
}

export {
    ActionCost,
    ActionType,
    BaseItemDataXPRPG,
    BaseItemSourceXPRPG,
    Frequency,
    FrequencySource,
    ItemFlagsXPRPG,
    ItemGrantData,
    ItemGrantDeleteAction,
    ItemGrantSource,
    ItemLevelData,
    ItemSystemData,
    ItemSystemSource,
    ItemTrait,
    ItemTraits,
};
