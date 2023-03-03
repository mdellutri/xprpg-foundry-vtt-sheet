import { CharacterSheetXPRPG } from "@actor/character/sheet";
import { FamiliarSheetXPRPG } from "@actor/familiar/sheet";
import { HazardSheetXPRPG } from "@actor/hazard/sheet";
import { LootSheetXPRPG } from "@actor/loot/sheet";
import { NPCSheetXPRPG } from "@actor/npc/sheet";
import { VehicleSheetXPRPG } from "@actor/vehicle/sheet";
import { ItemSheetXPRPG } from "@item";
import { ActionSheetXPRPG } from "@item/action";
import { AfflictionSheetXPRPG } from "@item/affliction";
import { AncestrySheetXPRPG } from "@item/ancestry";
import { ArmorSheetXPRPG } from "@item/armor";
import { BackgroundSheetXPRPG } from "@item/background";
import { BookSheetXPRPG } from "@item/book";
import { ClassSheetXPRPG } from "@item/class";
import { ConsumableSheetXPRPG } from "@item/consumable";
import { ContainerSheetXPRPG } from "@item/container";
import { DeitySheetXPRPG } from "@item/deity";
import { EffectSheetXPRPG } from "@item/effect";
import { EquipmentSheetXPRPG } from "@item/equipment";
import { FeatSheetXPRPG } from "@item/feat";
import { HeritageSheetXPRPG } from "@item/heritage";
import { KitSheetXPRPG } from "@item/kit";
import { MeleeSheetXPRPG } from "@item/melee";
import { PhysicalItemSheetXPRPG } from "@item/physical";
import { PHYSICAL_ITEM_TYPES } from "@item/physical/values";
import { SpellSheetXPRPG } from "@item/spell";
import { TreasureSheetXPRPG } from "@item/treasure";
import { WeaponSheetXPRPG } from "@item/weapon";
import { JournalSheetXPRPG, JournalTextTinyMCESheetXPRPG } from "@module/journal-entry/sheet";
import { UserConfigXPRPG } from "@module/user/sheet";
import { TokenConfigXPRPG, TokenDocumentXPRPG } from "@scene";
import { SceneConfigXPRPG } from "@scene/sheet";
import { LocalizeXPRPG } from "@system/localize";

export function registerSheets(): void {
    const translations = LocalizeXPRPG.translations.XPRPG;
    const sheetLabel = translations.SheetLabel;

    Scenes.registerSheet("xprpg", SceneConfigXPRPG, { makeDefault: true });
    DocumentSheetConfig.registerSheet(TokenDocumentXPRPG, "xprpg", TokenConfigXPRPG, { makeDefault: true });

    // ACTORS
    Actors.unregisterSheet("core", ActorSheet);

    const localizeType = (type: string) => {
        const entityType = type in CONFIG.XPRPG.Actor.documentClasses ? "ACTOR" : "ITEM";
        const camelized = type[0].toUpperCase() + type.slice(1).toLowerCase();
        return game.i18n.localize(`${entityType}.Type${camelized}`);
    };

    Actors.registerSheet("xprpg", CharacterSheetXPRPG, {
        types: ["character"],
        label: game.i18n.format(sheetLabel, { type: localizeType("character") }),
        makeDefault: true,
    });

    // Regiser NPC Sheet
    Actors.registerSheet("xprpg", NPCSheetXPRPG, {
        types: ["npc"],
        label: game.i18n.format(sheetLabel, { type: localizeType("npc") }),
        makeDefault: true,
    });

    // Register Hazard Sheet
    Actors.registerSheet("xprpg", HazardSheetXPRPG, {
        types: ["hazard"],
        label: game.i18n.format(sheetLabel, { type: localizeType("hazard") }),
    });

    // Register Loot Sheet
    Actors.registerSheet("xprpg", LootSheetXPRPG, {
        types: ["loot"],
        label: game.i18n.format(sheetLabel, { type: localizeType("loot") }),
        makeDefault: true,
    });

    // Register Familiar Sheet
    Actors.registerSheet("xprpg", FamiliarSheetXPRPG, {
        types: ["familiar"],
        label: game.i18n.format(sheetLabel, { type: localizeType("familiar") }),
        makeDefault: true,
    });

    // Register Vehicle Sheet
    Actors.registerSheet("xprpg", VehicleSheetXPRPG, {
        types: ["vehicle"],
        label: game.i18n.format(sheetLabel, { type: localizeType("vehicle") }),
        makeDefault: true,
    });

    // ITEMS
    Items.unregisterSheet("core", ItemSheet);

    const itemTypes = ["condition", "lore", "spellcastingEntry"];
    for (const itemType of itemTypes) {
        Items.registerSheet("xprpg", ItemSheetXPRPG, {
            types: [itemType],
            label: game.i18n.format(sheetLabel, { type: localizeType(itemType) }),
            makeDefault: true,
        });
    }

    const sheetEntries = [
        ["action", ActionSheetXPRPG],
        ["affliction", AfflictionSheetXPRPG],
        ["ancestry", AncestrySheetXPRPG],
        ["armor", ArmorSheetXPRPG],
        ["background", BackgroundSheetXPRPG],
        ["backpack", ContainerSheetXPRPG],
        ["book", BookSheetXPRPG],
        ["class", ClassSheetXPRPG],
        ["consumable", ConsumableSheetXPRPG],
        ["deity", DeitySheetXPRPG],
        ["effect", EffectSheetXPRPG],
        ["equipment", EquipmentSheetXPRPG],
        ["feat", FeatSheetXPRPG],
        ["heritage", HeritageSheetXPRPG],
        ["kit", KitSheetXPRPG],
        ["melee", MeleeSheetXPRPG],
        ["spell", SpellSheetXPRPG],
        ["treasure", TreasureSheetXPRPG],
        ["weapon", WeaponSheetXPRPG],
    ] as const;
    for (const [type, Sheet] of sheetEntries) {
        Items.registerSheet("xprpg", Sheet, {
            types: [type],
            label: game.i18n.format(sheetLabel, { type: localizeType(type) }),
            makeDefault: true,
        });
    }

    // Add any missing physical item sheets
    for (const itemType of PHYSICAL_ITEM_TYPES) {
        if (sheetEntries.some(([type, _sheet]) => itemType === type)) continue;
        Items.registerSheet("xprpg", PhysicalItemSheetXPRPG, {
            types: [itemType],
            label: game.i18n.format(sheetLabel, { type: localizeType(itemType) }),
            makeDefault: true,
        });
    }

    // JOURNAL

    Journal.unregisterSheet("core", JournalSheet);
    Journal.registerSheet("xprpg", JournalSheetXPRPG, {
        label: () =>
            game.i18n.format("SHEETS.DefaultDocumentSheet", { document: game.i18n.localize("DOCUMENT.JournalEntry") }),
        makeDefault: true,
    });

    // Replace the TinyMCE sheet with the version that'll let us inject themes
    DocumentSheetConfig.unregisterSheet(JournalEntryPage, "core", JournalTextTinyMCESheet);
    DocumentSheetConfig.registerSheet(JournalEntryPage, "xprpg", JournalTextTinyMCESheetXPRPG, {
        types: ["text"],
        label: game.i18n.localize("EDITOR.TinyMCE"),
    });

    // User
    Users.unregisterSheet("core", UserConfig);
    Users.registerSheet("xprpg", UserConfigXPRPG, {
        makeDefault: true,
        label: () => game.i18n.format("SHEETS.DefaultDocumentSheet", { document: game.i18n.localize("DOCUMENT.User") }),
    });
}
