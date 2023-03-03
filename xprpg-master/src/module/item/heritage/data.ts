import { CreatureTraits } from "@item/ancestry/data";
import { BaseItemDataXPRPG, BaseItemSourceXPRPG, ItemSystemData } from "@item/data/base";
import type { HeritageXPRPG } from "./document";

type HeritageSource = BaseItemSourceXPRPG<"heritage", HeritageSystemSource>;

type HeritageData = Omit<HeritageSource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<HeritageXPRPG, "heritage", HeritageSystemData, HeritageSource>;

interface HeritageSystemSource extends ItemSystemData {
    ancestry: {
        name: string;
        slug: string;
        uuid: ItemUUID;
    } | null;
    traits: CreatureTraits;
}

export type HeritageSystemData = HeritageSystemSource;

export { HeritageData, HeritageSource, HeritageSystemSource };
