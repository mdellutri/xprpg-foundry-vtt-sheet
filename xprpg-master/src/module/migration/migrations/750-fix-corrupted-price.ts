import { ItemSourceXPRPG } from "@item/data";
import { isPhysicalData } from "@item/data/helpers";
import { CoinsXPRPG } from "@item/physical/helpers";
import { MigrationBase } from "../base";

export class Migration750FixCorruptedPrice extends MigrationBase {
    static override version = 0.75;

    override async updateItem(item: ItemSourceXPRPG) {
        if (!isPhysicalData(item) && item.type !== "kit") return;

        if (typeof item.system.price === "string") {
            item.system.price = { value: CoinsXPRPG.fromString(item.system.price).strip() };
        }
    }
}
