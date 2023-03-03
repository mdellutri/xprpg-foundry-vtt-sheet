import { HazardXPRPG } from "@actor";
import { TraitViewData } from "@actor/data/base";
import { ActorSheetDataXPRPG } from "@actor/sheet/data-types";
import { SaveType } from "@actor/types";
import { ActionItemXPRPG } from "@item";

interface HazardSheetData extends ActorSheetDataXPRPG<HazardXPRPG> {
    actions: HazardActionSheetData;
    editing: boolean;
    actorTraits: TraitViewData[];
    rarity: Record<string, string>;
    rarityLabel: string;
    brokenThreshold: number;
    saves: HazardSaveSheetData[];
    stealthDC: number | null;

    hasDefenses: boolean;
    hasHPDetails: boolean;
    hasSaves: boolean;
    hasIWR: boolean;
    hasStealth: boolean;
    hasStealthDescription: boolean;
    hasDescription: boolean;
    hasDisable: boolean;
    hasRoutineDetails: boolean;
    hasResetDetails: boolean;
}

interface HazardActionSheetData {
    reaction: ActionItemXPRPG[];
    action: ActionItemXPRPG[];
}

interface HazardSaveSheetData {
    label: string;
    type: SaveType;
    mod?: number;
}

type HazardTrait = keyof ConfigXPRPG["XPRPG"]["hazardTraits"];

export { HazardActionSheetData, HazardSaveSheetData, HazardSheetData, HazardTrait };
