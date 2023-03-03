import { LocalizeXPRPG } from "@system/localize";

type ArmorTrait = keyof ConfigXPRPG["XPRPG"]["armorTraits"];
type ArmorCategory = keyof ConfigXPRPG["XPRPG"]["armorTypes"];
type ArmorGroup = keyof ConfigXPRPG["XPRPG"]["armorGroups"];
type BaseArmorType = keyof typeof LocalizeXPRPG.translations.XPRPG.Item.Armor.Base;
type ResilientRuneType = "" | "resilient" | "greaterResilient" | "majorResilient";
type OtherArmorTag = "shoddy";

export { ArmorTrait, ArmorCategory, ArmorGroup, BaseArmorType, ResilientRuneType, OtherArmorTag };
