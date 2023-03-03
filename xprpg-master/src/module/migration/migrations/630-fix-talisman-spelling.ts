import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";

/** Fix spelling of the "talisman" `consumableType` */
export class Migration630FixTalismanSpelling extends MigrationBase {
    static override version = 0.63;

    override async updateItem(itemData: ItemSourceXPRPG) {
        if (itemData.type === "consumable") {
            const consumableType: { value: string } = itemData.system.consumableType;
            if (consumableType.value === "talasman") {
                consumableType.value = "talisman";
            }
        }
    }
}
