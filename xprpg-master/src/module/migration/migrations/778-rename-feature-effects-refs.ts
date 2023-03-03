import { ItemSourceXPRPG } from "@item/data";
import { recursiveReplaceString } from "@util";
import { MigrationBase } from "../base";

/** Rename references to retired compendiums */
export class Migration778RenameRetiredPackRefs extends MigrationBase {
    static override version = 0.778;

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        const rename = (text: string) =>
            text
                .replace(/\bxprpg\.consumable-effects\b/g, "xprpg.equipment-effects")
                .replace(/\bxprpg\.exploration-effects\b/g, "xprpg.other-effects")
                .replace(/\bxprpg\.feature-effects\b/g, "xprpg.feat-effects")
                .replace(/\bxprpg\.equipment-effects\.I9lfZUiCwMiGogVi\b/g, "xprpg.other-effects.I9lfZUiCwMiGogVi")
                // Cover in dev environment:
                .replace(/\bxprpg\.equipment-effects\.Cover\b/g, "xprpg.other-effects.Effect: Cover");

        source.system.rules = recursiveReplaceString(source.system.rules, rename);
        source.system.description = recursiveReplaceString(source.system.description, rename);
    }
}
