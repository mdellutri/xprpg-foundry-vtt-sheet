import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";
import { sluggify } from "@util";

export class Migration669NPCAttackEffects extends MigrationBase {
    static override version = 0.669;

    override async updateItem(item: ItemSourceXPRPG, actor?: ActorSourceXPRPG): Promise<void> {
        if (!actor || item.type !== "melee") return;
        item.system.attackEffects ??= { value: [] };
        if (Array.isArray(item.system.attackEffects.value)) {
            item.system.attackEffects.value.forEach((entry, index, arr) => {
                arr[index] = sluggify(entry);
            });
        }
    }
}
