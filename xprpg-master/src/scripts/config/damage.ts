import { DamageCategoryUnique, DamageType } from "@system/damage/types";
import { DAMAGE_TYPES } from "@system/damage/values";
import { pick } from "@util";
import { alignmentTraits, energyDamageTypes, preciousMaterials } from "./traits";

const damageCategoriesUnique: Record<DamageCategoryUnique, string> = {
    persistent: "XPRPG.ConditionTypePersistentShort",
    precision: "XPRPG.Damage.Precision",
    splash: "XPRPG.TraitSplash",
};

const materialDamageEffects = pick(preciousMaterials, [
    "abysium",
    "adamantine",
    "cold-iron",
    "djezet",
    "mithral",
    "noqual",
    "peachwood",
    "silver",
    "sisterstone-dusk",
    "sisterstone-scarlet",
    "sovereign-steel",
    "warpglass",
]);

const damageCategories = {
    ...damageCategoriesUnique,
    ...materialDamageEffects,
    alignment: "XPRPG.Alignment",
    energy: "XPRPG.TraitEnergy",
    physical: "XPRPG.TraitPhysical",
};

const physicalDamageTypes = {
    bleed: "XPRPG.TraitBleed",
    bludgeoning: "XPRPG.TraitBludgeoning",
    piercing: "XPRPG.TraitPiercing",
    slashing: "XPRPG.TraitSlashing",
};

const damageTypes: Record<DamageType, string> = {
    ...alignmentTraits,
    ...energyDamageTypes,
    ...physicalDamageTypes,
    mental: "XPRPG.TraitMental",
    poison: "XPRPG.TraitPoison",
    untyped: "XPRPG.TraitUntyped",
};

const damageRollFlavors = [...DAMAGE_TYPES].reduce((result, key) => {
    result[key] = `XPRPG.Damage.RollFlavor.${key}`;
    return result;
}, {} as Record<DamageType, string>);

export {
    damageCategories,
    damageCategoriesUnique,
    damageRollFlavors,
    damageTypes,
    materialDamageEffects,
    physicalDamageTypes,
};
