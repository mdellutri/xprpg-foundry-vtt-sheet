import { FeatXPRPG } from "@item/feat";
import { FeatSheetData } from "../sheet/data-types";
import { ItemSheetXPRPG } from "../sheet/base";
import Tagify from "@yaireo/tagify";

export class FeatSheetXPRPG extends ItemSheetXPRPG<FeatXPRPG> {
    override get validTraits(): Record<string, string> {
        return CONFIG.XPRPG.featTraits;
    }

    override async getData(options?: Partial<DocumentSheetOptions>): Promise<FeatSheetData> {
        const sheetData = await super.getData(options);

        const hasLineageTrait = this.item.traits.has("lineage");

        return {
            ...sheetData,
            hasSidebar: true,
            itemType: game.i18n.localize(this.item.isFeature ? "XPRPG.LevelLabel" : "XPRPG.Item.Feat.LevelLabel"),
            featTypes: CONFIG.XPRPG.featTypes,
            actionTypes: CONFIG.XPRPG.actionTypes,
            actionsNumber: CONFIG.XPRPG.actionsNumber,
            frequencies: CONFIG.XPRPG.frequencies,
            categories: CONFIG.XPRPG.actionCategories,
            damageTypes: { ...CONFIG.XPRPG.damageTypes, ...CONFIG.XPRPG.healingTypes },
            prerequisites: JSON.stringify(this.item.system.prerequisites?.value ?? []),
            isFeat: this.item.isFeat,
            mandatoryTakeOnce: hasLineageTrait || sheetData.data.onlyLevel1,
            hasLineageTrait,
        };
    }

    override activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        const html = $html[0];

        const prerequisites = html.querySelector<HTMLInputElement>('input[name="system.prerequisites.value"]');
        if (prerequisites) {
            new Tagify(prerequisites, {
                editTags: 1,
            });
        }

        html.querySelector<HTMLAnchorElement>("a[data-action=frequency-add]")?.addEventListener("click", () => {
            const per = CONFIG.XPRPG.frequencies.day;
            this.item.update({ system: { frequency: { max: 1, per } } });
        });

        html.querySelector("a[data-action=frequency-delete]")?.addEventListener("click", () => {
            this.item.update({ "system.-=frequency": null });
        });
    }

    protected override _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
        // This will be here until we migrate feat prerequisites to be a list of strings
        if (Array.isArray(formData["system.prerequisites.value"])) {
            formData["system.prerequisites.value"] = formData["system.prerequisites.value"].map((value) => ({ value }));
        }

        return super._updateObject(event, formData);
    }
}
