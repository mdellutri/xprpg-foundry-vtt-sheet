import { ActorXPRPG } from "@actor/base";
import { UserFlagsXPRPG } from "./data";

class UserXPRPG extends User<ActorXPRPG> {
    override prepareData(): void {
        super.prepareData();
        if (canvas.ready && canvas.tokens.controlled.length > 0) {
            game.xprpg.effectPanel.refresh();
        }
    }

    /** Set user settings defaults */
    override prepareBaseData(): void {
        super.prepareBaseData();
        this.flags = mergeObject(
            {
                xprpg: {
                    settings: {
                        showEffectPanel: true,
                        showRollDialogs: true,
                        searchPackContents: false,
                        monochromeDarkvision: true,
                    },
                },
            },
            this.flags
        );
    }

    get settings(): Readonly<UserSettingsXPRPG> {
        return this.flags.xprpg.settings;
    }

    /** Alternative to calling `#updateTokenTargets()` with no argument or an empty array */
    clearTargets(): void {
        this.updateTokenTargets();
    }

    protected override _onUpdate(
        changed: DeepPartial<this["_source"]>,
        options: DocumentModificationContext,
        userId: string
    ): void {
        super._onUpdate(changed, options, userId);
        if (game.user.id !== userId) return;

        const keys = Object.keys(flattenObject(changed));
        if (keys.includes("flags.xprpg.settings.showEffectPanel")) {
            game.xprpg.effectPanel.refresh();
        }
        if (keys.includes("flags.xprpg.settings.monochromeDarkvision") && canvas.ready) {
            canvas.scene?.reset();
            canvas.perception.update({ initializeVision: true, refreshLighting: true }, true);
        }
    }
}

interface UserXPRPG extends User<ActorXPRPG> {
    flags: UserFlagsXPRPG;
}

interface UserSettingsXPRPG {
    showEffectPanel: boolean;
    showRollDialogs: boolean;
    monochromeDarkvision: boolean;
    searchPackContents: boolean;
}

export { UserXPRPG, UserSettingsXPRPG };
