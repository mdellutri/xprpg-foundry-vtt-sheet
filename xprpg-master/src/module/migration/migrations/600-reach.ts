import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";

export class Migration600Reach extends MigrationBase {
    static override version = 0.6;

    override async updateItem(item: ItemSourceXPRPG) {
        if (item.type === "ancestry") {
            item.system.reach = 5;
        }
    }
}
