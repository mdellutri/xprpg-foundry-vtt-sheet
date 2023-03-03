import { ActorSourceXPRPG } from "@actor/data";
import { isObject } from "@util";
import { MigrationBase } from "../base";

/** Reset all roll options now that most are no longer stored on actors */
export class Migration751ResetRollOptions extends MigrationBase {
    static override version = 0.751;

    override async updateActor(source: ActorSourceXPRPG): Promise<void> {
        if (isObject(source.flags.xprpg) && "rollOptions" in source.flags.xprpg) {
            source.flags.xprpg["-=rollOptions"] = null;
        }
    }
}
