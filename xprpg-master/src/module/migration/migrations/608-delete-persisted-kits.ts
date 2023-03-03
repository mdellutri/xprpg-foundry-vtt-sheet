import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";
import { ActorSourceXPRPG } from "@actor/data";

/** Unbreak actor sheets that have kit items in their inventories */
export class Migration608DeletePersistedKits extends MigrationBase {
    static override version = 0.608;

    override async updateItem(itemData: ItemSourceXPRPG, actorData?: ActorSourceXPRPG) {
        if (actorData && itemData.type === "kit") {
            const index = actorData.items.indexOf(itemData);
            actorData.items.splice(index, 1);
        }
    }
}
