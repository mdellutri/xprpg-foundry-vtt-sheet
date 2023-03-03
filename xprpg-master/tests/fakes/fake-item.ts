import type { ActorXPRPG } from "@actor";
import type { ItemXPRPG } from "@item";
import { ItemSourceXPRPG } from "@item/data";

export class FakeItem {
    _data: ItemSourceXPRPG;

    parent: ActorXPRPG | null = null;

    constructor(data: ItemSourceXPRPG, public options: DocumentConstructionContext<ActorXPRPG | null> = {}) {
        this._data = duplicate(data);
        this.parent = options.parent ?? null;
    }

    get id(): string {
        return this.data._id;
    }

    get data() {
        return this._data;
    }

    get name() {
        return this._data.name;
    }

    get system() {
        return this._data.system;
    }

    get level(): number | null {
        return "level" in this.system! ? this.system.level.value : null;
    }

    get traits(): Set<string> {
        return new Set(this.system.traits?.value ?? []);
    }

    get isMagical(): boolean {
        return ["magical", "arcane", "primal", "divine", "occult"].some((trait) => this.traits.has(trait));
    }

    get isAlchemical(): boolean {
        return this.traits.has("alchemical");
    }

    static async updateDocuments(
        updates: DocumentUpdateData<ItemXPRPG>[] = [],
        _context: DocumentModificationContext = {}
    ): Promise<ItemXPRPG[]> {
        return updates.flatMap((update) => {
            const item = game.items.find((item) => item.id === update._id);
            if (item) mergeObject(item.data, update);
            return item ?? [];
        });
    }

    update(changes: object) {
        for (const [k, v] of Object.entries(changes)) {
            global.setProperty(this._data, k, v);
        }
    }

    toObject(source = true) {
        return source ? duplicate(this._data) : duplicate(this.data);
    }
}
