import type { CharacterData, CharacterSource } from "@actor/character/data";
import { CreatureType } from "@actor/creature/data";
import type { FamiliarData, FamiliarSource } from "@actor/familiar/data";
import type { HazardData, HazardSource } from "@actor/hazard/data";
import type { LootData, LootSource } from "@actor/loot/data";
import type { NPCData, NPCSource } from "@actor/npc/data";
import type { PartyData } from "@actor/party/data";
import type { VehicleData, VehicleSource } from "@actor/vehicle/data";

type CreatureData = CharacterData | NPCData | FamiliarData;
type ActorType = CreatureType | "hazard" | "loot" | "party" | "vehicle";

type ActorDataXPRPG = CreatureData | HazardData | LootData | PartyData | VehicleData;
type ActorSourceXPRPG = ActorDataXPRPG["_source"];

interface RollInitiativeOptionsXPRPG extends RollInitiativeOptions {
    secret?: boolean;
    skipDialog?: boolean;
}
export {
    ActorDataXPRPG,
    ActorSourceXPRPG,
    ActorType,
    CharacterData,
    CharacterSource,
    CreatureData,
    FamiliarData,
    FamiliarSource,
    HazardData,
    HazardSource,
    LootData,
    LootSource,
    NPCData,
    NPCSource,
    RollInitiativeOptionsXPRPG,
    VehicleData,
    VehicleSource,
};
