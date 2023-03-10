import { Coins } from "@item/physical/data";
import { ActorXPRPG } from "@actor";

interface PopupFormData extends Coins {
    removeByValue: boolean;
}

/**
 * @category Other
 */
export class RemoveCoinsPopup extends FormApplication<ActorXPRPG> {
    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "remove-coins";
        options.classes = [];
        options.title = "Remove Coins";
        options.template = "systems/xprpg/templates/actors/remove-coins.hbs";
        options.width = "auto";
        return options;
    }

    override async _updateObject(_event: Event, formData: Record<string, unknown> & PopupFormData) {
        const actor = this.object;
        const coinsToRemove = {
            pp: formData.pp,
            gp: formData.gp,
            sp: formData.sp,
            cp: formData.cp,
        };

        if (!(await actor.inventory.removeCoins(coinsToRemove, { byValue: formData.removeByValue }))) {
            ui.notifications.warn("XPRPG.ErrorMessage.NotEnoughCoins", { localize: true });
        }
    }
}
