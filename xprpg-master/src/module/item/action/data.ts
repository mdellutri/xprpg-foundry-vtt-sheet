import {
    ActionType,
    BaseItemDataXPRPG,
    BaseItemSourceXPRPG,
    Frequency,
    FrequencySource,
    ItemSystemData,
    ItemSystemSource,
    ItemTraits,
} from "@item/data/base";
import { ActionItemXPRPG } from ".";
import { OneToThree } from "@module/data";

type ActionItemSource = BaseItemSourceXPRPG<"action", ActionSystemSource>;

type ActionItemData = Omit<ActionItemSource, "system" | "effects" | "flags"> &
    BaseItemDataXPRPG<ActionItemXPRPG, "action", ActionSystemData, ActionItemSource>;

type ActionTrait = keyof ConfigXPRPG["XPRPG"]["actionTraits"];
interface ActionTraits extends ItemTraits<ActionTrait> {
    rarity?: never;
}

interface ActionSystemSource extends ItemSystemSource {
    traits: ActionTraits;
    actionType: {
        value: ActionType;
    };
    actionCategory: {
        value: string;
    };
    actions: {
        value: OneToThree | null;
    };
    requirements: {
        value: string;
    };
    trigger: {
        value: string;
    };
    deathNote: boolean;
    frequency?: FrequencySource;
}

interface ActionSystemData extends ActionSystemSource, Omit<ItemSystemData, "traits"> {
    frequency?: Frequency;
}

export { ActionItemSource, ActionItemData, ActionTrait, ActionTraits };
