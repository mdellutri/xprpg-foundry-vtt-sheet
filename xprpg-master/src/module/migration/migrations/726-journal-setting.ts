import { isObject } from "@util";
import { MigrationBase } from "../base";

/** Remove the journal theme setting, changing the default sheet according to the stored setting value */
export class Migration726JournalSetting extends MigrationBase {
    static override version = 0.726;

    override async migrate() {
        // If the sheet is already configured, leave it as is
        const sheetClasses = game.settings.get("core", "sheetClasses");
        if (isObject<SheetConfig>(sheetClasses) && sheetClasses.JournalEntry?.base) {
            return;
        }

        // Get theme if its a registered setting. If it doesn't exist, keep the default (XPRPG sheet)
        const theme = game.settings.storage.get("world").getItem("xprpg.journalEntryTheme");
        if (!theme) return;

        const base = theme === "xprpgTheme" ? "xprpg.JournalSheetStyledXPRPG" : "xprpg.JournalSheetXPRPG";
        DocumentSheetConfig.updateDefaultSheets({ JournalEntry: { base } });
    }
}

interface SheetConfig {
    JournalEntry?: { base?: string };
}
