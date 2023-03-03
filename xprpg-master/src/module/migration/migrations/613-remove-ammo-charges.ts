import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";

/** Remove charges from ammunition to ensure ammo consumption works properly. */
export class Migration613RemoveAmmoCharges extends MigrationBase {
    static override version = 0.613;

    override async updateItem(itemData: ItemSourceXPRPG) {
        if (itemData.type === "consumable" && itemData.system.consumableType.value === "ammo") {
            itemData.system.charges.value = 0;
            itemData.system.charges.max = 0;
        }
    }
}
