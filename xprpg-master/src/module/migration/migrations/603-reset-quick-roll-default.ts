import { isObject } from "@util";
import { MigrationBase } from "../base";

export class Migration603ResetQuickRollDefault extends MigrationBase {
    static override version = 0.603;

    override async updateUser(userData: foundry.data.UserSource): Promise<void> {
        const flags = userData.flags;
        if (
            isObject<Record<string, unknown>>(flags.XPRPG) &&
            isObject<Record<string, unknown>>(flags.XPRPG.settings) &&
            typeof flags.XPRPG.settings.quickD20roll === "boolean"
        ) {
            flags.XPRPG.settings.quickD20roll = false;
        }
    }
}
