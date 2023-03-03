import { isObject } from "@util";
import { MigrationBase } from "../base";

export class Migration617FixUserFlags extends MigrationBase {
    static override version = 0.617;

    override async updateUser(userData: foundry.data.UserSource): Promise<void> {
        const flags: Record<string, Record<string, unknown>> & { "-=XPRPG"?: null } = userData.flags;
        const settings = flags.XPRPG?.settings;
        if (isObject<Record<string, unknown>>(settings) && typeof settings.color === "string") {
            const uiTheme = settings.color ?? "blue";
            const showRollDialogs = !settings.quickD20roll;
            flags.xprpg ??= {};
            flags.xprpg.settings = {
                uiTheme,
                showEffectPanel: flags.xprpg?.showEffectPanel ?? true,
                showRollDialogs,
            };
            delete flags.XPRPG;
            flags["-=XPRPG"] = null;
        }
    }
}
