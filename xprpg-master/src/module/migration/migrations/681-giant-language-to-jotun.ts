import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Replace the "Giant" language with "Jotun" */
export class Migration681GiantLanguageToJotun extends MigrationBase {
    static override version = 0.681;

    private replaceGiant({ value }: { value: string[] }): void {
        const giantIndex = value.indexOf("giant");
        if (giantIndex !== -1) value.splice(giantIndex, 1, "jotun");
    }

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        if (!(actorSource.type === "character" || actorSource.type === "npc")) return;
        this.replaceGiant(actorSource.system.traits.languages);
    }

    override async updateItem(itemSource: ItemSourceXPRPG): Promise<void> {
        if (itemSource.type !== "ancestry") return;
        this.replaceGiant(itemSource.system.additionalLanguages);
    }
}
