import { EffectBadge } from "@item/abstract-effect";
import { EffectAuraData, EffectContextData, EffectTraits, TimeUnit } from "@item/abstract-effect/data";
import {
    BaseItemDataXPRPG,
    BaseItemSourceXPRPG,
    ItemFlagsXPRPG,
    ItemLevelData,
    ItemSystemData,
    ItemSystemSource,
} from "@item/data/base";
import { EffectXPRPG } from ".";

type EffectSource = BaseItemSourceXPRPG<"effect", EffectSystemSource> & {
    flags: DeepPartial<EffectFlags>;
};

type EffectData = Omit<EffectSource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<EffectXPRPG, "effect", EffectSystemData, EffectSource> & {
        flags: EffectFlags;
    };

type EffectFlags = ItemFlagsXPRPG & {
    xprpg: {
        aura?: EffectAuraData;
    };
};

interface EffectSystemSource extends Omit<ItemSystemSource, "traits">, ItemLevelData {
    traits: EffectTraits;
    start: {
        value: number;
        initiative: number | null;
    };
    duration: {
        value: number;
        unit: TimeUnit | "unlimited" | "encounter";
        sustained: boolean;
        expiry: EffectExpiryType | null;
    };
    tokenIcon: {
        show: boolean;
    };
    unidentified: boolean;
    target: string | null;
    expired?: boolean;
    /** A numeric value or dice expression of some rules significance to the effect */
    badge: EffectBadge | null;
    /** Origin, target, and roll context of the action that spawned this effect */
    context: EffectContextData | null;
}

interface EffectSystemData extends EffectSystemSource, Omit<ItemSystemData, "traits"> {
    expired: boolean;
    remaining: string;
}

type EffectExpiryType = "turn-start" | "turn-end";

export { EffectData, EffectExpiryType, EffectFlags, EffectSource, EffectSystemData };
