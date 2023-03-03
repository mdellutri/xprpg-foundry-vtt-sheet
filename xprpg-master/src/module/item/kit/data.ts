import { BaseItemDataXPRPG, BaseItemSourceXPRPG, ItemSystemSource } from "@item/data/base";
import { PhysicalItemTraits, PartialPrice } from "@item/physical/data";
import type { KitXPRPG } from ".";

type KitSource = BaseItemSourceXPRPG<"kit", KitSystemSource>;

type KitData = Omit<KitSource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<KitXPRPG, "kit", KitSystemData, KitSource>;

interface KitEntryData {
    uuid: ItemUUID;
    img: ImageFilePath;
    quantity: number;
    name: string;
    isContainer: boolean;
    items?: Record<string, KitEntryData>;
}

interface KitSystemSource extends ItemSystemSource {
    traits: PhysicalItemTraits;
    items: Record<string, KitEntryData>;
    price: PartialPrice;
}

type KitSystemData = KitSystemSource;

export { KitData, KitEntryData, KitSource, KitSystemData, KitSystemSource };
