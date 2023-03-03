import { ActorXPRPG } from "@actor/base";
import { ActorSizeXPRPG } from "@actor/data/size";
import { InventoryBulk } from "@actor/inventory";
import { LootXPRPG } from "@actor/loot";
import { PhysicalItemXPRPG } from "@item";
import { Coins } from "@item/physical/data";
import { PhysicalItemType } from "@item/physical/types";
import { SheetOptions } from "@module/sheet/helpers";

export interface InventoryItem<TItem extends PhysicalItemXPRPG = PhysicalItemXPRPG> {
    item: TItem;
    /** Item size if it causes any weight difference relative to the actor */
    itemSize?: ActorSizeXPRPG | null;
    editable: boolean;
    isContainer: boolean;
    canBeEquipped: boolean;
    isInvestable: boolean;
    isSellable: boolean;
    hasCharges: boolean;
    heldItems?: InventoryItem[];
}

interface CoinDisplayData {
    value: number;
    label: string;
}

export type CoinageSummary = { [K in keyof Coins]?: CoinDisplayData };

interface SheetItemList {
    label: string;
    type: PhysicalItemType;
    items: InventoryItem[];
}

export interface SheetInventory {
    sections: Record<Exclude<PhysicalItemType, "book">, SheetItemList>;
    bulk: InventoryBulk;
    showValueAlways: boolean;
    showIndividualPricing: boolean;
    invested?: { value: number; max: number } | null;
}

export interface ActorSheetDataXPRPG<TActor extends ActorXPRPG> extends ActorSheetData<TActor> {
    traits: SheetOptions;
    isTargetFlatFooted: boolean;
    user: { isGM: boolean };
    totalCoinage: CoinageSummary;
    totalCoinageGold: string;
    totalWealth: Coins;
    totalWealthGold: string;
    inventory: SheetInventory;
    enrichedContent: Record<string, string>;
}

export interface LootSheetDataXPRPG extends ActorSheetDataXPRPG<LootXPRPG> {
    isLoot: boolean;
}
