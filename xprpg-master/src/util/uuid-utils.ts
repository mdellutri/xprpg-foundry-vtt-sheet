import { ActorXPRPG } from "@actor";
import { ItemXPRPG } from "@item";
import { ErrorXPRPG } from "./misc";

class UUIDUtils {
    /** A replacement for core fromUuid that returns cached compendium documents. Remove in v11. */
    static async fromUuid<T extends ClientDocument = ClientDocument>(
        uuid: string,
        relative?: ClientDocument
    ): Promise<T | null> {
        const { doc, embedded } = this.#parseUuid(uuid, relative);
        if (doc) {
            if (embedded.length) {
                return (_resolveEmbedded(doc, embedded) as T) ?? null;
            }
            return doc as T;
        }
        return fromUuid<T>(uuid, relative);
    }

    /** A replacement for core fromUuidSync that returns cached compendium documents. Remove in v11. */
    static fromUuidSync(uuid: string, relative?: ClientDocument): ClientDocument | CompendiumIndexData | null {
        const { doc, embedded } = this.#parseUuid(uuid, relative);
        if (doc) {
            if (embedded.length) {
                return _resolveEmbedded(doc, embedded) ?? null;
            }
            return doc;
        }
        return fromUuidSync(uuid, relative);
    }

    /** Retrieve multiple documents by UUID */
    static async fromUUIDs(uuids: Exclude<ActorUUID | TokenDocumentUUID, CompendiumUUID>[]): Promise<ActorXPRPG[]>;
    static async fromUUIDs(uuids: Exclude<ItemUUID, CompendiumUUID>[]): Promise<ItemXPRPG[]>;
    static async fromUUIDs(uuids: string[]): Promise<ClientDocument[]>;
    static async fromUUIDs(uuids: string[]): Promise<ClientDocument[]> {
        const actors: ActorXPRPG[] = [];
        const items: ItemXPRPG[] = [];

        const documents = uuids.map((u): [string, ReturnType<typeof fromUuidSync>] => [u, this.fromUuidSync(u)]);
        for (const [uuid, doc] of documents) {
            if (doc instanceof ActorXPRPG) {
                actors.push(doc);
            } else if (doc instanceof ItemXPRPG) {
                items.push(doc);
            } else {
                // Cache miss: retrieve from server
                const document = await fromUuid(uuid);
                if (document instanceof ActorXPRPG) {
                    actors.push(document);
                } else if (document instanceof ItemXPRPG) {
                    items.push(document);
                }
            }
        }

        return actors.length > 0 ? actors : items;
    }

    static #parseUuid(uuid: string, relative?: ClientDocument): ResolvedUUID {
        const resolved = _parseUuid(uuid, relative);
        if (resolved.collection) {
            resolved.doc = resolved.collection.get(resolved.documentId) ?? null;
        }
        return resolved;
    }

    static isItemUUID(uuid: unknown): uuid is ItemUUID {
        if (typeof uuid !== "string") return false;
        if (uuid.startsWith("Item.")) return true;

        const [type, scope, packId, id]: (string | undefined)[] = uuid.split(".");
        if (type !== "Compendium") return false;
        if (!(scope && packId && id)) throw ErrorXPRPG(`Unable to parse UUID: ${uuid}`);

        const pack = game.packs.get(`${scope}.${packId}`);
        return pack?.documentName === "Item";
    }

    static isTokenUUID(uuid: unknown): uuid is TokenDocumentUUID {
        return typeof uuid === "string" && /^Scene\.[A-Za-z0-9]{16}\.Token\.[A-Za-z0-9]{16}$/.test(uuid);
    }
}

export { UUIDUtils };
