import { LightLevels, SceneDataXPRPG } from "./data";
import { SceneConfigXPRPG } from "./sheet";
import { AmbientLightDocumentXPRPG, MeasuredTemplateDocumentXPRPG, TileDocumentXPRPG, TokenDocumentXPRPG } from ".";
import { checkAuras } from "./helpers";

class SceneXPRPG extends Scene {
    /** Is the rules-based vision setting enabled? */
    get rulesBasedVision(): boolean {
        const settingEnabled = game.settings.get("xprpg", "automation.rulesBasedVision");
        return this.tokenVision && settingEnabled;
    }

    /** Is this scene's darkness value synced to the world time? */
    get darknessSyncedToTime(): boolean {
        return (
            this.flags.xprpg.syncDarkness === "enabled" ||
            (this.flags.xprpg.syncDarkness === "default" && game.settings.get("xprpg", "worldClock.syncDarkness"))
        );
    }

    get lightLevel(): number {
        return 1 - this.darkness;
    }

    get isBright(): boolean {
        return this.lightLevel >= LightLevels.BRIGHT_LIGHT;
    }

    get isDimlyLit(): boolean {
        return !this.isBright && !this.isDark;
    }

    get isDark(): boolean {
        return this.lightLevel <= LightLevels.DARKNESS;
    }

    get hasHexGrid(): boolean {
        const squareOrGridless: number[] = [CONST.GRID_TYPES.GRIDLESS, CONST.GRID_TYPES.SQUARE];
        return !squareOrGridless.includes(this.grid.type);
    }

    /** Whether this scene is "in focus": the active scene, or the viewed scene if only a single GM is logged in */
    get isInFocus(): boolean {
        const soleUserIsGM = (): boolean => game.user.isGM && game.users.filter((u) => u.active).length === 1;
        return this.active || (game.scenes.viewed === this && soleUserIsGM());
    }

    override prepareData(): void {
        super.prepareData();

        Promise.resolve().then(() => {
            this.checkAuras();
        });
    }

    /** Toggle Unrestricted Global Vision according to scene darkness level */
    override prepareBaseData(): void {
        super.prepareBaseData();
        if (this.rulesBasedVision) {
            this.globalLight = true;
            this.hasGlobalThreshold = true;
            this.globalLightThreshold = 1 - (LightLevels.DARKNESS + 0.001);
        }

        this.flags.xprpg ??= { syncDarkness: "default" };
        this.flags.xprpg.syncDarkness ??= "default";
    }

    /* -------------------------------------------- */
    /*  Event Handlers                              */
    /* -------------------------------------------- */

    /** Redraw auras if the scene was activated while being viewed */
    override _onUpdate(
        changed: DeepPartial<this["_source"]>,
        options: DocumentModificationContext,
        userId: string
    ): void {
        super._onUpdate(changed, options, userId);

        if (changed.active && canvas.scene === this) {
            for (const token of canvas.tokens.placeables) {
                token.auras.draw();
            }
        }
    }
}

interface SceneXPRPG extends Scene {
    /** Added as debounced method: check for auras containing newly-placed or moved tokens */
    checkAuras(): void;

    _sheet: SceneConfigXPRPG<this> | null;

    readonly lights: foundry.abstract.EmbeddedCollection<AmbientLightDocumentXPRPG>;
    readonly templates: foundry.abstract.EmbeddedCollection<MeasuredTemplateDocumentXPRPG>;
    readonly tokens: foundry.abstract.EmbeddedCollection<TokenDocumentXPRPG>;
    readonly tiles: foundry.abstract.EmbeddedCollection<TileDocumentXPRPG>;

    flags: {
        xprpg: {
            [key: string]: unknown;
            syncDarkness: "enabled" | "disabled" | "default";
        };
        [key: string]: Record<string, unknown>;
    };

    readonly data: SceneDataXPRPG<this>;

    get sheet(): SceneConfigXPRPG<this>;
}

// Added as debounced method
Object.defineProperty(SceneXPRPG.prototype, "checkAuras", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: checkAuras,
});

export { SceneXPRPG };
