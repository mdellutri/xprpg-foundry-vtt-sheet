import { ItemXPRPG } from "@item/base";
import { LoreData } from "./data";

export class LoreXPRPG extends ItemXPRPG {}

export interface LoreXPRPG {
    readonly data: LoreData;
}
