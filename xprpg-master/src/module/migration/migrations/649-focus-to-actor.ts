import { MigrationBase } from "../base";
import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG, SpellcastingEntrySource } from "@item/data";
import { SpellcastingEntrySystemSource } from "@item/spellcasting-entry/data";
import { CharacterSource } from "@actor/character/data";
import { NPCSource } from "@actor/npc/data";
import { CreatureResourcesSource } from "@actor/creature";

interface SpellcastingEntrySystemDataOld extends Omit<SpellcastingEntrySystemSource, "focus"> {
    focus?: {
        points: number;
        pool: number;
    };
    "-=focus"?: null;
}

function isCreatureSource(source: ActorSourceXPRPG): source is CharacterSource | NPCSource {
    return ["character", "npc"].includes(source.type);
}

/** Focus Points became an actor resource. Relies on items running after actor */
export class Migration649FocusToActor extends MigrationBase {
    static override version = 0.649;

    override async updateActor(actorData: ActorSourceXPRPG): Promise<void> {
        if (!isCreatureSource(actorData)) return;
        const systemData: { resources: object } = actorData.system;
        if (!systemData.resources) systemData.resources = {};

        // Focus points in descending order by max pool, and then "most recent".
        // Javascript sort is stable, so we first sort by order, filter to focus, and then sort by max.
        const spellLists = actorData.items
            .filter((i): i is SpellcastingEntrySource => i.type === "spellcastingEntry")
            .sort((a, b) => (a.sort || 0) - (b.sort || 0))
            .map((i) => i.system as SpellcastingEntrySystemDataOld)
            .filter((i) => i.prepared.value === "focus" && i.focus)
            .sort((a, b) => (b.focus?.pool || 0) - (a.focus?.pool || 0));

        if (spellLists.length === 0) return;
        const focusOld = spellLists[0].focus;
        const resources: CreatureResourcesSource = actorData.system.resources;
        resources.focus = {
            value: focusOld?.points ?? 0,
            max: focusOld?.pool ?? 1,
        };
    }

    override async updateItem(itemData: ItemSourceXPRPG): Promise<void> {
        if (itemData.type !== "spellcastingEntry") return;
        const data: SpellcastingEntrySystemDataOld = itemData.system;
        delete data.focus;
        if ("game" in globalThis) {
            data["-=focus"] = null;
        }
    }
}
