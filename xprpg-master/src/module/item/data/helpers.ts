import { isObject, setHasElement } from "@util";
import { ItemSourceXPRPG, MagicItemSource, PhysicalItemSource } from ".";
import { ItemSystemData } from "./base";
import { PHYSICAL_ITEM_TYPES } from "@item/physical/values";

function isItemSystemData(data: unknown): data is ItemSystemData {
    return (
        isObject<Record<"description" | "rules" | "slug", unknown>>(data) &&
        isObject<{ value?: unknown }>(data.description) &&
        typeof data.description.value === "string" &&
        Array.isArray(data.rules) &&
        (data.slug === null || typeof data.slug === "string")
    );
}

/** Checks if the given item data is a physical item with a quantity and other physical fields. */
function isPhysicalData(source: ItemSourceXPRPG): source is PhysicalItemSource;
function isPhysicalData(source: PreCreate<ItemSourceXPRPG>): source is PreCreate<PhysicalItemSource>;
function isPhysicalData(source: ItemSourceXPRPG | PreCreate<ItemSourceXPRPG>): boolean {
    return setHasElement(PHYSICAL_ITEM_TYPES, source.type);
}

function hasInvestedProperty(source: ItemSourceXPRPG): source is MagicItemSource {
    return isPhysicalData(source) && "invested" in source.system.equipped;
}

function isInventoryItem(type: string): boolean {
    switch (type) {
        case "armor":
        case "backpack":
        case "consumable":
        case "equipment":
        case "treasure":
        case "weapon": {
            return true;
        }
    }

    return false;
}

export { hasInvestedProperty, isInventoryItem, isItemSystemData, isPhysicalData };
