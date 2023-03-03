import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";

/** Numify melee bonus.value property */
export class Migration614NumifyMeleeBonuses extends MigrationBase {
    static override version = 0.614;

    override async updateItem(itemData: ItemSourceXPRPG) {
        if (itemData.type === "melee") {
            itemData.system.bonus = { value: Number(itemData.system.bonus.value) };
        }
    }
}
