import { AutomaticBonusProgression as ABP } from "@actor/character/automatic-bonus-progression";
import {
    CoinsXPRPG,
    PhysicalItemSheetData,
    PhysicalItemSheetXPRPG,
    WEAPON_MATERIAL_VALUATION_DATA,
} from "@item/physical";
import { OneToFour, OneToThree } from "@module/data";
import { createSheetTags, SheetOptions } from "@module/sheet/helpers";
import { ErrorXPRPG, htmlQueryAll, objectHasKey, setHasElement, sortStringRecord, tupleHasValue } from "@util";
import { WeaponPersistentDamage, WeaponPropertyRuneSlot } from "./data";
import { type WeaponXPRPG } from "./document";
import { MANDATORY_RANGED_GROUPS, WEAPON_RANGES } from "./values";

export class WeaponSheetXPRPG extends PhysicalItemSheetXPRPG<WeaponXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>) {
        interface PropertyRuneSheetSlot extends WeaponPropertyRuneSlot {
            name?: string;
            number?: OneToFour;
            label?: string;
        }
        const sheetData: PhysicalItemSheetData<WeaponXPRPG> & {
            propertyRuneSlots?: PropertyRuneSheetSlot[];
        } = await super.getData(options);

        const ABPVariant = game.settings.get("xprpg", "automaticBonusVariant");
        const abpEnabled = ABP.isEnabled(this.actor);

        // Limit shown property-rune slots by potency rune level and a material composition of orichalcum
        const potencyRuneValue = ABPVariant === "ABPFundamentalPotency" ? 4 : sheetData.data.potencyRune.value ?? 0;
        const propertyRuneSlots = [
            [1, sheetData.data.propertyRune1],
            [2, sheetData.data.propertyRune2],
            [3, sheetData.data.propertyRune3],
            [4, sheetData.data.propertyRune4],
        ] as const;
        sheetData.propertyRuneSlots = propertyRuneSlots
            .filter(
                ([slotNumber, slot], idx) =>
                    (slotNumber <= potencyRuneValue || sheetData.data.preciousMaterial.value === "orichalcum") &&
                    (slotNumber === 1 || !!sheetData.data[`propertyRune${idx as OneToThree}` as const]?.value) &&
                    !(sheetData.data.specific?.value && slot.value === null)
            )
            .map(([slotNumber, slot]) => ({
                ...slot,
                name: `system.propertyRune${slotNumber}.value`,
                label: game.i18n.localize(`XPRPG.PropertyRuneLabel${slotNumber}`),
                number: slotNumber,
            }));

        // Weapons have derived damage dice, level, price, and traits: base data is shown for editing
        const baseData = this.item.toObject();
        sheetData.data.traits.rarity = baseData.system.traits.rarity;
        const hintText = abpEnabled ? "XPRPG.Item.Weapon.FromABP" : "XPRPG.Item.Weapon.FromMaterialAndRunes";

        const adjustedDiceHint =
            this.item.system.damage.dice !== baseData.system.damage.dice
                ? game.i18n.format(game.i18n.localize(hintText), {
                      property: game.i18n.localize("XPRPG.Item.Weapon.Damage.DiceNumber"),
                      value: this.item.system.damage.dice,
                  })
                : null;

        const adjustedLevelHint =
            this.item.level !== baseData.system.level.value
                ? game.i18n.format(hintText, {
                      property: game.i18n.localize("XPRPG.LevelLabel"),
                      value: this.item.level,
                  })
                : null;
        const adjustedPriceHint = (() => {
            const basePrice = new CoinsXPRPG(baseData.system.price.value).scale(baseData.system.quantity).copperValue;
            const derivedPrice = this.item.assetValue.copperValue;
            return basePrice !== derivedPrice
                ? game.i18n.format(hintText, {
                      property: game.i18n.localize("XPRPG.PriceLabel"),
                      value: this.item.price.value.toString(),
                  })
                : null;
        })();

        const damageDieFaces = Object.fromEntries(
            Object.entries(CONFIG.XPRPG.damageDie)
                .map(([num, label]): [number, string] => [Number(num.replace("d", "")), label])
                .sort(([numA], [numB]) => numA - numB)
        );

        const weaponPropertyRunes = Object.fromEntries(
            Object.entries(CONFIG.XPRPG.runes.weapon.property)
                .map(([slug, data]): [string, string] => [slug, game.i18n.localize(data.name)])
                .sort((runeA, runeB) => runeA[1].localeCompare(runeB[1]))
        );

        const traitSet = this.item.traits;
        const isComboWeapon = traitSet.has("combination");

        const weaponRanges = Array.from(WEAPON_RANGES).reduce(
            (ranges: Record<number, string>, range) => ({
                ...ranges,
                [range]: game.i18n.format("XPRPG.WeaponRangeN", { range: range }),
            }),
            {}
        );
        const rangedOnlyTraits = ["combination", "thrown", "volley-20", "volley-30", "volley-50"] as const;
        const mandatoryRanged =
            setHasElement(MANDATORY_RANGED_GROUPS, this.item.group) ||
            rangedOnlyTraits.some((trait) => traitSet.has(trait));
        const mandatoryMelee = sheetData.data.traits.value.some((trait) => /^thrown-\d+$/.test(trait));

        // Restrict the Implement tag to one-handed weapons
        const otherTags = ((): SheetOptions => {
            const otherWeaponTags: Record<string, string> = deepClone(CONFIG.XPRPG.otherWeaponTags);
            if (this.item.hands !== "1") delete otherWeaponTags.implement;
            return createSheetTags(otherWeaponTags, sheetData.data.traits.otherTags);
        })();

