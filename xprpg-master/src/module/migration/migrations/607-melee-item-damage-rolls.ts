import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";
import { NPCAttackDamage } from "@item/melee/data";

/** Convert damageRolls arrays to objects. */
export class Migration607MeleeItemDamageRolls extends MigrationBase {
    static override version = 0.607;

    override async updateItem(itemData: ItemSourceXPRPG) {
        if (itemData.type === "melee") {
            if (Array.isArray(itemData.system.damageRolls)) {
                const damageRolls: Record<string, NPCAttackDamage> = {};
                itemData.system.damageRolls.forEach((roll) => {
                    const key = randomID(20);
                    damageRolls[key] = roll;
                });
                itemData.system.damageRolls = damageRolls;
            }
        }
    }
}
