import { ActorSourceXPRPG } from "@actor/data";
import { MigrationBase } from "../base";

/** Move hazard level property to the same position as other actor data */
export class Migration643HazardLevel extends MigrationBase {
    static override version = 0.643;

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        if (actorSource.type !== "hazard") return;

        const hazardDetails: ObjectOrNumber = actorSource.system.details;
        if (typeof hazardDetails.level === "number") {
            const level = hazardDetails.level;
            hazardDetails.level = { value: level };
        }
    }
}

interface ObjectOrNumber {
    level: { value: number } | number;
}
