import { ActorSourceXPRPG } from "@actor/data";
import { ItemXPRPG } from "@item";
import { ItemSourceXPRPG } from "@item/data";
import { ErrorXPRPG } from "@util";
import { MigrationBase } from "../base";

/** Normalize weapon range to numeric or null, remove ability property, and let's do category and group too! */
export class Migration692CraftingEntryFeatReplacement extends MigrationBase {
    static override version = 0.692;
    override requiresFlush = true;

    private slugToPromise = new Map<
        string,
        Promise<ClientDocument<foundry.abstract.Document> | ClientDocument2 | null>
    >([
        ["advanced-alchemy", fromUuid("Compendium.xprpg.classfeatures.Pe0zmIqyTBc2Td0I")],
        ["field-discovery-bomber", fromUuid("Compendium.xprpg.classfeatures.8QAFgy9U8PxEa7Dw")],
        ["field-discovery-chirurgeon", fromUuid("Compendium.xprpg.classfeatures.qC0Iz6SlG2i9gv6g")],
        ["field-discovery-mutagenist", fromUuid("Compendium.xprpg.classfeatures.V4Jt7eDnJBLv5bDj")],
        ["field-discovery-toxicologist", fromUuid("Compendium.xprpg.classfeatures.6zo2PJGYoig7nFpR")],
        ["infused-reagents", fromUuid("Compendium.xprpg.classfeatures.wySB9VHOW1v3TX1L")],
        ["alchemist-dedication", fromUuid("Compendium.xprpg.feats-srd.CJMkxlxHiHZQYDCz")],
        ["deeper-dabbler", fromUuid("Compendium.xprpg.feats-srd.PTXZ2C3AV8tZf0iX")],
        ["efficient-alchemy-paragon", fromUuid("Compendium.xprpg.feats-srd.2FBZ0apnmZ7b61ct")],
        ["expert-alchemy", fromUuid("Compendium.xprpg.feats-srd.soHLtpMM9h3AE7PD")],
        ["expert-fireworks-crafter", fromUuid("Compendium.xprpg.feats-srd.dDFQJem5K9Jzxgda")],
        ["expert-herbalism", fromUuid("Compendium.xprpg.feats-srd.owJorCBZmUi5lIV0")],
        ["expert-poisoner", fromUuid("Compendium.xprpg.feats-srd.VruIzuysxw4tY6rk")],
        ["firework-technician-dedication", fromUuid("Compendium.xprpg.feats-srd.MVbNnjqQOK9d8Ki3")],
        ["gadget-specialist", fromUuid("Compendium.xprpg.feats-srd.DQN7YC7s7T0pL6Aa")],
        ["herbalist-dedication", fromUuid("Compendium.xprpg.feats-srd.5CRt5Dy9eLv5LpRF")],
        ["master-alchemy", fromUuid("Compendium.xprpg.feats-srd.f6k9lIrIS4SfnCnG")],
        ["munitions-crafter", fromUuid("Compendium.xprpg.feats-srd.lFVqejlf52cdYrZy")],
        ["munitions-machinist", fromUuid("Compendium.xprpg.feats-srd.lh3STEvbGnP7jVMr")],
        ["plentiful-snares", fromUuid("Compendium.xprpg.feats-srd.wGaxWwJhIXbMJft1")],
        ["poisoner-dedication", fromUuid("Compendium.xprpg.feats-srd.y7DDs03GtDnmhxFp")],
        ["snare-genius", fromUuid("Compendium.xprpg.feats-srd.8DIzXO1YpsU3DpJw")],
        ["snare-specialist", fromUuid("Compendium.xprpg.feats-srd.0haS0qXR9xTYKoTG")],
        ["snarecrafter-dedication", fromUuid("Compendium.xprpg.feats-srd.4MUbwilvb9dI0X59")],
        ["talisman-dabbler-dedication", fromUuid("Compendium.xprpg.feats-srd.1t5479E6bdvFs4E7")],
        ["ubiquitous-gadgets", fromUuid("Compendium.xprpg.feats-srd.ny0nfGTDUE4p8TtO")],
        ["ubiquitous-snares", fromUuid("Compendium.xprpg.feats-srd.bX2WI5k0afqPpCfm")],
    ]);

    private replaceItem({ items, current, replacement }: ReplaceItemArgs): void {
        if (!(replacement instanceof ItemXPRPG)) throw ErrorXPRPG("Unexpected error retrieving compendium item");
        const newSource = replacement.toObject();
        if (current.type === "feat" && newSource.type === "feat") {
            newSource.system.location = current.system.location;
        }
        items.splice(items.indexOf(current), 1, newSource);
    }

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        if (actorSource.type === "character") {
            this.slugToPromise.forEach(async (promise, slug) => {
                const current = actorSource.items.find(
                    (itemSource) => itemSource.type === "feat" && itemSource.system.slug === slug
                );
                if (current)
                    this.replaceItem({
                        items: actorSource.items,
                        current: current,
                        replacement: await promise,
                    });
            });
        }
    }
}

interface ReplaceItemArgs {
    items: ItemSourceXPRPG[];
    current: ItemSourceXPRPG;
    replacement: ClientDocument | ClientDocument2 | null;
}
