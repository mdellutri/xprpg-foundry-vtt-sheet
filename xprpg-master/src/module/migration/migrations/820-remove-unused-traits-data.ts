import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Removed unused traits data structures from items that don't use them */
export class Migration820RemoveUnusedTraitsData extends MigrationBase {
    static override version = 0.82;

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        source.system.traits;
        const systemSource: MaybeWithTraits = source.system;

        if (!systemSource.traits) return;

        if ("custom" in systemSource.traits) {
            delete systemSource.traits.custom;
            systemSource.traits["-=custom"] = null;
        }

        if (source.type === "spellcastingEntry" || source.type === "condition") {
            delete systemSource.traits;
            systemSource["-=traits"] = null;
        }
    }
}

interface MaybeWithTraits {
    traits?: { custom?: "string"; "-=custom"?: null; value?: string[] };
    "-=traits"?: null;
}
