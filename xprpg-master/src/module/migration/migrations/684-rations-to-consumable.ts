import { ActorSourceXPRPG } from "@actor/data";
import { ConsumableXPRPG } from "@item";
import { EquipmentSource, ItemSourceXPRPG } from "@item/data";
import { KitEntryData } from "@item/kit/data";
import { ErrorXPRPG, isObject } from "@util";
import { MigrationBase } from "../base";

/** Convert rations to a consumable with seven uses */
export class Migration684RationsToConsumable extends MigrationBase {
    static override version = 0.684;

    #rationsSourceId = "Compendium.xprpg.equipment-srd.L9ZV076913otGtiB";

    #rationsPromise = fromUuid(this.#rationsSourceId);

    #isOldRations(itemSource: ItemSourceXPRPG | null): itemSource is EquipmentSource {
        return itemSource?.type === "equipment" && itemSource.flags.core?.sourceId === this.#rationsSourceId;
    }

    /** Get all references to the Rations item in a kit */
    #getRationRefs(itemRefs: KitEntryWithPackAndID[]): RationEntryData[] {
        return itemRefs.reduce((rationRefs: RationEntryData[], itemRef) => {
            if (itemRef.isContainer && itemRef.items) {
                rationRefs.push(...this.#getRationRefs(Object.values(itemRef.items)));
            } else if (itemRef.pack === "xprpg.equipment-srd" && itemRef.id === "L9ZV076913otGtiB") {
                rationRefs.push(itemRef as RationEntryData);
            }
            return rationRefs;
        }, []);
    }

    /** Swap "equipment" rations for new consumable */
    override async updateActor(source: ActorSourceXPRPG): Promise<void> {
        const oldRations = source.items.filter((i): i is EquipmentSource => this.#isOldRations(i));
        const rations = await this.#rationsPromise;
        if (!(rations instanceof ConsumableXPRPG)) {
            throw ErrorXPRPG("Unexpected error acquiring compendium item");
        }

        for (const oldRation of oldRations) {
            const newRation = rations.toObject();
            newRation.folder = oldRation.folder;
            newRation.sort = oldRation.sort;

            const oldContainerId = oldRation.system.containerId ?? { value: null };
            if (oldContainerId instanceof Object) {
                newRation.system.containerId = oldContainerId.value;
            }

            const oldQuantity: number | { value: number } = oldRation.system.quantity;
            if (isObject<{ value: number }>(oldQuantity)) {
                newRation.system.quantity = Math.ceil((oldQuantity.value ?? 1) / 7);
            }
            source.items.findSplice((item) => item === oldRation, newRation);
        }
    }

    /** Lower the quantity of rations contained in kits */
    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (source.type !== "kit") return;

        const rationRefs = this.#getRationRefs(Object.values(source.system.items));
        for (const rationRef of rationRefs) {
            rationRef.quantity = Math.ceil(rationRef.quantity / 7);
        }
    }
}

interface KitEntryWithPackAndID extends KitEntryData {
    pack?: string;
    id?: string;
    items?: Record<string, KitEntryWithPackAndID>;
}

interface RationEntryData extends KitEntryWithPackAndID {
    id: "L9ZV076913otGtiB";
    pack: "xprpg.equipment-srd";
}
