import { ItemSheetXPRPG } from "@item/sheet/base";
import { MigrationBase } from "@module/migration/base";
import { MigrationRunner } from "@module/migration/runner";
import { LocalizeXPRPG } from "@module/system/localize";
import { immunityTypes, resistanceTypes, weaknessTypes } from "@scripts/config/iwr";
import { DamageType } from "@system/damage/types";
import {
    BASE_DAMAGE_TYPES_TO_CATEGORIES,
    DAMAGE_TYPES,
    DAMAGE_TYPE_ICONS,
    ENERGY_DAMAGE_TYPES,
    PHYSICAL_DAMAGE_TYPES,
} from "@system/damage/values";
import { htmlClosest, htmlQuery, htmlQueryAll, isObject, objectHasKey, pick, sluggify, tupleHasValue } from "@util";
import Tagify from "@yaireo/tagify";
import { PartialSettingsData, SettingsMenuXPRPG, settingsToSheetData } from "../menu";
import {
    CustomDamageData,
    HomebrewElementsSheetData,
    HomebrewKey,
    HomebrewTag,
    HomebrewTraitKey,
    HomebrewTraitSettingsKey,
    HOMEBREW_TRAIT_KEYS,
    SECONDARY_TRAIT_RECORDS,
} from "./data";
import { isHomebrewCustomDamage, isHomebrewFlagCategory, prepareCleanup } from "./helpers";

import "@yaireo/tagify/src/tagify.scss";

class HomebrewElements extends SettingsMenuXPRPG {
    static override readonly namespace = "homebrew";

    /** Whether this is the first time the homebrew tags will have been injected into CONFIG and actor derived data */
    private initialRefresh = true;

    private damageManager = new DamageTypeManager();

    static override get SETTINGS() {
        return Object.keys(this.settings);
    }

    static override get defaultOptions() {
        return mergeObject(super.defaultOptions, { template: "systems/xprpg/templates/system/settings/homebrew.hbs" });
    }

    protected static get traitSettings() {
        return HOMEBREW_TRAIT_KEYS.reduce((result, key) => {
            result[key] = {
                name: CONFIG.XPRPG.SETTINGS.homebrew[key].name,
                hint: CONFIG.XPRPG.SETTINGS.homebrew[key].hint,
                default: [],
                type: Object,
            };

            return result;
        }, {} as Record<HomebrewTraitKey, PartialSettingsData>);
    }

    protected static override get settings(): Record<HomebrewKey, PartialSettingsData> {
        return {
            ...this.traitSettings,
            damageTypes: {
                name: "XPRPG.SETTINGS.Homebrew.DamageTypes.Name",
                default: [],
                type: Object,
            },
        };
    }

    override activateListeners($form: JQuery<HTMLFormElement>): void {
        super.activateListeners($form);
        const html = $form[0];

        $form.find("button[name=reset]").on("click", () => {
            this.render();
        });

        // Handle all changes for traits
        for (const key of HOMEBREW_TRAIT_KEYS) {
            const $input = $form.find<HTMLInputElement>(`input[name="${key}"]`);
            new Tagify($input[0], {
                editTags: 1,
                hooks: {
                    beforeRemoveTag: (tags): Promise<void> => {
                        const translations = LocalizeXPRPG.translations.XPRPG.SETTINGS.Homebrew.ConfirmDelete;
                        const response: Promise<unknown> = (async () => {
                            const content = game.i18n.format(translations.Message, { element: tags[0].data.value });
                            return await Dialog.confirm({
                                title: translations.Title,
                                content: `<p>${content}</p>`,
                            });
                        })();
                        return (async () => ((await response) ? Promise.resolve() : Promise.reject()))();
                    },
                },
            });
        }

        htmlQuery(html, "[data-action=damage-add]")?.addEventListener("click", async () => {
            this.cache.damageTypes.push({ label: "Custom", category: "physical", icon: "fa-question" });
            this.render();
        });

        for (const element of htmlQueryAll(html, "[data-action=damage-delete]")) {
            element.addEventListener("click", async (event) => {
                const idx = htmlClosest(event.target, "[data-idx]")?.dataset.idx;
                if (idx) {
                    this.cache.damageTypes.splice(Number(idx), 1);
                }
                this.render();
            });
        }
    }

