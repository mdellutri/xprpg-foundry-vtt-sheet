import { AbilityString } from "@actor/types";
import { AncestryXPRPG, BackgroundXPRPG, ClassXPRPG, FeatXPRPG, ItemXPRPG } from "@item";
import { ABCFeatureEntryData } from "@item/abc/data";
import { FeatType } from "@item/feat/data";
import { ItemSheetDataXPRPG } from "@item/sheet/data-types";
import { LocalizeXPRPG } from "@system/localize";
import { ABCItemXPRPG } from ".";
import { ItemSheetXPRPG } from "../sheet/base";

abstract class ABCSheetXPRPG<TItem extends ABCItem> extends ItemSheetXPRPG<TItem> {
    static override get defaultOptions(): DocumentSheetOptions {
        return {
            ...super.defaultOptions,
            scrollY: [".item-details"],
            dragDrop: [{ dropSelector: ".item-details" }],
        };
    }

    override async getData(options?: Partial<DocumentSheetOptions>): Promise<ABCSheetData<TItem>> {
        const itemType = this.item.type;

        const sheetData = await super.getData(options);
        // Exclude any added during data preparation
        const features = Object.entries(this.item.toObject().system.items)
            .map(([key, ref]) => ({
                key,
                item: { ...ref, fromWorld: ref.uuid.startsWith("Item.") },
            }))
            .sort((a, b) => a.item.level - b.item.level);

        return {
            ...sheetData,
            hasSidebar: itemType === "ancestry",
            sidebarTemplate: () => `systems/xprpg/templates/items/${itemType}-sidebar.hbs`,
            hasDetails: true,
            detailsTemplate: () => `systems/xprpg/templates/items/${itemType}-details.hbs`,
            features,
        };
    }

    protected getLocalizedAbilities(traits: { value: AbilityString[] }): { [key: string]: string } {
        if (traits !== undefined && traits.value) {
            if (traits.value.length === 6) return { free: game.i18n.localize("XPRPG.AbilityFree") };
            return Object.fromEntries(traits.value.map((x: AbilityString) => [x, CONFIG.XPRPG.abilities[x]]));
        }

        return {};
    }

    /** Is the dropped feat or feature valid for the given section? */
    #isValidDrop(event: ElementDragEvent, feat: FeatXPRPG): boolean {
        const validFeatTypes: FeatType[] = $(event.target).closest(".abc-list").data("valid-drops")?.split(" ") ?? [];
        if (validFeatTypes.includes(feat.featType)) {
            return true;
        }

        const goodTypes = validFeatTypes.map((featType) => game.i18n.localize(CONFIG.XPRPG.featTypes[featType]));
        if (goodTypes.length === 1) {
            const badType = game.i18n.localize(CONFIG.XPRPG.featTypes[feat.featType]);
            const warning = game.i18n.format(LocalizeXPRPG.translations.XPRPG.Item.ABC.InvalidDrop, {
                badType,
                goodType: goodTypes[0],
            });
            ui.notifications.warn(warning);
            return false;
        }

        // No feat/feature type restriction value, so let it through
        return true;
    }

    protected override async _onDrop(event: ElementDragEvent): Promise<void> {
        event.preventDefault();
        const dataString = event.dataTransfer?.getData("text/plain");
        const dropData = JSON.parse(dataString ?? "");
        const item = await ItemXPRPG.fromDropData(dropData);

        if (!item?.isOfType("feat") || !this.#isValidDrop(event, item)) {
            return;
        }

        const entry: ABCFeatureEntryData = {
            uuid: item.uuid,
            img: item.img,
            name: item.name,
            level: item.level,
        };

        const items = this.item.system.items;
        const pathPrefix = "system.items";

        let id: string;
        do {
            id = randomID(5);
        } while (items[id]);

        await this.item.update({
            [`${pathPrefix}.${id}`]: entry,
        });
    }

    private removeItem(event: JQuery.ClickEvent): void {
        event.preventDefault();
        const target = $(event.target).parents("li");
        const containerId = target.parents("[data-container-id]").data("containerId");
        let path = `-=${target.data("index")}`;
        if (containerId) {
            path = `${containerId}.items.${path}`;
        }

        this.item.update({
            [`system.items.${path}`]: null,
        });
    }

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);
        $html.on("click", "[data-action=remove]", (ev) => this.removeItem(ev));
    }
}

type ABCItem = AncestryXPRPG | BackgroundXPRPG | ClassXPRPG;

interface ABCSheetData<TItem extends ABCItemXPRPG> extends ItemSheetDataXPRPG<TItem> {
    hasDetails: true;
    features: { key: string; item: FeatureSheetData }[];
}

interface FeatureSheetData extends ABCFeatureEntryData {
    fromWorld: boolean;
}

export { ABCSheetData, ABCSheetXPRPG };
