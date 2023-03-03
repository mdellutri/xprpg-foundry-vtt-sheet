import { CharacterXPRPG } from "@actor";
import { CreatureSheetData } from "@actor/creature/types";
import { FamiliarXPRPG } from ".";

interface FamiliarSheetData extends CreatureSheetData<FamiliarXPRPG> {
    master: CharacterXPRPG | null;
    masters: CharacterXPRPG[];
    abilities: ConfigXPRPG["XPRPG"]["abilities"];
    size: string;
    familiarAbilities: { value: number };
}

export { FamiliarSheetData };
