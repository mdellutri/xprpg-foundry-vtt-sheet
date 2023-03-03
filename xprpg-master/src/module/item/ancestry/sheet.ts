import { AncestryXPRPG } from "@item/ancestry";
import { ABCSheetData, ABCSheetXPRPG } from "@item/abc/sheet";
import { createSheetOptions, SheetOptions } from "@module/sheet/helpers";

class AncestrySheetXPRPG extends ABCSheetXPRPG<AncestryXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<AncestrySheetData> {
        const data: ABCSheetData<AncestryXPRPG> = await super.getData(options);
        const itemData = data.item;

        return {
            ...data,
            selectedBoosts: Object.fromEntries(
                Object.entries(itemData.system.boosts).map(([k, b]) => [k, this.getLocalizedAbilities(b)])
            ),
            selectedFlaws: Object.fromEntries(
                Object.entries(itemData.system.flaws).map(([k, b]) => [k, this.getLocalizedAbilities(b)])
            ),
            sizes: createSheetOptions(CONFIG.XPRPG.actorSizes, { value: [itemData.system.size] }),
            languages: createSheetOptions(CONFIG.XPRPG.languages, itemData.system.languages),
            additionalLanguages: createSheetOptions(CONFIG.XPRPG.languages, itemData.system.additionalLanguages),
        };
    }
}

interface AncestrySheetData extends ABCSheetData<AncestryXPRPG> {
    selectedBoosts: Record<string, Record<string, string>>;
    selectedFlaws: Record<string, Record<string, string>>;
    sizes: SheetOptions;
    languages: SheetOptions;
    additionalLanguages: SheetOptions;
}

export { AncestrySheetXPRPG };
