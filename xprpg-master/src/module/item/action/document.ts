import { ItemXPRPG } from "@item/base";
import { ActionItemData, ActionItemSource } from "./data";
import { UserXPRPG } from "@module/user";
import { ActionCost, Frequency } from "@item/data/base";
import { ItemSummaryData } from "@item/data";

class ActionItemXPRPG extends ItemXPRPG {
    get actionCost(): ActionCost | null {
        const actionType = this.system.actionType.value || "passive";
        if (actionType === "passive") return null;

        return {
            type: actionType,
            value: this.system.actions.value,
        };
    }

    get frequency(): Frequency | null {
        return this.system.frequency ?? null;
    }

    override prepareBaseData(): void {
        super.prepareBaseData();

        // Initialize frequency uses if not set
        if (this.actor && this.system.frequency) {
            this.system.frequency.value ??= this.system.frequency.max;
        }
    }

    override async getChatData(
        this: Embedded<ActionItemXPRPG>,
        htmlOptions: EnrichHTMLOptions = {}
    ): Promise<ItemSummaryData> {
        const systemData = this.system;
        const actionType = this.actionCost?.type ?? "passive";
        const properties = [CONFIG.XPRPG.actionTypes[actionType]];
        const traits = this.traitChatData(CONFIG.XPRPG.featTraits);
        return this.processChatData(htmlOptions, { ...systemData, properties, traits });
    }

    protected override async _preCreate(
        data: PreDocumentId<ActionItemSource>,
        options: DocumentModificationContext<this>,
        user: UserXPRPG
    ): Promise<void> {
        // In case this was copied from an actor, clear any active frequency value
        if (!this.parent) {
            if (this._source.system.frequency) {
                this.updateSource({ "system.frequency.-=value": null });
            }
        }

        return super._preCreate(data, options, user);
    }

    protected override async _preUpdate(
        changed: DeepPartial<this["_source"]>,
        options: DocumentModificationContext<this>,
        user: UserXPRPG
    ): Promise<void> {
        // Normalize action data
        if (changed.system && ("actionType" in changed.system || "actions" in changed.system)) {
            const actionType = changed.system?.actionType?.value ?? this.system.actionType.value;
            const actionCount = Number(changed.system?.actions?.value ?? this.system.actions.value);
            changed.system = mergeObject(changed.system, {
                actionType: { value: actionType },
                actions: { value: actionType !== "action" ? null : Math.clamped(actionCount, 1, 3) },
            });
        }

        await super._preUpdate(changed, options, user);
    }
}

interface ActionItemXPRPG extends ItemXPRPG {
    readonly data: ActionItemData;
}

export { ActionItemXPRPG };
