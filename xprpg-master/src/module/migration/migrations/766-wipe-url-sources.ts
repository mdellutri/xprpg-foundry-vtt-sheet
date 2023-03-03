import { ItemSourceXPRPG } from "@item/data";
import { isObject } from "@util";
import { MigrationBase } from "../base";

/** Wipe URL sources (typically Archives of Nethys) */
export class Migration766WipeURLSources extends MigrationBase {
    static override version = 0.766;

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (
            (!("game" in globalThis) || source.flags.core?.sourceId?.startsWith("Compendium.xprpg.")) &&
            isObject<{ value: unknown }>(source.system.source) &&
            typeof source.system.source.value === "string" &&
            source.system.source.value.startsWith("http")
        ) {
            source.system.source.value = "";
        }
    }
}
