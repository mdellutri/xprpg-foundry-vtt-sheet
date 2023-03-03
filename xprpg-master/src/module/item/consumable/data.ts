import {
    BasePhysicalItemData,
    BasePhysicalItemSource,
    PhysicalItemTraits,
    PhysicalSystemData,
    PhysicalSystemSource,
} from "@item/physical/data";
import { SpellSource } from "@item/spell/data";
import type { ConsumableXPRPG } from ".";
import { ConsumableTrait, OtherConsumableTag } from "./types";

type ConsumableSource = BasePhysicalItemSource<"consumable", ConsumableSystemSource>;

type ConsumableData = Omit<ConsumableSource, "system" | "effects" | "flags"> &
    BasePhysicalItemData<ConsumableXPRPG, "consumable", ConsumableSystemData, ConsumableSource>;

type ConsumableCategory = keyof ConfigXPRPG["XPRPG"]["consumableTypes"];

interface ConsumableTraits extends PhysicalItemTraits<ConsumableTrait> {
    otherTags: OtherConsumableTag[];
}

interface ConsumableSystemSource extends PhysicalSystemSource {
    traits: ConsumableTraits;

    consumableType: {
        value: ConsumableCategory;
    };
    charges: {
        value: number;
        max: number;
    };
    consume: {
        value: string;
    };
    autoDestroy: {
        value: boolean;
    };
    spell: SpellSource | null;
}

interface ConsumableSystemData
    extends Omit<ConsumableSystemSource, "identification" | "price" | "temporary" | "usage">,
        Omit<PhysicalSystemData, "traits"> {}

export { ConsumableData, ConsumableSource, ConsumableSystemSource, ConsumableTrait, ConsumableCategory };
