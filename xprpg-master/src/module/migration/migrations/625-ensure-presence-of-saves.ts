import { ActorSourceXPRPG } from "@actor/data";
import { MigrationBase } from "../base";

interface BaseSaveData {
    value: number;
    saveDetail: string;
}

interface BaseNPCSaves {
    fortitude: BaseSaveData;
    reflex: BaseSaveData;
    will: BaseSaveData;
}

/** Ensure presence of all three save types on NPCs */
export class Migration625EnsurePresenceOfSaves extends MigrationBase {
    static override version = 0.625;

    override async updateActor(actorData: ActorSourceXPRPG): Promise<void> {
        if (actorData.type !== "npc") return;

        const saves: BaseNPCSaves = actorData.system.saves;
        for (const key of ["fortitude", "reflex", "will"] as const) {
            saves[key] ??= {
                value: 0,
                saveDetail: "",
            };
            if (typeof saves[key].value !== "number") {
                saves[key].value = Number(saves[key].value) || 0;
            }
            if (typeof saves[key].saveDetail !== "string") {
                saves[key].saveDetail = "";
            }
        }
    }
}
