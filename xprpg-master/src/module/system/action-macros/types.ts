import { ActorXPRPG, CreatureXPRPG } from "@actor";
import { ModifierXPRPG, StatisticModifier } from "@actor/modifiers";
import { WeaponTrait } from "@item/weapon/types";
import { RollNoteXPRPG } from "@module/notes";
import { TokenDocumentXPRPG } from "@scene";
import { CheckRoll, CheckType } from "@system/check";
import { CheckDC, DegreeOfSuccessString } from "@system/degree-of-success";
import { Statistic } from "@system/statistic";
import { ItemXPRPG } from "@item";

type ActionGlyph = "A" | "D" | "T" | "R" | "F" | "a" | "d" | "t" | "r" | "f" | 1 | 2 | 3 | "1" | "2" | "3";

class CheckContextError extends Error {
    constructor(message: string, public actor: ActorXPRPG, public slug: string) {
        super(message);
    }
}

interface BuildCheckContextOptions<ItemType extends Embedded<ItemXPRPG>> {
    actor: ActorXPRPG;
    item?: ItemType;
    rollOptions: {
        contextual: string[];
        generic: string[];
    };
    target?: ActorXPRPG | null;
}

interface BuildCheckContextResult<ItemType extends Embedded<ItemXPRPG>> {
    actor: ActorXPRPG;
    item?: ItemType;
    rollOptions: string[];
    target?: ActorXPRPG | null;
}

interface CheckContextOptions<ItemType extends Embedded<ItemXPRPG>> {
    actor: ActorXPRPG;
    buildContext: (options: BuildCheckContextOptions<ItemType>) => BuildCheckContextResult<ItemType>;
    target?: ActorXPRPG | null;
}

interface CheckContext<ItemType extends Embedded<ItemXPRPG>> {
    actor: ActorXPRPG;
    item?: ItemType;
    modifiers?: ModifierXPRPG[];
    rollOptions: string[];
    slug: string;
    statistic: StatisticModifier & { rank?: number };
    subtitle: string;
    type: CheckType;
}

interface CheckResultCallback {
    actor: ActorXPRPG;
    message?: ChatMessage;
    outcome: DegreeOfSuccessString | null | undefined;
    roll: Rolled<CheckRoll>;
}

interface SimpleRollActionCheckOptions<ItemType extends Embedded<ItemXPRPG>> {
    actors: ActorXPRPG | ActorXPRPG[] | undefined;
    actionGlyph: ActionGlyph | undefined;
    title: string;
    checkContext: (
        context: CheckContextOptions<ItemType>
    ) => Promise<CheckContext<ItemType>> | CheckContext<ItemType> | undefined;
    content?: (title: string) => Promise<string | null | undefined | void> | string | null | undefined | void;
    item?: (actor: ActorXPRPG) => ItemType | undefined;
    traits: string[];
    event: JQuery.TriggeredEvent;
    difficultyClass?: CheckDC;
    difficultyClassStatistic?: (creature: CreatureXPRPG) => Statistic | null;
    extraNotes?: (selector: string) => RollNoteXPRPG[];
    callback?: (result: CheckResultCallback) => void;
    createMessage?: boolean;
    weaponTrait?: WeaponTrait;
    weaponTraitWithPenalty?: WeaponTrait;
    target?: () => { token: TokenDocumentXPRPG; actor: ActorXPRPG } | null;
}

interface ActionDefaultOptions {
    event: JQuery.TriggeredEvent;
    actors?: ActorXPRPG | ActorXPRPG[];
    glyph?: ActionGlyph;
    modifiers?: ModifierXPRPG[];
    callback?: (result: CheckResultCallback) => void;
}

interface SkillActionOptions extends ActionDefaultOptions {
    skill?: string;
    difficultyClass?: CheckDC;
}

export {
    ActionGlyph,
    CheckContext,
    CheckContextError,
    CheckContextOptions,
    CheckResultCallback,
    SimpleRollActionCheckOptions,
    ActionDefaultOptions,
    SkillActionOptions,
};
