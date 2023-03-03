import {
    ActorSystemData,
    ActorAttributes,
    BaseActorDataXPRPG,
    BaseActorSourceXPRPG,
    BaseHitPointsSource,
    ActorTraitsData,
    ActorSystemSource,
    ActorDetailsSource,
    ActorHitPoints,
} from "@actor/data/base";
import { ActorSizeXPRPG } from "@actor/data/size";
import { StatisticTraceData } from "@system/statistic";
import { VehicleXPRPG } from ".";
import { VehicleTrait } from "./types";

/** The stored source data of a vehicle actor */
type VehicleSource = BaseActorSourceXPRPG<"vehicle", VehicleSystemSource>;

type VehicleData = Omit<VehicleSource, "effects" | "flags" | "items" | "prototypeToken"> &
    BaseActorDataXPRPG<VehicleXPRPG, "vehicle", VehicleSource>;

interface VehicleHitPointsData extends Required<BaseHitPointsSource> {
    brokenThreshold: number;
    negativeHealing: false;
}

interface VehicleAttributesSource extends ActorAttributes {
    ac: { value: number };
    hardness: number;
    hp: VehicleHitPointsData;
}

interface VehicleSystemSource extends ActorSystemSource {
    attributes: VehicleAttributesSource;
    details: VehicleDetailsSource;
    saves: {
        fortitude: VehicleFortitudeSaveData;
    };

    traits: VehicleTraitsData;
}

interface VehicleDetailsSource extends ActorDetailsSource {
    description: string;
    level: {
        value: number;
    };
    alliance: null;
    price: number;
    space: {
        long: number;
        wide: number;
        high: number;
    };
    crew: string;
    passengers: string;
    pilotingCheck: string;
    AC: number;
    speed: number;
}

/** The system-level data of vehicle actors. */
interface VehicleSystemData extends VehicleSystemSource, Omit<ActorSystemData, "details" | "traits"> {
    attributes: VehicleAttributes;
}

interface VehicleAttributes extends VehicleAttributesSource, ActorAttributes {
    ac: StatisticTraceData;
    hp: VehicleHitPoints;
    shield?: never;
}

interface VehicleHitPoints extends ActorHitPoints {
    negativeHealing: false;
    brokenThreshold: number;
}

interface VehicleFortitudeSaveData extends StatisticTraceData {
    saveDetail: string;
}

interface VehicleTraitsData extends ActorTraitsData<VehicleTrait> {
    rarity: keyof ConfigXPRPG["XPRPG"]["rarityTraits"];
    size: ActorSizeXPRPG;
}

interface TokenDimensions {
    width: number;
    height: number;
}

export { VehicleData, VehicleSource, VehicleSystemData, VehicleTrait, TokenDimensions };
