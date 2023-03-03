import { CharacterXPRPG, NPCXPRPG } from "@actor";
import { EffectXPRPG } from "@item";
import { ChatMessageXPRPG } from "@module/chat-message";
import { ActionDefaultOptions } from "@system/action-macros";
import { LocalizeXPRPG } from "@system/localize";
import { ErrorXPRPG } from "@util";
import { UUIDUtils } from "@util/uuid-utils";

/** Effect: Raise a Shield */
const ITEM_UUID = "Compendium.xprpg.equipment-effects.2YgXoHvJfrDHucMr";

const TEMPLATES = {
    flavor: "./systems/xprpg/templates/chat/action/flavor.hbs",
    content: "./systems/xprpg/templates/chat/action/content.hbs",
};

/** A macro for the Raise a Shield action */
export async function raiseAShield(options: ActionDefaultOptions): Promise<void> {
    const translations = LocalizeXPRPG.translations.XPRPG.Actions.RaiseAShield;

    const actors = Array.isArray(options.actors) ? options.actors : [options.actors];
    const actor = actors[0];
    if (actors.length > 1 || !(actor instanceof CharacterXPRPG || actor instanceof NPCXPRPG)) {
        ui.notifications.error(translations.BadArgs);
        return;
    }

    const shield = actor.heldShield;
    const speaker = ChatMessageXPRPG.getSpeaker({ actor: actor });

    const isSuccess = await (async (): Promise<boolean> => {
        const existingEffect = actor.itemTypes.effect.find((e) => e.flags.core?.sourceId === ITEM_UUID);
        if (existingEffect) {
            await existingEffect.delete();
            return false;
        }

        if (shield?.isBroken === false) {
            const effect = await UUIDUtils.fromUuid(ITEM_UUID);
            if (!(effect instanceof EffectXPRPG)) {
                throw ErrorXPRPG("Raise a Shield effect not found");
            }
            await actor.createEmbeddedDocuments("Item", [effect.toObject()]);
            return true;
        } else if (shield?.isBroken) {
            ui.notifications.warn(
                game.i18n.format(translations.ShieldIsBroken, { actor: speaker.alias, shield: shield.name })
            );
            return false;
        } else {
            ui.notifications.warn(game.i18n.format(translations.NoShieldEquipped, { actor: speaker.alias }));
            return false;
        }
    })();

    if (isSuccess) {
        const combatActor = (game.combat?.started && game.combat.combatant?.actor) || null;
        const [actionType, glyph] =
            combatActor && combatActor !== actor ? (["Reaction", "R"] as const) : (["SingleAction", "1"] as const);

        const title = translations[`${actionType}Title` as const];

        const content = await renderTemplate(TEMPLATES.content, {
            imgPath: shield!.img,
            message: game.i18n.format(translations.Content, { actor: speaker.alias }),
        });
        const flavor = await renderTemplate(TEMPLATES.flavor, {
            action: { title, typeNumber: glyph },
        });

        await ChatMessageXPRPG.create({
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
            speaker,
            flavor,
            content,
        });
    }
}
