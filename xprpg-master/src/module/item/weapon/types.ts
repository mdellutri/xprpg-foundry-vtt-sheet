import { PreciousMaterialType } from "@item/physical/types";
import { LocalizeXPRPG } from "@system/localize";
import {
    MELEE_WEAPON_GROUPS,
    WEAPON_CATEGORIES,
    WEAPON_GROUPS,
    WEAPON_PROPERTY_RUNE_TYPES,
    WEAPON_RANGES,
} from "./values";

type WeaponPropertyRuneType = SetElement<typeof WEAPON_PROPERTY_RUNE_TYPES>;

type WeaponCategory = SetElement<typeof WEAPON_CATEGORIES>;
type MeleeWeaponGroup = SetElement<typeof MELEE_WEAPON_GROUPS>;

type WeaponGroup = SetElement<typeof WEAPON_GROUPS>;
type BaseWeaponType = keyof typeof LocalizeXPRPG.translations.XPRPG.Weapon.Base;

type WeaponTrait = keyof ConfigXPRPG["XPRPG"]["weaponTraits"];
type OtherWeaponTag = "crossbow" | "improvised" | "shoddy";

type WeaponRangeIncrement = SetElement<typeof WEAPON_RANGES>;
type WeaponReloadTime = "-" | "0" | "1" | "2" | "3" | "10";

type StrikingRuneType = "striking" | "greaterStriking" | "majorStriking";

type WeaponMaterialType = Exclude<PreciousMaterialType, "dragonhide" | "grisantian-pelt">;

export {
    BaseWeaponType,
    MeleeWeaponGroup,
    OtherWeaponTag,
    StrikingRuneType,
    WeaponCategory,
    WeaponGroup,
    WeaponMaterialType,
    WeaponPropertyRuneType,
    WeaponRangeIncrement,
    WeaponReloadTime,
    WeaponTrait,
};
