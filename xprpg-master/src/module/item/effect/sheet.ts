import { EffectBadge } from "@item/abstract-effect";
import { ItemSheetDataXPRPG } from "@item/sheet/data-types";
import { htmlQuery, htmlQueryAll } from "@util";
import { EffectXPRPG, EffectSource } from ".";
import { ItemSheetXPRPG } from "../sheet/base";

export class EffectSheetXPRPG extends ItemSheetXPRPG<EffectXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<EffectSheetData> {
        const badge = this.item.badge;

        return {
            ...(await super.getData(options)),
            hasSidebar: true,
            hasDetails: false,
            itemType: game.i18n.localize("XPRPG.LevelLabel"),
            badgeType: badge ? game.i18n.localize(`XPRPG.Item.Effect.BadgeType.${badge.type}`) : "",
            timeUnits: CONFIG.XPRPG.timeUnits,
        };
    }

    override activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);
        const html = $html[0];

        // Prevent the form from submitting when the Badge Type select menu is changed
        htmlQuery(html, "select.badge-type")?.addEventListener("change", (event) => {
            event.stopPropagation();
        });

        htmlQuery(html, "[data-action=badge-add]")?.addEventListener("click", () => {
            const type = htmlQuery<HTMLSelectElement>(html, ".badge-type")?.value;
            const badge: EffectBadge =
                type === "formula"
                    ? { type: "formula", value: "1d20", evaluate: true }
                    : type === "labels"
                    ? { type: "counter", value: 1, labels: [""] }
                    : { type: "counter", value: 1 };
            this.item.update({ system: { badge } });
        });

        htmlQuery(html, "[data-action=badge-delete]")?.addEventListener("click", () => {
            this.item.update({ "system.-=badge": null });
        });

        htmlQuery(html, "[data-action=badge-add-label")?.addEventListener("click", () => {
            const labels = this.item.system.badge?.type === "counter" ? this.item.system.badge.labels : null;
            if (labels) {
                labels.push("");
                this.item.update({ system: { badge: { labels } } });
            }
        });

        for (const deleteIcon of htmlQueryAll(html, "[data-action=badge-delete-label]")) {
            const idx = Number(deleteIcon.dataset.idx);
            deleteIcon.addEventListener("click", () => {
                const labels = this.item.system.badge?.type === "counter" ? this.item.system.badge.labels : null;
                if (labels) {
                    labels.splice(idx, 1);
                    if (labels.length === 0) {
                        this.item.update({ "system.-=badge": null });
                    } else {
                        this.item.update({ system: { badge: { labels } } });
                    }
                }
            });
        }
    }

    protected override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
        // Ensure badge labels remain an array
        const expanded = expandObject(formData) as DeepPartial<EffectSource>;
        const badge = expanded.system?.badge;
        if (badge && "labels" in badge && typeof badge.labels === "object") {
            badge.labels = Object.values(badge.labels);
        }

        super._updateObject(event, flattenObject(expanded));
    }
}

interface EffectSheetData extends ItemSheetDataXPRPG<EffectXPRPG> {
    badgeType: string;
    timeUnits: ConfigXPRPG["XPRPG"]["timeUnits"];
}
