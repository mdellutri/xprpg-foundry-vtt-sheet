import { ItemSourceXPRPG } from "@item/data";
import { recursiveReplaceString } from "@util";
import { MigrationBase } from "../base";

/** Rename any predicate statement of "rage" or "panache" to a statement that the effect is present  */
export class Migration800SelfEffectPanacheRage extends MigrationBase {
    static override version = 0.8;

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {

        for (const rule of source.system.rules) {
            if (rule.predicate && Array.isArray(rule.predicate)) {
                rule.predicate = recursiveReplaceString(rule.predicate, (s) =>
                    s.replace(/^(rage|panache)$/, "self:effect:$1")
                );
            }
        }
    }
}
