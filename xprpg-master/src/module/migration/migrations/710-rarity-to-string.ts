import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

export class Migration710RarityToString extends MigrationBase {
    static override version = 0.71;

    private updateTraits(traits: { rarity?: string | { value: string } } | null): void {
        if (typeof traits?.rarity === "object" && traits.rarity !== null) {
            traits.rarity = traits.rarity.value;
        }
    }

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        if ("traits" in actorSource.system) this.updateTraits(actorSource.system.traits ?? null);
    }

    override async updateItem(itemSource: ItemSourceXPRPG): Promise<void> {
        if ("traits" in itemSource.system) this.updateTraits(itemSource.system.traits ?? null);
    }
}
