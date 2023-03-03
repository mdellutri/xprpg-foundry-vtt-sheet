import { ActorSheetDataXPRPG } from "@actor/sheet/data-types";
import { MeleeXPRPG, WeaponXPRPG } from "@item";
import { SpellcastingEntryData } from "@item/data";
import { SpellcastingAbilityData } from "@item/spellcasting-entry/data";
import { CreatureXPRPG } from ".";
import { SheetOptions } from "@module/sheet/helpers";
import { ALIGNMENTS, ALIGNMENT_TRAITS } from "./values";
import { FlattenedCondition } from "@system/conditions";
import { ActorUpdateContext } from "@actor/base";
import { AbilityData, CreatureSystemData, SaveData, SkillData } from "./data";
import { ZeroToFour } from "@module/data";
import { AbilityString, SaveType } from "@actor/types";

type Alignment = SetElement<typeof ALIGNMENTS>;
type AlignmentTrait = SetElement<typeof ALIGNMENT_TRAITS>;
type CreatureTrait = keyof ConfigXPRPG["XPRPG"]["creatureTraits"] | AlignmentTrait;

type ModeOfBeing = "living" | "undead" | "construct" | "object";

interface GetReachParameters {
    action?: "interact" | "attack";
    weapon?: WeaponXPRPG | MeleeXPRPG | null;
}

interface IsFlatFootedParams {
    /** The circumstance potentially imposing the flat-footed condition */
    dueTo: "flanking" | "surprise" | "hidden" | "undetected";
}

interface CreatureUpdateContext<T extends CreatureXPRPG> extends ActorUpdateContext<T> {
    allowHPOverage?: boolean;
}

type WithRank = { icon?: string; hover?: string; rank: ZeroToFour };

interface CreatureSheetData<TActor extends CreatureXPRPG = CreatureXPRPG> extends ActorSheetDataXPRPG<TActor> {
    data: CreatureSystemData & {
        abilities: Record<AbilityString, AbilityData & { label?: string }>;
        attributes: {
            perception: CreatureSystemData["attributes"]["perception"] & WithRank;
        };
        saves: Record<SaveType, SaveData & WithRank>;
        skills: Record<string, SkillData & WithRank>;
    };
    languages: SheetOptions;
    abilities: ConfigXPRPG["XPRPG"]["abilities"];
    skills: ConfigXPRPG["XPRPG"]["skills"];
    actorSizes: ConfigXPRPG["XPRPG"]["actorSizes"];
    alignments: { [K in Alignment]?: string };
    rarity: ConfigXPRPG["XPRPG"]["rarityTraits"];
    frequencies: ConfigXPRPG["XPRPG"]["frequencies"];
    attitude: ConfigXPRPG["XPRPG"]["attitude"];
    xpsFactions: ConfigXPRPG["XPRPG"]["xpsFactions"];
    conditions: FlattenedCondition[];
    dying: {
        maxed: boolean;
        remainingDying: number;
        remainingWounded: number;
    };
}

type SpellcastingSheetData = RawObject<SpellcastingEntryData> & SpellcastingAbilityData;

export {
    Alignment,
    AlignmentTrait,
    CreatureSheetData,
    CreatureTrait,
    CreatureUpdateContext,
    GetReachParameters,
    IsFlatFootedParams,
    ModeOfBeing,
    SpellcastingSheetData,
};
