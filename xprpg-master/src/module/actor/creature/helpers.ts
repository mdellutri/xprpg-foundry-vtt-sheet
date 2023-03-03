import { ImmunityData } from "@actor/data/iwr";
import { CreatureXPRPG } from "./document";

function setTraitIWR(actor: CreatureXPRPG): void {
    if (actor.isOfType("character")) return;

    const { traits } = actor;
    const { immunities } = actor.attributes;
    if (traits.has("mindless") && !immunities.some((i) => i.type === "mental")) {
        immunities.push(new ImmunityData({ type: "mental" }));
    }
}

export { setTraitIWR };
