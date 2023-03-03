import { BaseItemDataXPRPG, BaseItemSourceXPRPG, ItemSystemSource } from "@item/data/base";
import { ZeroToFour } from "@module/data";
import type { LoreXPRPG } from ".";

type LoreSource = BaseItemSourceXPRPG<"lore", LoreSystemSource>;

type LoreData = Omit<LoreSource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<LoreXPRPG, "lore", LoreSystemData, LoreSource>;

interface LoreSystemSource extends ItemSystemSource {
    mod: {
        value: number;
    };
    proficient: {
        value: ZeroToFour;
    };
    variants?: Record<string, { label: string; options: string }>;
}

type LoreSystemData = LoreSystemSource;

export { LoreData, LoreSource };