    override async getData(): Promise<HomebrewElementsSheetData> {
        const data = await super.getData();
        const traitSettings = settingsToSheetData(this.constructor.traitSettings, this.cache, this.prefix);
        const damageCategories = pick(CONFIG.XPRPG.damageCategories, ["physical", "energy"]);
        return {
            ...data,
            traitSettings,
            damageCategories,
            customDamageTypes: (this.cache.damageTypes ?? []).map((customType) => ({
                ...customType,
                slug: `hb_${sluggify(customType.label)}`,
            })),
        };
    }

    /** Tagify sets an empty input field to "" instead of "[]", which later causes the JSON parse to throw an error */
    protected override async _onSubmit(
        event: Event,
        { updateData = null, preventClose = false, preventRender = false }: OnSubmitFormOptions = {}
    ): Promise<Record<string, unknown>> {
        this.form.querySelectorAll<HTMLInputElement>("tags ~ input").forEach((input) => {
            if (input.value === "") {
                input.value = "[]";
            }
        });

        return super._onSubmit(event, { updateData, preventClose, preventRender });
    }

    protected override _getSubmitData(updateData?: Record<string, unknown> | undefined): Record<string, unknown> {
        const original = super._getSubmitData(updateData);
        const data: Partial<HomebrewSubmitData> = expandObject<Record<string, unknown>>(original);
        if ("damageTypes" in data && !!data.damageTypes && typeof data.damageTypes === "object") {
            data.damageTypes = Object.values(data.damageTypes);
            for (const type of data.damageTypes) {
                // ensure this is an fa icon
                const sanitized = sluggify(type.icon ?? "");
                type.icon = sanitized.startsWith("fa-") ? sanitized : null;
            }
        }
        return data;
    }

    protected override async _updateObject(event: Event, data: Record<HomebrewTraitKey, HomebrewTag[]>): Promise<void> {
        for (const key of HOMEBREW_TRAIT_KEYS) {
            for (const tag of data[key]) {
                tag.id ??= `hb_${sluggify(tag.value)}` as string as HomebrewTag<typeof key>["id"];
            }
        }

        if (event.type === "submit") {
            const cleanupTasks = HOMEBREW_TRAIT_KEYS.map((key) => {
                return this.processDeletions(key, data[key]);
            }).filter((task): task is MigrationBase => !!task);

            // Close without waiting for migrations to complete
            new MigrationRunner().runMigrations(cleanupTasks);
            await super._updateObject(event, data);

            // Process updates
            this.#refreshSettings();
        } else {
            return super._updateObject(event, data);
        }
    }

    /** Prepare and run a migration for each set of tag deletions from a tag map */
    private processDeletions(listKey: HomebrewTraitKey, newTagList: HomebrewTag[]): MigrationBase | null {
        const oldTagList = game.settings.get("xprpg", `homebrew.${listKey}`);
        const newIDList = newTagList.map((tag) => tag.id);
        const deletions: string[] = oldTagList.flatMap((oldTag) => (newIDList.includes(oldTag.id) ? [] : oldTag.id));

        // The base-weapons map only exists in the localization file
        const coreElements: Record<string, string> =
            listKey === "baseWeapons" ? LocalizeXPRPG.translations.XPRPG.Weapon.Base : CONFIG.XPRPG[listKey];
        for (const id of deletions) {
            delete coreElements[id];
            if (objectHasKey(SECONDARY_TRAIT_RECORDS, listKey)) {
                for (const recordKey of SECONDARY_TRAIT_RECORDS[listKey]) {
                    const secondaryRecord: Record<string, string> = CONFIG.XPRPG[recordKey];
                    delete secondaryRecord[id];
                }
            }
        }

        return game.user.isGM && deletions.length > 0 ? prepareCleanup(listKey, deletions) : null;
    }

