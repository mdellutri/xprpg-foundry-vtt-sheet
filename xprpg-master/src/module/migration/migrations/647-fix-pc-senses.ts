import { ActorSourceXPRPG } from "@actor/data";
import { MigrationBase } from "../base";

/** Fix PC `senses` properties, misshapen by some mysterious source */
export class Migration647FixPCSenses extends MigrationBase {
    static override version = 0.647;

    override async updateActor(actorData: ActorSourceXPRPG): Promise<void> {
        if (actorData.type !== "character") return;

        const notTraits = actorData.system.traits;
        if (Array.isArray(notTraits.senses)) {
            notTraits.senses = notTraits.senses.filter((sense) => !!sense);
        } else {
            notTraits.senses = [];
        }
    }
}
