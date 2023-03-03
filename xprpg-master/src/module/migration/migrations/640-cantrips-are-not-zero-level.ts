import { ItemSourceXPRPG } from "@item/data";
import { ZeroToTen } from "@module/data";
import { MigrationBase } from "../base";

type LevelOld = { value?: ZeroToTen };

/** Increase level of 0th-level Cantrips to 1 */
export class Migration640CantripsAreNotZeroLevel extends MigrationBase {
    static override version = 0.64;
    override async updateItem(itemData: ItemSourceXPRPG): Promise<void> {
        if (itemData.type !== "spell") return;

        const level: LevelOld = itemData.system.level;
        if (level.value === 0) {
            level.value = 1;
            if (!itemData.system.traits.value.includes("cantrip")) {
                itemData.system.traits.value.push("cantrip");
            }
        }
    }
}
