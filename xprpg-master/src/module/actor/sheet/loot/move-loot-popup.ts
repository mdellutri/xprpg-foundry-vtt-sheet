import { ActorXPRPG } from "@actor/base";

class MoveLootPopup extends FormApplication<{}, MoveLootOptions> {
    onSubmitCallback: MoveLootCallback;

    constructor(object: ActorXPRPG, options: Partial<MoveLootOptions>, callback: MoveLootCallback) {
        super(object, options);

        this.onSubmitCallback = callback;
    }

    override async getData() {
        const [prompt, buttonLabel] = this.options.isPurchase
            ? ["XPRPG.loot.PurchaseLootMessage", "XPRPG.loot.PurchaseLoot"]
            : ["XPRPG.loot.MoveLootMessage", "XPRPG.loot.MoveLoot"];

        return {
            ...(await super.getData()),
            maxQuantity: this.options.maxQuantity,
            newStack: this.options.newStack,
            lockStack: this.options.lockStack,
            prompt,
            buttonLabel,
        };
    }

    static override get defaultOptions(): MoveLootOptions {
        return {
            ...super.defaultOptions,
            id: "MoveLootPopup",
            classes: [],
            title: game.i18n.localize("XPRPG.loot.MoveLootPopupTitle"),
            template: "systems/xprpg/templates/popups/loot/move-loot-popup.hbs",
            width: "auto",
            maxQuantity: 1,
            newStack: false,
            lockStack: false,
            isPurchase: false,
        };
    }

    override async _updateObject(
        _event: ElementDragEvent,
        formData: Record<string, unknown> & MoveLootFormData
    ): Promise<void> {
        this.onSubmitCallback(formData.quantity, formData.newStack);
    }
}

interface MoveLootOptions extends FormApplicationOptions {
    maxQuantity: number;
    newStack: boolean;
    lockStack: boolean;
    isPurchase: boolean;
}

interface MoveLootFormData extends FormData {
    quantity: number;
    newStack: boolean;
}

type MoveLootCallback = (quantity: number, newStack: boolean) => void;

export { MoveLootPopup };