    onSetup(): void {
        this.#refreshSettings();
        this.#registerModuleTags();
    }

    /** Assigns all homebrew data stored in the world's settings to their relevant locations */
    #refreshSettings(): void {
        // Perform any cleanup for being the initial refresh
        if (!this.initialRefresh) {
            this.damageManager.deleteAllHomebrew();
        }

        // Add custom traits from settings
        for (const listKey of HOMEBREW_TRAIT_KEYS) {
            const settingsKey: HomebrewTraitSettingsKey = `homebrew.${listKey}` as const;
            const elements = game.settings.get("xprpg", settingsKey);
            this.#updateConfigRecords(elements, listKey);
        }

        // Add custom damage from settings
        const customTypes = game.settings.get("xprpg", "homebrew.damageTypes");
        for (const data of customTypes) {
            this.damageManager.addCustomDamage(data);
        }

        // Add custom damage from modules. Do this every time to ensure data integrity (in case of conflicts)
        const activeModules = [...game.modules.entries()].filter(([_key, foundryModule]) => foundryModule.active);
        for (const [key, foundryModule] of activeModules) {
            const homebrew = foundryModule.flags?.[key]?.["xprpg-homebrew"];
            if (!isObject<Record<string, unknown>>(homebrew)) continue;

            if ("damageTypes" in homebrew) {
                const elements = homebrew.damageTypes;
                if (!isObject(elements) || !isHomebrewCustomDamage(elements)) {
                    console.warn(`XPRPG System | Homebrew record damageTypes is malformed in module ${key}`);
                    continue;
                }

                for (const [slug, value] of Object.entries(elements)) {
                    this.damageManager.addCustomDamage(value, { slug });
                }
            }
        }

        // Refresh any open sheets to show the new settings
        if (this.initialRefresh) {
            this.initialRefresh = false;
        } else {
            const sheets = Object.values(ui.windows).filter(
                (app): app is DocumentSheet => app instanceof ActorSheet || app instanceof ItemSheetXPRPG
            );
            for (const sheet of sheets) {
                sheet.render(false);
            }
        }
    }

    /** Register homebrew elements stored in a prescribed location in module flags */
    #registerModuleTags(): void {
        const activeModules = [...game.modules.entries()].filter(([_key, foundryModule]) => foundryModule.active);
        for (const [key, foundryModule] of activeModules) {
            const homebrew = foundryModule.flags?.[key]?.["xprpg-homebrew"];
            if (!isObject<Record<string, unknown>>(homebrew)) continue;

            for (const recordKey of Object.keys(homebrew)) {
                // some are handled elsewhere
                if (["damageTypes"].includes(recordKey)) continue;

                if (tupleHasValue(HOMEBREW_TRAIT_KEYS, recordKey)) {
                    const elements = homebrew[recordKey];
                    if (!isObject(elements) || !isHomebrewFlagCategory(elements)) {
                        console.warn(`XPRPG System | Homebrew record ${recordKey} is malformed in module ${key}`);
                        continue;
                    }

                    // A registered tag can be a string label or an object containing a label and description
                    const tags = Object.entries(elements).map(([id, value]) => ({
                        id: `hb_${id}`,
                        value: typeof value === "string" ? value : value.label,
                    })) as unknown as HomebrewTag[];
                    this.#updateConfigRecords(tags, recordKey);

                    // Register descriptions if present
                    for (const [key, value] of Object.entries(elements)) {
                        if (typeof value === "object") {
                            const hbKey = `hb_${key}` as unknown as keyof ConfigXPRPG["XPRPG"]["traitsDescriptions"];
                            CONFIG.XPRPG.traitsDescriptions[hbKey] = value.description;
                        }
                    }
                } else {
                    console.warn(`XPRPG System | Invalid homebrew record "${recordKey}" in module ${key}`);
                    continue;
                }
            }
        }
    }

    #getConfigRecord(recordKey: HomebrewTraitKey): Record<string, string> {
        return recordKey === "baseWeapons" ? CONFIG.XPRPG.baseWeaponTypes : CONFIG.XPRPG[recordKey];
    }

    #updateConfigRecords(elements: HomebrewTag[], listKey: HomebrewTraitKey): void {
        // The base-weapons map only exists in the localization file
        const coreElements: Record<string, string> = this.#getConfigRecord(listKey);
        for (const element of elements) {
            coreElements[element.id] = element.value;
            if (objectHasKey(SECONDARY_TRAIT_RECORDS, listKey)) {
                for (const recordKey of SECONDARY_TRAIT_RECORDS[listKey]) {
                    const record: Record<string, string> = CONFIG.XPRPG[recordKey];
                    record[element.id] = element.value;
                }
            }
        }
    }
}

