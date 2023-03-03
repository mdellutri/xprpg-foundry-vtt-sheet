import { MigrationBase } from "../base";
import { ActorSourceXPRPG } from "@actor/data";

export class Migration612NormalizeRarities extends MigrationBase {
    static override version = 0.612;

    override async updateActor(actorData: ActorSourceXPRPG) {
        const traitsRaw = actorData.system.traits;
        if (actorData.type === "familiar" || !traitsRaw) return;

        const traitsAndOtherMiscellany: { rarity?: unknown; traits?: { value: string[] } } = traitsRaw;
        if (!("rarity" in traitsAndOtherMiscellany)) {
            traitsAndOtherMiscellany.rarity = { value: "common" };
        }

        // Remove rarities from standard traits list
        const rarities = ["common", "uncommon", "rare", "unique"] as const;
        for (const rarity of rarities) {
            const { traits } = traitsAndOtherMiscellany;
            if (traits?.value.includes(rarity)) {
                const index = traits.value.indexOf(rarity);
                traits.value.splice(index, 1);
                traitsAndOtherMiscellany.rarity = { value: rarity };
            }
        }
    }
}
