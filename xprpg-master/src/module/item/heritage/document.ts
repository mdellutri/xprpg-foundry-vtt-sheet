import { CharacterXPRPG } from "@actor";
import { CreatureTrait } from "@actor/creature";
import { ItemXPRPG } from "@item";
import { Rarity } from "@module/data";
import { sluggify } from "@util";
import { HeritageData } from "./data";

class HeritageXPRPG extends ItemXPRPG {
    get traits(): Set<CreatureTrait> {
        return new Set(this.system.traits.value);
    }

    get rarity(): Rarity {
        return this.system.traits.rarity;
    }

    /** Prepare a character's data derived from their heritage */
    override prepareActorData(this: Embedded<HeritageXPRPG>): void {
        // Some abilities allow for a second heritage. If the PC has more than one, set this heritage as the actor's
        // main one only if it wasn't granted by another item.
        if (this.actor.itemTypes.heritage.length === 1 || !this.grantedBy) {
            this.actor.heritage = this;
        }

        // Add and remove traits as specified
        this.actor.system.traits.value.push(...this.traits);

        const slug = this.slug ?? sluggify(this.name);
        this.actor.system.details.heritage = {
            name: this.name,
            trait: slug in CONFIG.XPRPG.ancestryTraits ? slug : null,
        };

        // Add a roll option for this heritage
        this.actor.rollOptions.all[`heritage:${slug}`] = true;
        // Backward compatibility until migration
        this.actor.rollOptions.all[`self:heritage:${slug}`] = true;
    }

    override getRollOptions(prefix = this.type): string[] {
        const ancestryOrVersatile = this.system.ancestry ? `ancestry:${this.system.ancestry.slug}` : "versatile";

        return [...super.getRollOptions(prefix), `${prefix}:${ancestryOrVersatile}`];
    }
}

interface HeritageXPRPG extends ItemXPRPG {
    readonly parent: CharacterXPRPG | null;

    readonly data: HeritageData;
}

export { HeritageXPRPG };
