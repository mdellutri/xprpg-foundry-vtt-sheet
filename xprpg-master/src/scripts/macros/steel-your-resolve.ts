import { CharacterXPRPG } from "@actor/character";
import { LocalizeXPRPG } from "@system/localize";
import { ActionDefaultOptions } from "@system/action-macros";

export function steelYourResolve(options: ActionDefaultOptions): void {
    const translations = LocalizeXPRPG.translations.XPRPG.Actions.SteelYourResolve;

    const actors = Array.isArray(options.actors) ? options.actors : [options.actors];
    const actor = actors[0];
    if (actors.length > 1 || !(actor instanceof CharacterXPRPG)) {
        ui.notifications.error(translations.BadArgs);
        return;
    }

    const toChat = (alias: string, content: string) => {
        ChatMessage.create({
            user: game.user.id,
            content,
            speaker: { alias },
        });
    };

    const title = translations.Title;
    const content = translations.Content;

    if (!game.settings.get("xprpg", "staminaVariant")) {
        ui.notifications.error(translations.StaminaNotEnabled);
        return;
    }

    Dialog.confirm({
        title: title,
        content: content,
        yes: () => {
            const { resolve, sp } = actor.system.attributes;
            const spRatio = `${sp.value}/${sp.max}`;
            const recoverStamina = game.i18n.format(translations.RecoverStamina, {
                name: actor.name,
                ratio: spRatio,
            });
            const noStamina = game.i18n.format(translations.NoStamina, { name: actor.name });
            if (resolve.value > 0) {
                toChat(actor.name, recoverStamina);
                const newSP = sp.value + Math.floor(sp.max / 2);
                actor.update({
                    "system.attributes.sp.value": Math.min(newSP, sp.max),
                    "system.attributes.resolve.value": resolve.value - 1,
                });
            } else {
                toChat(actor.name, noStamina);
            }
        },
        defaultYes: true,
    });
}