        const meleeUsage = sheetData.data.meleeUsage ?? {
            group: "knife",
            damage: { type: "piercing", die: "d4" },
            traits: [],
        };

        return {
            ...sheetData,
            hasDetails: true,
            hasSidebar: true,
            preciousMaterials: this.prepareMaterials(WEAPON_MATERIAL_VALUATION_DATA),
            weaponPotencyRunes: CONFIG.XPRPG.weaponPotencyRunes,
            weaponStrikingRunes: CONFIG.XPRPG.weaponStrikingRunes,
            weaponPropertyRunes,
            otherTags,
            adjustedDiceHint,
            adjustedLevelHint,
            adjustedPriceHint,
            abpEnabled,
            baseDice: baseData.system.damage.dice,
            baseLevel: baseData.system.level.value,
            rarity: baseData.system.traits.rarity,
            basePrice: new CoinsXPRPG(baseData.system.price.value),
            categories: sortStringRecord(CONFIG.XPRPG.weaponCategories),
            groups: sortStringRecord(CONFIG.XPRPG.weaponGroups),
            baseTypes: sortStringRecord(CONFIG.XPRPG.baseWeaponTypes),
            itemBonuses: CONFIG.XPRPG.itemBonuses,
            damageDieFaces,
            damageDie: CONFIG.XPRPG.damageDie,
            damageDice: CONFIG.XPRPG.damageDice,
            conditionTypes: sortStringRecord(CONFIG.XPRPG.conditionTypes),
            damageTypes: sortStringRecord(CONFIG.XPRPG.damageTypes),
            weaponRanges,
            mandatoryMelee,
            mandatoryRanged,
            weaponReload: CONFIG.XPRPG.weaponReload,
            weaponMAP: CONFIG.XPRPG.weaponMAP,
            isBomb: this.item.group === "bomb",
            isComboWeapon,
            meleeGroups: sortStringRecord(CONFIG.XPRPG.meleeWeaponGroups),
            meleeUsage,
            meleeUsageTraits: createSheetTags(CONFIG.XPRPG.weaponTraits, meleeUsage.traits ?? []),
        };
    }

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);
        const html = $html[0]!;

        type InputOrSelect = HTMLInputElement | HTMLSelectElement;
        const pdElements = htmlQueryAll<InputOrSelect>(html, "[data-action=update-persistent]");
        for (const element of pdElements) {
            element.addEventListener("change", async (event): Promise<void> => {
                if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)) {
                    throw ErrorXPRPG("Unexpected error updating persistent damage data");
                }

                const diceNumber = Number(pdElements.find((e) => e.dataset.persistentField === "number")?.value) || 0;
                const dieFaces = Number(pdElements.find((e) => e.dataset.persistentField === "faces")?.value);

                const baseDamageType = this.item.system.damage.damageType;
                const damageType =
                    pdElements.find((e) => e.dataset.persistentField === "type")?.value || baseDamageType;

                if (!(diceNumber && typeof dieFaces === "number" && damageType)) {
                    throw ErrorXPRPG("Unexpected error updating persistent damage data");
                }

                // If the user changed the number to zero directly, wipe the entire persistent damage object
                const maybeDiceNumber = Math.trunc(Math.abs(Number(event.target.value) || 0));
                if (event.target.dataset.persistentField === "number" && maybeDiceNumber === 0) {
                    await this.item.update({ "system.damage.persistent": null });
                } else if (objectHasKey(CONFIG.XPRPG.damageTypes, damageType)) {
                    const damage: WeaponPersistentDamage = {
                        number: Math.trunc(Math.abs(diceNumber)) || 1,
                        faces: tupleHasValue([4, 6, 8, 10, 12] as const, dieFaces) ? dieFaces : null,
                        type: damageType,
                    };
                    await this.item.update({ "system.damage.persistent": damage });
                }
            });
        }
    }

    protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
        const weapon = this.item;

        formData["system.bonusDamage.value"] ||= 0;
        formData["system.splashDamage.value"] ||= 0;

        // Set empty-string values to null
        formData["system.potencyRune.value"] ||= null;
        formData["system.strikingRune.value"] ||= null;
        for (const slotNumber of [1, 2, 3, 4]) {
            formData[`system.propertyRune${slotNumber}.value`] ||= null;
        }

        // Coerce a weapon range of zero to null
        formData["system.range"] ||= null;

        // Clamp damage dice to between zero and eight
        if ("system.damage.dice" in formData) {
            formData["system.damage.dice"] = Math.clamped(Number(formData["system.damage.dice"]) || 0, 0, 8);
        }

        // Seal specific magic weapon data if set to true
        const isSpecific = formData["system.specific.value"];
        if (isSpecific !== weapon.isSpecific) {
            if (isSpecific === true) {
                formData["system.price.value"] = this.item.price.value;
                formData["system.specific.price"] = this.item.price.value;
                formData["system.specific.material"] = weapon.material;
                formData["system.specific.runes"] = {
                    potency: formData["system.potencyRune.value"],
                    striking: formData["system.strikingRune.value"],
                };
            } else if (isSpecific === false) {
                formData["system.specific.-=price"] = null;
                formData["system.specific.-=material"] = null;
                formData["system.specific.-=runes"] = null;
            }
        }

        // Ensure melee usage is absent if not a combination weapon
        if (weapon.system.meleeUsage && !this.item.traits.has("combination")) {
            formData["system.-=meleeUsage"] = null;
        }

        return super._updateObject(event, formData);
    }
}
