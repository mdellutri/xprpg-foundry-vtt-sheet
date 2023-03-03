import { ActorSourceXPRPG } from "@actor/data";
import { MigrationBase } from "../base";

export class Migration624RemoveTokenEffectIconFlags extends MigrationBase {
    static override version = 0.624;

    override async updateActor(actorData: ActorSourceXPRPG): Promise<void> {
        // remove deprecated rule element token effect flags
        const flags = actorData.flags as TokenEffectsFlag;
        if (flags.xprpg?.token?.effects) {
            delete flags.xprpg.token.effects;
            if ("game" in globalThis) {
                flags.xprpg.token["-=effects"] = null;
            }
        }
    }

    override async updateToken(tokenData: foundry.data.TokenSource): Promise<void> {
        // remove deprecated rule element token effects
        const flags = (tokenData.actorData.flags ?? {}) as TokenEffectsFlag;
        if (flags.xprpg?.token?.effects) {
            delete flags.xprpg.token.effects;
            if ("game" in globalThis) {
                flags.xprpg.token["-=effects"] = null;
            }
        }
    }
}

type TokenEffectsFlag = {
    xprpg?: {
        token?: {
            effects?: Record<string, unknown>;
            "-=effects"?: null;
        };
    };
};
