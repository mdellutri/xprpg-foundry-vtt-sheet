import { UserXPRPG, UserSettingsXPRPG } from "./document";

interface UserDataXPRPG<T extends UserXPRPG> extends foundry.data.UserData<T> {
    _source: UserSourceXPRPG;
}

interface UserSourceXPRPG extends foundry.data.UserSource {
    flags: UserFlagsXPRPG;
}

type UserFlagsXPRPG = {
    [key: string]: Record<string, unknown>;
    xprpg: {
        settings: UserSettingsXPRPG;
    };
};

export { UserDataXPRPG, UserFlagsXPRPG };
