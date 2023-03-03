import { PhysicalItemSheetData, PhysicalItemSheetXPRPG } from "@item/physical";
import { createSheetTags, SheetOptions } from "@module/sheet/helpers";
import { EquipmentXPRPG } from ".";

export class EquipmentSheetXPRPG extends PhysicalItemSheetXPRPG<EquipmentXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<EquipmentSheetData> {
        const item = this.item;
        const sheetData = await super.getData(options);
        return {
            ...sheetData,
            hasDetails: true,
            hasSidebar: true,
            otherTags: createSheetTags(CONFIG.XPRPG.otherArmorTags, item.system.traits.otherTags),
        };
    }
}

interface EquipmentSheetData extends PhysicalItemSheetData<EquipmentXPRPG> {
    bulkTypes: ConfigXPRPG["XPRPG"]["bulkTypes"];
    otherTags: SheetOptions;
}
