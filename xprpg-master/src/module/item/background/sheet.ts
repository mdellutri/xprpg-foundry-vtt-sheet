import { ABCSheetData, ABCSheetXPRPG } from "../abc/sheet";
import { BackgroundXPRPG } from "@item/background";
import { createSheetOptions, SheetOptions } from "@module/sheet/helpers";

export class BackgroundSheetXPRPG extends ABCSheetXPRPG<BackgroundXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<BackgroundSheetData> {
        const data = await super.getData(options);
        const itemData = data.item;

        return {
            ...data,
            trainedSkills: createSheetOptions(CONFIG.XPRPG.skills, itemData.system.trainedSkills),
            selectedBoosts: Object.fromEntries(
                Object.entries(itemData.system.boosts).map(([k, b]) => [k, this.getLocalizedAbilities(b)])
            ),
        };
    }
}

interface BackgroundSheetData extends ABCSheetData<BackgroundXPRPG> {
    trainedSkills: SheetOptions;
    selectedBoosts: Record<string, Record<string, string>>;
}
