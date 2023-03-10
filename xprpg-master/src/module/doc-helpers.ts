import { ActorXPRPG } from "@actor";
import { ItemXPRPG } from "@item";
import { isObject } from "@util";
import { MigrationList, MigrationRunner } from "./migration";
import { MigrationRunnerBase } from "./migration/runner/base";

/** Ensure that the import JSON is actually importable and that the data is fully migrated */
async function preImportJSON<T extends ActorXPRPG | ItemXPRPG>(document: T, json: string): Promise<string | null> {
    const source: unknown = JSON.parse(json);
    if (!isObject<T["_source"] & { data?: unknown }>(source)) return null;
    if ("data" in source) {
        if ("items" in source) {
            ActorXPRPG.migrateData(source);
        } else {
            ItemXPRPG.migrateData(source);
        }
    }
    if (!isObject(source.system)) return null;

    const sourceSchemaVersion = Number(source.system?.schema?.version) || 0;
    const worldSchemaVersion = MigrationRunnerBase.LATEST_SCHEMA_VERSION;
    if (foundry.utils.isNewerVersion(sourceSchemaVersion, worldSchemaVersion)) {
        // Refuse to import if the schema version on the document is higher than the system schema verson;
        ui.notifications.error(
            game.i18n.format("XPRPG.ErrorMessage.CantImportTooHighVersion", {
                sourceName: game.i18n.localize("DOCUMENT.Actor"),
                sourceSchemaVersion,
                worldSchemaVersion,
            })
        );
        return null;
    }

    const newDoc = new (document.constructor as ConstructorOf<T>)(source, { parent: document.parent });
    const migrations = MigrationList.constructFromVersion(newDoc.schemaVersion);
    await MigrationRunner.ensureSchemaVersion(newDoc, migrations);

    return JSON.stringify(newDoc.toObject());
}

export { preImportJSON };
