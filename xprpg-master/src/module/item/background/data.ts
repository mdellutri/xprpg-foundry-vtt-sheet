import { SkillAbbreviation } from "@actor/creature/data";
import { AbilityString } from "@actor/types";
import { ABCSystemData, ABCSystemSource } from "@item/abc/data";
import { BaseItemDataXPRPG, BaseItemSourceXPRPG, ItemTraits } from "@item/data/base";
import { BackgroundXPRPG } from ".";

type BackgroundSource = BaseItemSourceXPRPG<"background", BackgroundSystemSource>;

type BackgroundData = Omit<BackgroundSource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<BackgroundXPRPG, "background", BackgroundSystemData, BackgroundSource>;

interface BackgroundSystemSource extends ABCSystemSource {
    traits: ItemTraits;
    boosts: Record<number, { value: AbilityString[]; selected: AbilityString | null }>;
    trainedLore: string;
    trainedSkills: {
        value: SkillAbbreviation[];
    };
}

interface BackgroundSystemData extends Omit<BackgroundSystemSource, "items">, Omit<ABCSystemData, "traits"> {}

export { BackgroundData, BackgroundSource };
