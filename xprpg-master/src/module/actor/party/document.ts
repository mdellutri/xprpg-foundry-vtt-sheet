import { ActorXPRPG, CharacterXPRPG } from "@actor";
import { PartyData, PartySystemData } from "./data";

class PartyXPRPG extends ActorXPRPG {
    /** Friendship lives in our hearts */
    override get canAct(): false {
        return false;
    }

    get members(): (CharacterXPRPG | null)[] {
        return this.system.details.members
            .map((uuid) => fromUuidSync(uuid))
            .map((a): CharacterXPRPG | null => (a instanceof ActorXPRPG && a.isOfType("character") ? a : null));
    }

    /** Our bond is unbreakable */
    override isAffectedBy(): false {
        return false;
    }
}

interface PartyXPRPG extends ActorXPRPG {
    readonly data: PartyData;
    readonly system: PartySystemData;
}

export { PartyXPRPG };
