import { ActorSourceXPRPG } from "@actor/data";
import { SAVE_TYPES } from "@actor/values";
import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Remove the extra `base` subproperty of labeled values on NPCs */
export class Migration672RemoveNPCBaseProperties extends MigrationBase {
    static override version = 0.672;

    private removeBase(property: PropertyWithBase, replace: "value" | "max" = "value"): void {
        property[replace] = Number(property[replace]) || 0;
        if (typeof property.base === "number") {
            property[replace] = property.base;
            "game" in globalThis ? (property["-=base?"] = null) : delete property.base;
        }
    }

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        if (actorSource.type !== "npc") return;

        const { ac, hp, perception } = actorSource.system.attributes;
        this.removeBase(ac);
        this.removeBase(hp, "max");
        this.removeBase(perception);

        const { saves } = actorSource.system;
        for (const saveType of SAVE_TYPES) {
            this.removeBase(saves[saveType]);
        }
    }

    override async updateItem(itemSource: ItemSourceXPRPG, actorSource?: ActorSourceXPRPG): Promise<void> {
        if (!(actorSource?.type === "npc" && itemSource.type === "lore")) return;
        this.removeBase(itemSource.system.mod);
    }
}

interface PropertyWithBase {
    value: number;
    max?: number;
    base?: number;
    "-=base?"?: null;
}
