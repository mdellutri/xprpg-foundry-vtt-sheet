import { AncestryXPRPG, HeritageXPRPG, ItemXPRPG } from "@item";
import { ItemSheetXPRPG } from "@item/sheet/base";
import { HeritageSheetData } from "@item/sheet/data-types";
import { ErrorXPRPG, sluggify } from "@util";
import { UUIDUtils } from "@util/uuid-utils";

export class HeritageSheetXPRPG extends ItemSheetXPRPG<HeritageXPRPG> {
    static override get defaultOptions(): DocumentSheetOptions {
        return {
            ...super.defaultOptions,
            dragDrop: [{ dropSelector: ".sheet-sidebar" }],
        };
    }

    override async getData(options?: Partial<DocumentSheetOptions>): Promise<HeritageSheetData> {
        const sheetData = await super.getData(options);
        const ancestry = await (async (): Promise<AncestryXPRPG | null> => {
            const item = this.item.system.ancestry ? await UUIDUtils.fromUuid(this.item.system.ancestry.uuid) : null;
            return item instanceof AncestryXPRPG ? item : null;
        })();

        return {
            ...sheetData,
            ancestry,
            ancestryRefBroken: !!sheetData.data.ancestry && ancestry === null,
            hasSidebar: true,
            hasDetails: false,
            sidebarTemplate: () => "systems/xprpg/templates/items/heritage-sidebar.hbs",
        };
    }

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);

        // Remove ancestry reference
        $html.find('a[data-action="remove-ancestry"]').on("click", () => {
            this.item.update({ "system.ancestry": null });
        });
    }

    override async _onDrop(event: ElementDragEvent): Promise<void> {
        const item = await (async (): Promise<ItemXPRPG | null> => {
            try {
                const dataString = event.dataTransfer?.getData("text/plain");
                const dropData = JSON.parse(dataString ?? "");
                return (await ItemXPRPG.fromDropData(dropData)) ?? null;
            } catch {
                return null;
            }
        })();
        if (!(item instanceof AncestryXPRPG)) {
            throw ErrorXPRPG("Invalid item drop on heritage sheet");
        }

        const ancestryReference = {
            name: item.name,
            slug: item.slug ?? sluggify(item.name),
            uuid: item.uuid,
        };

        await this.item.update({ "system.ancestry": ancestryReference });
    }
}
