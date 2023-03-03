import { PhysicalItemSheetData, PhysicalItemSheetXPRPG } from "@item/physical";
import { ContainerXPRPG } from ".";

export class ContainerSheetXPRPG extends PhysicalItemSheetXPRPG<ContainerXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<PhysicalItemSheetData<ContainerXPRPG>> {
        return {
            ...(await super.getData(options)),
            hasSidebar: true,
            hasDetails: true,
        };
    }
}
