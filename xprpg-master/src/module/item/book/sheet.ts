import { PhysicalItemSheetData, PhysicalItemSheetXPRPG } from "@item/physical/sheet";
import { BookXPRPG } from "./document";

export class BookSheetXPRPG extends PhysicalItemSheetXPRPG<BookXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<PhysicalItemSheetData<BookXPRPG>> {
        const data = await super.getData(options);
        data.hasDetails = true;
        return data;
    }

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);
    }
}
