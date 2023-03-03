import { ActorXPRPG } from "@actor";
import { AbilityString } from "@actor/types";
import { SpellXPRPG } from "@item";
import { BaseItemDataXPRPG, BaseItemSourceXPRPG, ItemSystemData, ItemSystemSource } from "@item/data/base";
import { MagicTradition } from "@item/spell/types";
import { OneToTen, ZeroToEleven, ZeroToFour } from "@module/data";
import { RollNoteXPRPG } from "@module/notes";
import { Statistic } from "@system/statistic";
import { SpellcastingEntryXPRPG } from "..";

interface BaseSpellcastingEntry {
    id: string;
    actor: ActorXPRPG | null;
    ability: AbilityString;
    tradition: MagicTradition | null;
    statistic: Statistic;
    cast(spell: SpellXPRPG, options: CastOptions): Promise<void>;
}

interface SpellcastingEntry extends BaseSpellcastingEntry {
    isPrepared: boolean;
    isSpontaneous: boolean;
    isInnate: boolean;
    isFocusPool: boolean;
}

interface CastOptions {
    message?: boolean;
    rollMode?: RollMode;
}

interface SpellcastingEntryXPRPGCastOptions extends CastOptions {
    consume?: boolean;
    /** The slot level to consume to cast the spell at */
    level?: number;
    slot?: number;
}

// temporary type until the spellcasting entry is migrated to no longer use slotX keys
type SlotKey = `slot${ZeroToEleven}`;

type SpellcastingEntrySource = BaseItemSourceXPRPG<"spellcastingEntry", SpellcastingEntrySystemSource>;

type SpellcastingEntryData = Omit<SpellcastingEntrySource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<SpellcastingEntryXPRPG, "spellcastingEntry", SpellcastingEntrySystemData, SpellcastingEntrySource>;

interface SpellAttackRollModifier {
    breakdown: string;
    notes: RollNoteXPRPG[];
    roll: Function;
    value: number;
}

interface SpellDifficultyClass {
    breakdown: string;
    notes: RollNoteXPRPG[];
    value: number;
}

interface SpellPrepData {
    id: string | null;
    expended?: boolean;
    name?: string;
    prepared?: boolean;
}

interface SpellSlotData {
    prepared: Record<number, SpellPrepData>;
    value: number;
    max: number;
}

type SpellcastingCategory = keyof ConfigXPRPG["XPRPG"]["preparationType"];

interface SpellcastingEntrySystemSource extends ItemSystemSource {
    ability: { value: AbilityString | "" };
    spelldc: {
        value: number;
        dc: number;
    };
    tradition: { value: MagicTradition | "" };
    prepared: SpellCollectionTypeSource;
    showSlotlessLevels: {
        value: boolean;
    };
    proficiency: {
        slug: string;
        value: ZeroToFour;
    };
    slots: Record<SlotKey, SpellSlotData>;
    autoHeightenLevel: {
        value: OneToTen | null;
    };
    traits?: never;
}

interface SpellCollectionTypeSource {
    value: SpellcastingCategory;
    flexible?: boolean;
    validItems?: "scroll" | "" | null;
}

interface SpellcastingEntrySystemData extends SpellcastingEntrySystemSource, Omit<ItemSystemData, "traits"> {
    prepared: SpellCollectionTypeData;
}

interface SpellCollectionTypeData extends SpellCollectionTypeSource {
    flexible: boolean;
    validItems: "scroll" | null;
}

export {
    BaseSpellcastingEntry,
    CastOptions,
    SpellcastingCategory,
    SlotKey,
    SpellAttackRollModifier,
    SpellDifficultyClass,
    SpellcastingEntry,
    SpellcastingEntryData,
    SpellcastingEntryXPRPGCastOptions,
    SpellcastingEntrySource,
    SpellcastingEntrySystemData,
    SpellcastingEntrySystemSource,
};
