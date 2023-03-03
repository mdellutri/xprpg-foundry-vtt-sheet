import { PhysicalItemSheetData, PhysicalItemSheetXPRPG } from "@item/physical";
import { TreasureXPRPG } from ".";

export class TreasureSheetXPRPG extends PhysicalItemSheetXPRPG<TreasureXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<TreasureSheetData> {
        return {
            ...(await super.getData(options)),
            hasDetails: false,
            hasSidebar: true,
            currencies: CONFIG.XPRPG.currencies,
        };
    }
}

interface TreasureSheetData extends PhysicalItemSheetData<TreasureXPRPG> {
    currencies: ConfigXPRPG["XPRPG"]["currencies"];
}
