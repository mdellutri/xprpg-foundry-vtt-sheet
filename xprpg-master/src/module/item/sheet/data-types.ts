import { AncestryXPRPG, FeatXPRPG, HeritageXPRPG, ItemXPRPG } from "@item";
import { Rarity } from "@module/data";
import { RuleElementSource } from "@module/rules";
import { SheetOptions, TraitTagifyEntry } from "@module/sheet/helpers";

export interface ItemSheetDataXPRPG<TItem extends ItemXPRPG> extends ItemSheetData<TItem> {
    /** The item type label that shows at the top right (for example, "Feat" for "Feat 6") */
    itemType: string | null;
    showTraits: boolean;
    /** Whether the sheet should have a sidebar at all */
    hasSidebar: boolean;
    /** Whether the sheet should have a details tab (some item types don't have one) */
    hasDetails: boolean;
    /** The sidebar's current title */
    sidebarTitle: string;
    sidebarTemplate?: () => string;
    detailsTemplate?: () => string;
    item: TItem["data"];
    data: TItem["data"]["system"];
    enrichedContent: Record<string, string>;
    isPhysical: boolean;
    user: { isGM: boolean };
    enabledRulesUI: boolean;
    ruleEditing: boolean;
    rarity: Rarity | null;
    rarities: ConfigXPRPG["XPRPG"]["rarityTraits"];
    traits: SheetOptions | null;
    traitTagifyData: TraitTagifyEntry[] | null;
    rules: {
        labels: {
            label: string;
            recognized: boolean;
        }[];
        selection: {
            selected: string | null;
            types: Record<string, string>;
        };
        elements: {
            template: string;
            index: number;
            rule: RuleElementSource;
        }[];
    };
    /** Lore only, will be removed later */
    proficiencies: ConfigXPRPG["XPRPG"]["proficiencyLevels"];
}

export interface FeatSheetData extends ItemSheetDataXPRPG<FeatXPRPG> {
    featTypes: ConfigXPRPG["XPRPG"]["featTypes"];
    actionTypes: ConfigXPRPG["XPRPG"]["actionTypes"];
    actionsNumber: ConfigXPRPG["XPRPG"]["actionsNumber"];
    frequencies: ConfigXPRPG["XPRPG"]["frequencies"];
    damageTypes: ConfigXPRPG["XPRPG"]["damageTypes"] & ConfigXPRPG["XPRPG"]["healingTypes"];
    categories: ConfigXPRPG["XPRPG"]["actionCategories"];
    prerequisites: string;
    isFeat: boolean;
    mandatoryTakeOnce: boolean;
    hasLineageTrait: boolean;
}

export interface HeritageSheetData extends ItemSheetDataXPRPG<HeritageXPRPG> {
    ancestry: AncestryXPRPG | null;
    ancestryRefBroken: boolean;
}
