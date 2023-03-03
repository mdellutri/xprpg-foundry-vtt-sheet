import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";

export class Migration623NumifyPotencyRunes extends MigrationBase {
    static override version = 0.623;

    override async updateItem(itemData: ItemSourceXPRPG): Promise<void> {
        if (!(itemData.type === "weapon" || itemData.type === "armor")) return;

        const potencyRune: { value: number | null } | undefined = itemData.system.potencyRune;
        if (potencyRune) {
            potencyRune.value = Number(itemData.system.potencyRune.value) || null;
        } else {
            itemData.system.potencyRune = { value: null };
        }
    }
}