/**
 * To update all custom damage types in the system, we need to ensure that all collections are added to and cleaned.
 * This reduces the scope of all damage related operations so that its easier to identify when something goes wrong.
 */
class DamageTypeManager {
    // All collections that homebrew damage must be updated in
    collections = {
        physical: PHYSICAL_DAMAGE_TYPES as unknown as string[],
        energy: ENERGY_DAMAGE_TYPES as unknown as string[],
        DAMAGE_TYPES,
        BASE_DAMAGE_TYPES_TO_CATEGORIES,
        DAMAGE_TYPE_ICONS,
        damageTypesLocalization: CONFIG.XPRPG.damageTypes,
        damageRollFlavorsLocalization: CONFIG.XPRPG.damageRollFlavors,
        immunityTypes: immunityTypes as Record<string, string>,
        weaknessTypes: weaknessTypes as Record<string, string>,
        resistanceTypes: resistanceTypes as Record<string, string>,
    };

    addCustomDamage(data: CustomDamageData, options: { slug?: string } = {}) {
        const collections = this.collections;
        const slug = `hb_${options.slug ?? sluggify(data.label)}` as DamageType;
        collections.DAMAGE_TYPES.add(slug);
        collections[tupleHasValue(["physical", "energy"], data.category) ? data.category : "physical"].push(slug);
        collections.BASE_DAMAGE_TYPES_TO_CATEGORIES[slug] = data.category;
        collections.DAMAGE_TYPE_ICONS[slug] = data.icon?.substring(3) ?? null; // icons registered do not include the fa-
        collections.damageTypesLocalization[slug] = data.label;

        const damageFlavor = data.label.toLocaleLowerCase();
        collections.damageRollFlavorsLocalization[slug] = damageFlavor;
        collections.immunityTypes[slug] = damageFlavor;
        collections.weaknessTypes[slug] = damageFlavor;
        collections.resistanceTypes[slug] = damageFlavor;
    }

    deleteAllHomebrew() {
        for (const collection of Object.values(this.collections)) {
            if (collection instanceof Set) {
                const hbTraits = [...collection].filter((tag) => tag.startsWith("hb_"));
                for (const trait of hbTraits) collection.delete(trait);
            } else {
                const hbTraits = Object.keys(collection).filter((tag): tag is keyof typeof collection =>
                    tag.startsWith("hb_")
                );
                for (const trait of hbTraits) delete collection[trait];
            }
        }
    }
}

type HomebrewSubmitData = {
    damageTypes: CustomDamageData[];
} & Record<string, unknown>;

interface HomebrewElements extends SettingsMenuXPRPG {
    constructor: typeof HomebrewElements;
    cache: HomebrewSubmitData;
}

export { HomebrewElements };
