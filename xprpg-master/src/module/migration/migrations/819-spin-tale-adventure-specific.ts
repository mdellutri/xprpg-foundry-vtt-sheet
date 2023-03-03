import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Replace links to adventure-specific Spin Tale */
export class Migration819SpinTaleAdventureSpecific extends MigrationBase {
    static override version = 0.819;

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (source.type === "feat") {
            const oldSpinTale = "Compendium.xprpg.adventure-specific-actions.Spin Tale";
            const newSpinTale = "Compendium.xprpg.actionsxprpg.Spin Tale";

            const oldSpinTaleId = "Compendium.xprpg.adventure-specific-actions.5gahZQXf3UVwATSC";
            const newSpinTaleId = "Compendium.xprpg.actionsxprpg.hPZQ5vA9QHEPtjFW";

            source.system.description.value = source.system.description.value.replace(oldSpinTale, newSpinTale);
            source.system.description.value = source.system.description.value.replace(oldSpinTaleId, newSpinTaleId);
        }
    }
}
