import { CreatureConfig, CreatureConfigData } from "@actor/creature/config";
import { createSheetOptions, SheetOptions } from "@module/sheet/helpers";
import { NPCXPRPG } from ".";

export class NPCConfig extends CreatureConfig<NPCXPRPG> {
    override async getData(options: Partial<DocumentSheetOptions> = {}): Promise<NPCConfigData> {
        const lootableDefault = game.settings.get("xprpg", "automation.lootableNPCs");
        const lootableOptions = {
            default: `XPRPG.Actor.NPC.Configure.Lootable.${lootableDefault ? "DefaultLootable" : "DefaultNotLootable"}`,
            lootable: "XPRPG.Actor.NPC.Configure.Lootable.Lootable",
            notLootable: "XPRPG.Actor.NPC.Configure.Lootable.NotLootable",
        };
        const lootableSelection = (() => {
            const storedSelection = this.actor._source.flags.xprpg?.lootable;
            return typeof storedSelection === "boolean" ? (storedSelection ? "lootable" : "notLootable") : "default";
        })();

        return {
            ...(await super.getData(options)),
            lootable: createSheetOptions(lootableOptions, { value: [lootableSelection] }),
        };
    }

    /** Remove stored properties if they're consistent with defaults; otherwise, store changes */
    override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
        const key = "flags.xprpg.lootable";
        const lootable = formData[key];

        if (lootable === "default") {
            delete formData[key];
            formData["flags.xprpg.-=lootable"] = null;
        } else {
            formData[key] = lootable === "lootable";
        }

        return super._updateObject(event, formData);
    }
}

interface NPCConfigData extends CreatureConfigData<NPCXPRPG> {
    lootable: SheetOptions;
}
