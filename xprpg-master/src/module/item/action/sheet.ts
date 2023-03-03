import { ActionItemXPRPG } from "@item/action";
import { ItemSheetDataXPRPG } from "@item/sheet/data-types";
import { getActionIcon } from "@util";
import { ItemSheetXPRPG } from "../sheet/base";

export class ActionSheetXPRPG extends ItemSheetXPRPG<ActionItemXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<ActionSheetData> {
        const data = await super.getData(options);

        // Update icon based on the action cost
        data.item.img = getActionIcon(this.item.actionCost);

        return {
            ...data,
            categories: CONFIG.XPRPG.actionCategories,
            actionTypes: CONFIG.XPRPG.actionTypes,
            actionsNumber: CONFIG.XPRPG.actionsNumber,
            actionTraits: CONFIG.XPRPG.actionTraits,
            frequencies: CONFIG.XPRPG.frequencies,
            skills: CONFIG.XPRPG.skillList,
            proficiencies: CONFIG.XPRPG.proficiencyLevels,
        };
    }

    override activateListeners($html: JQuery<HTMLElement>): void {
        super.activateListeners($html);

        $html.find("[data-action=frequency-add]").on("click", () => {
            const per = CONFIG.XPRPG.frequencies.day;
            this.item.update({ system: { frequency: { max: 1, per } } });
        });

        $html.find("[data-action=frequency-delete]").on("click", () => {
            this.item.update({ "system.-=frequency": null });
        });
    }
}

interface ActionSheetData extends ItemSheetDataXPRPG<ActionItemXPRPG> {
    categories: ConfigXPRPG["XPRPG"]["actionCategories"];
    actionTypes: ConfigXPRPG["XPRPG"]["actionTypes"];
    actionsNumber: ConfigXPRPG["XPRPG"]["actionsNumber"];
    actionTraits: ConfigXPRPG["XPRPG"]["actionTraits"];
    frequencies: ConfigXPRPG["XPRPG"]["frequencies"];
    skills: ConfigXPRPG["XPRPG"]["skillList"];
    proficiencies: ConfigXPRPG["XPRPG"]["proficiencyLevels"];
}
