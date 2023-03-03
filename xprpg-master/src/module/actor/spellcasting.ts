import { ActorXPRPG, CharacterXPRPG, NPCXPRPG } from "@actor";
import { ConsumableXPRPG, SpellcastingEntryXPRPG } from "@item";
import { SpellcastingEntrySource, SpellCollection } from "@item/spellcasting-entry";
import { ErrorXPRPG } from "@util";

export class ActorSpellcasting extends Collection<SpellcastingEntryXPRPG> {
    /** All available spell lists on this actor */
    collections = new Collection<SpellCollection>();

    constructor(public readonly actor: ActorXPRPG, entries?: SpellcastingEntryXPRPG[]) {
        super(entries?.map((entry) => [entry.id, entry]));
    }

    /** Returns a list of entries pre-filtered to SpellcastingEntryXPRPG */
    get regular(): SpellcastingEntryXPRPG[] {
        return this.filter((entry): entry is SpellcastingEntryXPRPG => entry instanceof SpellcastingEntryXPRPG);
    }

    /**
     * All spellcasting entries that count as prepared/spontaneous, which qualify as a
     * full fledged spellcasting feature for wands and scrolls.
     */
    get spellcastingFeatures(): SpellcastingEntryXPRPG[] {
        return this.regular.filter((entry) => entry.isPrepared || entry.isSpontaneous);
    }

    canCastConsumable(item: ConsumableXPRPG): boolean {
        const spell = item.embeddedSpell;
        return !!spell && this.some((entry) => entry.canCastSpell(spell, { origin: item }));
    }

    refocus(options: { all?: boolean } = {}): { "system.resources.focus.value": number } | null {
        if (!options.all) {
            throw ErrorXPRPG("Actors do not currently support regular refocusing");
        }

        if (this.actor instanceof NPCXPRPG || this.actor instanceof CharacterXPRPG) {
            const focus = this.actor.system.resources.focus;

            const rechargeFocus = focus?.max && focus.value < focus.max;
            if (focus && rechargeFocus) {
                focus.value = focus.max;
                return { "system.resources.focus.value": focus.value };
            }
        }

        return null;
    }

    /**
     * Recharges all spellcasting entries based on the type of entry it is
     * @todo Support a timespan property of some sort and handle 1/hour innate spells
     */
    recharge(): {
        itemUpdates: ((Record<string, unknown> | Partial<SpellcastingEntrySource>) & { _id: string })[];
        actorUpdates: { "system.resources.focus.value": number } | null;
    } {
        type SpellcastingUpdate =
            | EmbeddedDocumentUpdateData<SpellcastingEntryXPRPG>
            | EmbeddedDocumentUpdateData<SpellcastingEntryXPRPG>[];

        const itemUpdates = this.contents.flatMap((entry): SpellcastingUpdate => {
            if (!(entry instanceof SpellcastingEntryXPRPG)) return [];
            if (entry.isFocusPool || !entry.spells) return [];

            // Innate spells should refresh uses instead
            if (entry.isInnate) {
                return entry.spells.map((spell) => {
                    const value = spell.system.location.uses?.max ?? 1;
                    return { _id: spell.id, "system.location.uses.value": value };
                });
            }

            // Spontaneous, and Prepared spells
            const slots = entry.system.slots;
            let updated = false;
            for (const slot of Object.values(slots)) {
                if (entry.isPrepared && !entry.isFlexible) {
                    for (const preparedSpell of Object.values(slot.prepared)) {
                        if (preparedSpell.expended) {
                            preparedSpell.expended = false;
                            updated = true;
                        }
                    }
                } else if (slot.value < slot.max) {
                    slot.value = slot.max;
                    updated = true;
                }
            }

            if (updated) {
                return { _id: entry.id, "system.slots": slots };
            }

            return [];
        });

        const actorUpdates = this.refocus({ all: true });
        return { itemUpdates, actorUpdates };
    }
}
