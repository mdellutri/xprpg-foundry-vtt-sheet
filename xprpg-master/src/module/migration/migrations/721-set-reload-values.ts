import { MigrationBase } from "../base";
import { setHasElement } from "@util";
import { ItemSourceXPRPG } from "@item/data";

/** Set a reload of value of 0 to several weapons that had no reload */
export class Migration721SetReloadValues extends MigrationBase {
    static override version = 0.721;

    private toUpdate = new Set([
        "air-repeater",
        "composite-longbow",
        "composite-shortbow",
        "godsbreath-bow",
        "hunters-bow",
        "long-air-repeater",
        "longbow",
        "oathbow",
        "repeating-crossbow",
        "repeating-hand-crossbow",
        "shortbow",
        "singing-shortbow-greater",
        "singing-shortbow",
        "sky-piercing-bow",
    ]);

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (!(source.type === "weapon" && setHasElement(this.toUpdate, source.system.slug))) {
            return;
        }

        source.system.reload.value = "0";
    }
}
