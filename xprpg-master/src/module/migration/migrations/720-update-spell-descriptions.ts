import { MigrationBase } from "../base";
import { ItemSourceXPRPG } from "@item/data";
import { SpellXPRPG } from "@item";
import { UUIDUtils } from "@util/uuid-utils";
import { setHasElement } from "@util";

/** Update the descriptions of several spells with new effect items */
export class Migration720UpdateSpellDescriptions extends MigrationBase {
    static override version = 0.72;

    private spellUUIDs: Set<CompendiumUUID> = new Set([
        "Compendium.xprpg.spells-srd.GoKkejPj5yWJPIPK", // Adaptive Ablation
        "Compendium.xprpg.spells-srd.1b55SgYTV65JvmQd", // Blessing of Defiance
        "Compendium.xprpg.spells-srd.b515AZlB0sridKSq", // Calm Emotions
        "Compendium.xprpg.spells-srd.NBSBFHxBm88qxQUy", // Chromatic Armor
        "Compendium.xprpg.spells-srd.9TauMFkIsmvKJNzZ", // Elemental Absorption
        "Compendium.xprpg.spells-srd.LoBjvguamA12iyW0", // Energy Absorption
        "Compendium.xprpg.spells-srd.IWUe32Y5k2QFd7YQ", // Gravity Weapon
        "Compendium.xprpg.spells-srd.WBmvzNDfpwka3qT4", // Light
    ]);

    private spells = UUIDUtils.fromUUIDs([...this.spellUUIDs]);

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (!(source.type === "spell" && setHasElement(this.spellUUIDs, source.flags.core?.sourceId))) {
            return;
        }

        const spells: unknown[] = await this.spells;
        const spell = spells.find((s): s is SpellXPRPG => s instanceof SpellXPRPG && s.slug === source.system.slug);

        if (spell) source.system.description.value = spell.description;
    }
}
