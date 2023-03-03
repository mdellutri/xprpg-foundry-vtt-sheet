import { ItemSourceXPRPG } from "@item/data";
import { RuleElementSource } from "@module/rules";
import { MigrationBase } from "../base";

/** Fix featType properties erroneously set to a non-existent "dedication" type */
export class Migration733ItemBonusFromEquipment extends MigrationBase {
    static override version = 0.733;

    slugs = new Set(["animal-skin", "stance-mountain-stance", "spell-effect-mage-armor"]);

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        const compendiumItem = this.slugs.has(source.system.slug ?? "");
        const homebrewItem = !compendiumItem && source.type === "feat";
        if (!(compendiumItem || homebrewItem)) return;

        const rules: (RuleElementSource & { type?: string; fromEquipment?: boolean })[] = source.system.rules;
        for (const rule of rules) {
            if (rule.key === "FlatModifier" && rule.type === "item") {
                rule.fromEquipment = false;
            }
        }
    }
}
