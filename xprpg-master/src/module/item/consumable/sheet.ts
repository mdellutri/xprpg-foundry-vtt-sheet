import { ConsumableXPRPG } from "@item";
import { PhysicalItemSheetData, PhysicalItemSheetXPRPG } from "@item/physical";
import { createSheetTags, SheetOptions } from "@module/sheet/helpers";

export class ConsumableSheetXPRPG extends PhysicalItemSheetXPRPG<ConsumableXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<ConsumableSheetData> {
        const item = this.item;
        const sheetData = await super.getData(options);
        return {
            ...sheetData,
            hasDetails: true,
            hasSidebar: true,
            consumableTypes: CONFIG.XPRPG.consumableTypes,
            otherTags: createSheetTags(CONFIG.XPRPG.otherConsumableTags, item.system.traits.otherTags),
        };
    }
}

interface ConsumableSheetData extends PhysicalItemSheetData<ConsumableXPRPG> {
    consumableTypes: ConfigXPRPG["XPRPG"]["consumableTypes"];
    otherTags: SheetOptions;
}
