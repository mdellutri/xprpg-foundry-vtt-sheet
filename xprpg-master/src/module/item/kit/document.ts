import { ContainerXPRPG, ItemXPRPG, PhysicalItemXPRPG } from "@item/index";
import { Price } from "@item/physical/data";
import { CoinsXPRPG } from "@item/physical/helpers";
import { DENOMINATIONS } from "@item/physical/values";
import { UserXPRPG } from "@module/user";
import { ErrorXPRPG, isObject } from "@util";
import { UUIDUtils } from "@util/uuid-utils";
import { KitData, KitEntryData } from "./data";

class KitXPRPG extends ItemXPRPG {
    get entries(): KitEntryData[] {
        return Object.values(this.system.items);
    }

    get price(): Price {
        return {
            value: new CoinsXPRPG(this.system.price.value),
            per: this.system.price.per ?? 1,
        };
    }

    /** Expand a tree of kit entry data into a list of physical items */
    override async createGrantedItems(
        options: { entries?: KitEntryData[]; containerId?: string } = {}
    ): Promise<PhysicalItemXPRPG[]> {
        const entries = options.entries ?? this.entries;
        const itemUUIDs = entries.map((e): ItemUUID => e.uuid);
        const items: unknown[] = await UUIDUtils.fromUUIDs(itemUUIDs);
        if (entries.length !== items.length) throw ErrorXPRPG(`Some items from ${this.name} were not found`);
        if (!items.every((i): i is ItemXPRPG => i instanceof ItemXPRPG)) return [];

        return items.reduce(async (promise: PhysicalItemXPRPG[] | Promise<PhysicalItemXPRPG[]>, item, index) => {
            const prepared = await promise;
            const clone = item.clone({ _id: randomID() }, { keepId: true });
            const entry = entries[index];
            if (clone instanceof PhysicalItemXPRPG) {
                clone.updateSource({
                    "system.quantity": entry.quantity,
                    "system.containerId": options.containerId,
                });
            }

            if (clone instanceof ContainerXPRPG && entry.items) {
                const contents = await this.createGrantedItems({
                    entries: Object.values(entry.items),
                    containerId: clone.id,
                });
                prepared.push(clone, ...contents);
            } else if (clone instanceof KitXPRPG) {
                const inflatedKit = await clone.createGrantedItems({ containerId: options.containerId });
                prepared.push(...inflatedKit);
            } else if (clone instanceof PhysicalItemXPRPG) {
                prepared.push(clone);
            }

            return prepared;
        }, []);
    }

    protected override async _preUpdate(
        changed: DeepPartial<this["_source"]>,
        options: DocumentModificationContext<this>,
        user: UserXPRPG
    ): Promise<void> {
        if (!changed.system) return await super._preUpdate(changed, options, user);

        // Clear 0 price denominations
        if (isObject<Record<string, unknown>>(changed.system?.price)) {
            const price: Record<string, unknown> = changed.system.price;
            for (const denomination of DENOMINATIONS) {
                if (price[denomination] === 0) {
                    price[`-=denomination`] = null;
                }
            }
        }

        await super._preUpdate(changed, options, user);
    }
}

interface KitXPRPG extends ItemXPRPG {
    readonly data: KitData;
}

export { KitXPRPG };
