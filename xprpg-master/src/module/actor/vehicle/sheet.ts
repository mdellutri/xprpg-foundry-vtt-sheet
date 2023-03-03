import { ActorSheetXPRPG } from "../sheet/base";
import { VehicleXPRPG } from "@actor/vehicle";
import { ItemDataXPRPG } from "@item/data";
import { ErrorXPRPG, getActionIcon, htmlClosest, htmlQuery, htmlQueryAll } from "@util";
import { AbstractEffectXPRPG, EffectXPRPG } from "@item";
import { ActorSheetDataXPRPG } from "@actor/sheet/data-types";

export class VehicleSheetXPRPG extends ActorSheetXPRPG<VehicleXPRPG> {
    static override get defaultOptions(): ActorSheetOptions {
        const options = super.defaultOptions;
        return {
            ...options,
            classes: [...options.classes, "vehicle"],
            width: 670,
            height: 480,
            tabs: [{ navSelector: ".sheet-navigation", contentSelector: ".sheet-content", initial: "details" }],
            template: "systems/xprpg/templates/actors/vehicle/sheet.hbs",
        };
    }

    override async getData(): Promise<VehicleSheetData> {
        const sheetData = await super.getData();

        return {
            ...sheetData,
            actorSizes: CONFIG.XPRPG.actorSizes,
            actorSize: CONFIG.XPRPG.actorSizes[this.actor.size],
            actorRarities: CONFIG.XPRPG.rarityTraits,
            actorRarity: CONFIG.XPRPG.rarityTraits[this.actor.system.traits.rarity],
            ac: getAdjustment(this.actor.attributes.ac.value, this.actor._source.system.attributes.ac.value),
            saves: {
                fortitude: getAdjustment(
                    this.actor.saves.fortitude.mod,
                    this.actor._source.system.saves.fortitude.value
                ),
            },
        };
    }

    override async prepareItems(sheetData: VehicleSheetData): Promise<void> {
        const actorData = sheetData.actor;

        // Actions
        const actions: Record<"action" | "reaction" | "free", { label: string; actions: ItemDataXPRPG[] }> = {
            action: { label: game.i18n.localize("XPRPG.ActionsActionsHeader"), actions: [] },
            reaction: { label: game.i18n.localize("XPRPG.ActionsReactionsHeader"), actions: [] },
            free: { label: game.i18n.localize("XPRPG.ActionsFreeActionsHeader"), actions: [] },
        };

        for (const itemData of actorData.items) {
            const item = this.actor.items.get(itemData._id, { strict: true });
            if (item.isOfType("physical")) {
                const systemData = item.system;
                itemData.showEdit = sheetData.user.isGM || systemData.identification.status === "identified";
                itemData.isInvestable = false;
                itemData.isIdentified = systemData.identification.status === "identified";
                itemData.assetValue = item.assetValue;
                itemData.showEdit = true;
            }

            // Actions
            if (item.isOfType("action")) {
                itemData.img = getActionIcon(item.actionCost);
                const actionType = item.actionCost?.type ?? "free";
                actions[actionType].actions.push(itemData);
            }
        }

        actorData.actions = actions;
    }

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);
        const html = $html[0];

        // Ensure correct tab name is displayed after actor update
        const titleElem = htmlQuery(html, ".navigation-title");
        if (!titleElem) throw ErrorXPRPG("Unexpected missing DOM element");

        const initialTitle = htmlQuery(html, ".sheet-navigation .active")?.title;
        if (initialTitle) titleElem.title = initialTitle;

        for (const element of htmlQueryAll(html, ".sheet-navigation .item")) {
            element.addEventListener("mouseover", () => {
                titleElem.textContent = element.title;
            });

            element.addEventListener("mouseout", () => {
                const parent = htmlClosest(element, ".sheet-navigation");
                const title = htmlQuery(parent, ".item.active")?.title;
                if (title) titleElem.textContent = title;
            });
        }

        // Add tag selector listeners
        for (const element of htmlQueryAll(html, ".crb-tag-selector")) {
            element.addEventListener("click", (event) => this.openTagSelector(event));
        }

        // Change whether an effect is secret to players or not
        for (const element of htmlQueryAll(html, ".effects-list [data-action=effect-toggle-unidentified]")) {
            element.addEventListener("click", async () => {
                const effectId = htmlClosest(element, "[data-item-id]")?.dataset.itemId;
                const effect = this.actor.items.get(effectId, { strict: true });
                if (effect instanceof EffectXPRPG) {
                    const isUnidentified = effect.unidentified;
                    await effect.update({ "system.unidentified": !isUnidentified });
                }
            });
        }

        // Decrease effect value
        for (const element of htmlQueryAll(html, ".effects-list .decrement")) {
            element.addEventListener("click", async () => {
                const parent = htmlClosest(element, ".item");
                const effect = this.actor.items.get(parent?.dataset.dataItemId ?? "");
                if (effect instanceof AbstractEffectXPRPG) {
                    await effect.decrease();
                }
            });
        }

        // Increase effect value
        for (const element of htmlQueryAll(html, ".effects-list .increment")) {
            element.addEventListener("click", async () => {
                const parent = htmlClosest(element, ".item");
                const effect = this.actor?.items.get(parent?.dataset.dataItemId ?? "");
                if (effect instanceof AbstractEffectXPRPG) {
                    await effect.increase();
                }
            });
        }
    }
}

function getAdjustment(value: number, reference: number): AdjustedValue {
    const adjustmentClass = value > reference ? "adjusted-higher" : value < reference ? "adjusted-lower" : null;
    return { value, adjustmentClass };
}

interface AdjustedValue {
    value: number;
    adjustmentClass: "adjusted-higher" | "adjusted-lower" | null;
}

interface VehicleSheetData extends ActorSheetDataXPRPG<VehicleXPRPG> {
    actorRarities: typeof CONFIG.XPRPG.rarityTraits;
    actorRarity: string;
    actorSizes: typeof CONFIG.XPRPG.actorSizes;
    actorSize: string;
    ac: AdjustedValue;
    saves: { fortitude: AdjustedValue };
}
