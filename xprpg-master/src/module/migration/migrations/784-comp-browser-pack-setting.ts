import { MigrationBase } from "../base";

/** Migrate Compendium Browser packs selection setting to an object */
export class Migration784CompBrowserPackSetting extends MigrationBase {
    static override version = 0.784;

    override async migrate(): Promise<void> {
        const savedSettings = game.settings.get("xprpg", "compendiumBrowserPacks") as unknown;
        if (savedSettings instanceof String) {
            const settings = JSON.parse(savedSettings.toString());
            await game.settings.set("xprpg", "compendiumBrowserPacks", settings);
            const browser = game?.xprpg?.compendiumBrowser;
            if (browser) {
                browser.settings = settings;
                browser.initCompendiumList();
            }
        }
    }
}
