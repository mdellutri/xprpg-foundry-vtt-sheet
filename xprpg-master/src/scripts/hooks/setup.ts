import { LocalizeXPRPG } from "@system/localize";
import { registerSheets } from "../register-sheets";
import { HomebrewElements } from "@system/settings/homebrew";
import { SetGameXPRPG } from "@scripts/set-game-XPRPG";

/** This runs after game data has been requested and loaded from the servers, so entities exist */
export const Setup = {
    listen: (): void => {
        Hooks.once("setup", () => {
            LocalizeXPRPG.ready = true;

            // Register actor and item sheets
            registerSheets();

            CONFIG.controlIcons.defeated = game.settings.get("xprpg", "deathIcon");
            game.xprpg.StatusEffects.initialize();

            // Assign the homebrew elements to their respective `CONFIG.XPRPG` objects
            const homebrew = new HomebrewElements();
            homebrew.onSetup();

            // Some of game.xprpg must wait until the setup phase
            SetGameXPRPG.onSetup();

            // Forced panning is intrinsically annoying: change default to false
            game.settings.settings.get("core.chatBubblesPan").default = false;
            // Improve discoverability of map notes
            game.settings.settings.get("core.notesDisplayToggle").default = true;

            // Set Hover by Owner as defaults for Default Token Configuration
            const defaultTokenSettingsDefaults = game.settings.settings.get("core.defaultToken").default;
            defaultTokenSettingsDefaults.displayName = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;
            defaultTokenSettingsDefaults.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;
        });
    },
};
