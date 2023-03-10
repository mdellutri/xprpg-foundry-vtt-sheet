import type { ActorXPRPG } from "@actor";
import { ItemXPRPG } from "@item";
import { FakeActor } from "./fake-actor";
import { FakeItem } from "./fake-item";

/** In Foundry this is actually a subclass of Map, but it incompatibly extends it at several points. */
export class FakeCollection<V> {
    #map: Map<string, V>;

    constructor(entries: [string, V][] = []) {
        this.#map = new Map(entries);
    }

    [Symbol.iterator](): IterableIterator<V> {
        return this.#map.values();
    }

    get size(): number {
        return this.#map.size;
    }

    get contents(): V[] {
        return Array.from(this.#map.values());
    }

    get(key: string): V | null {
        return this.#map.get(key) ?? null;
    }

    set(key: string, value: V): FakeCollection<V> {
        this.#map.set(key, value);
        return this;
    }

    has(key: string): boolean {
        return this.#map.has(key);
    }

    find(predicate: (value: V) => boolean): V | undefined {
        return Array.from(this.#map.values()).find(predicate);
    }

    some(predicate: (value: V) => boolean): boolean {
        return Array.from(this.#map.values()).some(predicate);
    }

    filter(predicate: (value: V) => boolean): V[] {
        return Array.from(this.#map.values()).filter(predicate);
    }

    delete(key: string): boolean {
        return this.#map.delete(key);
    }

    clear(): void {
        this.#map.clear();
    }
}

export class FakeWorldCollection<V extends { data: object }> extends FakeCollection<V> {}

export class FakeActors extends FakeWorldCollection<ActorXPRPG> {
    tokens: Record<string, ActorXPRPG | undefined> = {};

    documentClass = FakeActor as unknown as typeof ActorXPRPG;

    constructor(entries: [string, ActorXPRPG][] = []) {
        super(entries);
    }
}

export class FakeItems extends FakeWorldCollection<ActorXPRPG> {
    tokens: Record<string, ActorXPRPG | undefined> = {};

    documentClass = FakeItem as unknown as typeof ItemXPRPG;

    constructor(entries: [string, ActorXPRPG][] = []) {
        super(entries);
    }
}
