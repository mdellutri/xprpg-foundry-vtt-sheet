import { UserXPRPG } from "./document";

/** Player-specific settings, stored as flags on each User */
export class UserConfigXPRPG<TUser extends UserXPRPG> extends UserConfig<TUser> {
    override get template(): string {
        return "systems/xprpg/templates/user/sheet.hbs";
    }
}
