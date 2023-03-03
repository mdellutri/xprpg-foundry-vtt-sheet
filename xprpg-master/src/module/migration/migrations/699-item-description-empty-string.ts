import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Fix item descriptions set to `null` by `TextEditor` */
export class Migration699ItemDescriptionEmptyString extends MigrationBase {
    static override version = 0.699;

    override async updateItem(itemSource: ItemSourceXPRPG): Promise<void> {
        itemSource.system.description.value ??= "";
    }
}
