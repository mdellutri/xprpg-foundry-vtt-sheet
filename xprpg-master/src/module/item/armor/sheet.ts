import {
    ARMOR_MATERIAL_VALUATION_DATA,
    CoinsXPRPG,
    getPropertySlots,
    PhysicalItemSheetData,
    PhysicalItemSheetXPRPG,
    PreparedMaterials,
} from "@item/physical";
import { createSheetTags, SheetOptions } from "@module/sheet/helpers";
import { LocalizeXPRPG } from "@system/localize";
import { ArmorCategory, ArmorGroup, ArmorXPRPG, BaseArmorType } from ".";

class ArmorSheetXPRPG extends PhysicalItemSheetXPRPG<ArmorXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<ArmorSheetData> {
        const sheetData = await super.getData(options);

        // Armor property runes
        const totalSlots = getPropertySlots(this.item);
        const propertyRuneSlots: Record<`propertyRuneSlots${number}`, boolean> = {};
        for (const slot of [1, 2, 3, 4]) {
            if (totalSlots >= slot) {
                propertyRuneSlots[`propertyRuneSlots${slot}`] = true;
            }
        }

        return {
            ...sheetData,
            hasDetails: true,
            hasSidebar: true,
            armorPotencyRunes: CONFIG.XPRPG.armorPotencyRunes,
            armorResiliencyRunes: CONFIG.XPRPG.armorResiliencyRunes,
            armorPropertyRunes: CONFIG.XPRPG.armorPropertyRunes,
            categories: CONFIG.XPRPG.armorTypes,
            groups: CONFIG.XPRPG.armorGroups,
            baseTypes: LocalizeXPRPG.translations.XPRPG.Item.Armor.Base,
            bulkTypes: CONFIG.XPRPG.bulkTypes,
            preciousMaterials: this.prepareMaterials(ARMOR_MATERIAL_VALUATION_DATA),
            ...propertyRuneSlots,
            otherTags: createSheetTags(CONFIG.XPRPG.otherArmorTags, sheetData.data.traits.otherTags),
            basePrice: new CoinsXPRPG(this.item._source.system.price.value),
        };
    }

    protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
        formData["system.potencyRune.value"] ||= null;
        formData["system.resiliencyRune.value"] ||= null;
        for (const slotNumber of [1, 2, 3, 4]) {
            formData[`system.propertyRune${slotNumber}.value`] ||= null;
        }

        return super._updateObject(event, formData);
    }
}

interface ArmorSheetData extends PhysicalItemSheetData<ArmorXPRPG> {
    armorPotencyRunes: ConfigXPRPG["XPRPG"]["armorPotencyRunes"];
    armorResiliencyRunes: ConfigXPRPG["XPRPG"]["armorResiliencyRunes"];
    armorPropertyRunes: ConfigXPRPG["XPRPG"]["armorPropertyRunes"];
    categories: Record<ArmorCategory, string>;
    groups: Record<ArmorGroup, string>;
    baseTypes: Record<BaseArmorType, string>;
    bulkTypes: ConfigXPRPG["XPRPG"]["bulkTypes"];
    preciousMaterials: PreparedMaterials;
    otherTags: SheetOptions;
    basePrice: CoinsXPRPG;
}

export { ArmorSheetXPRPG };
