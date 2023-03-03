import { StrikeLookupData } from "@module/chat-message";
import { ZeroToThree } from "@module/data";
import { UserXPRPG } from "@module/user";
import { DegreeOfSuccessIndex } from "@system/degree-of-success";
import { RollDataXPRPG } from "@system/rolls";

class CheckRoll extends Roll {
    roller: UserXPRPG | null;

    isReroll: boolean;

    isRerollable: boolean;

    constructor(formula: string, data = {}, options: CheckRollDataXPRPG = {}) {
        super(formula, data, options);

        this.isReroll = options.isReroll ?? false;
        this.isRerollable =
            !this.isReroll && !this.dice.some((d) => d.modifiers.includes("kh") || d.modifiers.includes("kl"));
        this.roller = game.users.get(this.options.rollerId ?? "") ?? null;
    }

    get degreeOfSuccess(): DegreeOfSuccessIndex | null {
        return this.options.degreeOfSuccess ?? null;
    }
}

interface CheckRoll extends Roll {
    options: CheckRollDataXPRPG;
}

interface CheckRollDataXPRPG extends RollDataXPRPG {
    isReroll?: boolean;
    degreeOfSuccess?: ZeroToThree;
    strike?: StrikeLookupData;
}

export { CheckRoll, CheckRollDataXPRPG };
