import { CreatureXPRPG } from "@actor";
import { TokenXPRPG } from "@module/canvas";
import { eventToRollParams } from "@scripts/sheet-util";

export async function perceptionForSelected(event: JQuery.ClickEvent): Promise<void> {
    const actors = canvas.tokens.controlled
        .filter(
            (t): t is TokenXPRPG & { actor: CreatureXPRPG } =>
                !!t.actor && ["character", "npc", "familiar"].includes(t.actor.type)
        )
        .map((t) => t.actor);
    if (actors.length === 0) {
        ui.notifications.error("You must select at least one PC/NPC token.");
        return;
    }

    const argsFromEvent = eventToRollParams(event);
    for (const actor of actors) {
        await actor.perception.roll({ ...argsFromEvent, traits: ["secret"] });
    }
}
