import { ActorDataXPRPG, CreatureData } from ".";

export function isCreatureData(actorData: ActorDataXPRPG): actorData is CreatureData {
    return ["character", "npc", "familiar"].includes(actorData.type);
}
