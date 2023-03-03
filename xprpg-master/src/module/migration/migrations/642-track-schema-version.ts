import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Start recording the schema version and other details of a migration */
export class Migration642TrackSchemaVersion extends MigrationBase {
    static override version = 0.642;

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        actorSource.system.schema ??= {
            version: null,
            lastMigration: null,
        };
    }

    override async updateItem(itemSource: ItemSourceXPRPG): Promise<void> {
        itemSource.system.schema ??= {
            version: null,
            lastMigration: null,
        };
    }
}
