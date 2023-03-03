import { AutomaticBonusProgression as ABP } from "@actor/character/automatic-bonus-progression";
import { DamageDiceParameters, DamageDiceXPRPG, ModifierAdjustment } from "@actor/modifiers";
import { ResistanceType } from "@actor/types";
import { ArmorXPRPG, WeaponXPRPG } from "@item";
import type { ResilientRuneType } from "@item/armor/types";
import type { OtherWeaponTag, StrikingRuneType, WeaponPropertyRuneType, WeaponTrait } from "@item/weapon/types";
import { OneToFour, OneToThree, Rarity, ZeroToFour, ZeroToThree } from "@module/data";
import { RollNoteSource } from "@module/notes";
import { PredicateXPRPG, RawPredicate } from "@system/predication";
import { isBlank } from "@util";

function getPropertySlots(item: WeaponXPRPG | ArmorXPRPG): ZeroToFour {
    const fromMaterial = item.system.preciousMaterial?.value === "orichalcum" ? 1 : 0;
    const fromPotency = ABP.isEnabled(item.actor)
        ? ABP.getAttackPotency(item.actor?.level ?? 1)
        : item.system.runes.potency;
    return (fromMaterial + fromPotency) as ZeroToFour;
}

function getPropertyRunes(item: WeaponXPRPG | ArmorXPRPG, slots: number): string[] {
    const runes: string[] = [];
    type RuneIndex = "propertyRune1" | "propertyRune2" | "propertyRune3" | "propertyRune4";
    for (let i = 1; i <= slots; i += 1) {
        const rune = item.system[`propertyRune${i}` as RuneIndex]?.value;
        if (!isBlank(rune)) {
            runes.push(rune);
        }
    }
    return runes;
}

const strikingRuneValues: Map<StrikingRuneType | null, ZeroToThree | undefined> = new Map([
    ["striking", 1],
    ["greaterStriking", 2],
    ["majorStriking", 3],
]);

function getStrikingDice(itemData: { strikingRune: { value: StrikingRuneType | null } }): ZeroToThree {
    return strikingRuneValues.get(itemData.strikingRune.value) ?? 0;
}

const resilientRuneValues: Map<ResilientRuneType | null, ZeroToThree | undefined> = new Map([
    ["resilient", 1],
    ["greaterResilient", 2],
    ["majorResilient", 3],
]);

function getResilientBonus(itemData: { resiliencyRune: { value: ResilientRuneType | null } }): ZeroToThree {
    return resilientRuneValues.get(itemData.resiliencyRune.value) ?? 0;
}

type RuneDiceProperty = "damageType" | "category" | "diceNumber" | "dieSize" | "predicate" | "critical";
type RuneDiceData = Partial<Pick<DamageDiceParameters, RuneDiceProperty>>;

function toDamageDice(rune: WeaponPropertyRuneType, dice: RuneDiceData[]): DamageDiceXPRPG[] {
    return deepClone(dice).map(
        (d) =>
            new DamageDiceXPRPG({
                selector: "strike-damage",
                slug: rune,
                label: CONFIG.XPRPG.runes.weapon.property[rune]?.name,
                diceNumber: d.diceNumber ?? 1,
                dieSize: d.dieSize ?? "d6",
                damageType: d.damageType,
                category: d.category ?? null,
                predicate: d.predicate,
                critical: d.critical ?? null,
            })
    );
}

interface WeaponPropertyRuneData {
    attack?: {
        notes?: RuneNoteData[];
    };
    damage?: {
        dice?: RuneDiceData[];
        notes?: RuneNoteData[];
        adjustments?: (Omit<ModifierAdjustment, "predicate"> & { predicate?: RawPredicate })[];
        /**
         * A list of resistances this weapon's damage will ignore--not limited to damage from the rune.
         * If `max` is numeric, the resistance ignored will be equal to the lower of the provided maximum and the
         * target's resistance.
         */
        ignoredResistances?: { type: ResistanceType; max: number | null }[];
    };
    level: number;
    name: string;
    price: number; // in gp
    rarity: Rarity;
    slug: string;
    traits: WeaponTrait[];
    otherTags?: OtherWeaponTag[];
}

/** Title and text are mandatory for these notes */
interface RuneNoteData extends Pick<RollNoteSource, "outcome" | "predicate" | "title" | "text"> {
    title: string;
    text: string;
}

// https://2e.aonprd.com/Equipment.aspx?Category=23&Subcategory=27
export const WEAPON_PROPERTY_RUNES: Record<WeaponPropertyRuneType, WeaponPropertyRuneData> = {
    anarchic: {
        damage: {
            dice: [
                {
                    damageType: "chaotic",
                    diceNumber: 1,
                    dieSize: "d6",
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.anarchic.Name",
                    text: "XPRPG.WeaponPropertyRune.anarchic.Note.criticalSuccess",
                },
            ],
        },
        level: 11,
        name: "XPRPG.WeaponPropertyRune.anarchic.Name",
        price: 1_400,
        rarity: "common",
        slug: "anarchic",
        traits: ["chaotic", "evocation", "magical"],
    },
    ancestralEchoing: {
        level: 15,
        name: "XPRPG.WeaponPropertyRune.ancestralEchoing.Name",
        price: 9_500,
        rarity: "rare",
        slug: "ancestralEchoing",
        traits: ["dwarf", "evocation", "magical", "saggorak"],
    },
    anchoring: {
        damage: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.anchoring.Name",
                    text: "XPRPG.WeaponPropertyRune.anchoring.Note.criticalSuccess",
                },
            ],
        },
        level: 10,
        name: "XPRPG.WeaponPropertyRune.anchoring.Name",
        price: 900,
        rarity: "uncommon",
        slug: "anchoring",
        traits: ["abjuration", "magical"],
    },
    axiomatic: {
        damage: {
            dice: [
                {
                    damageType: "lawful",
                    diceNumber: 1,
                    dieSize: "d6",
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.axiomatic.Name",
                    text: "XPRPG.WeaponPropertyRune.axiomatic.Note.criticalSuccess",
                },
            ],
        },
        level: 11,
        name: "XPRPG.WeaponPropertyRune.axiomatic.Name",
        price: 1_400,
        rarity: "common",
        slug: "axiomatic",
        traits: ["evocation", "lawful", "magical"],
    },
    bane: {
        level: 4,
        name: "XPRPG.WeaponPropertyRune.bane.Name",
        price: 100,
        rarity: "uncommon",
        slug: "bane",
        traits: ["divination", "magical"],
    },
    bloodbane: {
        level: 8,
        name: "XPRPG.WeaponPropertyRune.bloodbane.Name",
        price: 475,
        rarity: "uncommon",
        slug: "bloodbane",
        traits: ["dwarf", "evocation", "magical"],
    },
    bloodthirsty: {
        damage: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.bloodbane.Name",
                    text: "XPRPG.WeaponPropertyRune.bloodthirsty.Note.criticalSuccess",
                },
            ],
        },
        level: 16,
        name: "XPRPG.WeaponPropertyRune.bloodthirsty.Name",
        price: 8_500,
        rarity: "uncommon",
        slug: "bloodthirsty",
        traits: ["magical", "necromancy"],
    },
    brilliant: {
        damage: {
            dice: [
                { damageType: "fire", diceNumber: 1, dieSize: "d4" },
                {
                    damageType: "good",
                    diceNumber: 1,
                    dieSize: "d4",
                    predicate: [{ or: ["target:trait:fiend", { not: "target" }] }],
                },
                {
                    damageType: "positive",
                    diceNumber: 1,
                    dieSize: "d4",
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.brilliant.Name",
                    text: "XPRPG.WeaponPropertyRune.brilliant.Note.criticalSuccess",
                },
            ],
        },
        level: 12,
        name: "XPRPG.WeaponPropertyRune.brilliant.Name",
        price: 2_000,
        rarity: "common",
        slug: "brilliant",
        traits: ["evocation", "magical"],
    },
    conducting: {
        level: 7,
        name: "XPRPG.WeaponPropertyRune.conducting.Name",
        price: 300,
        rarity: "common",
        slug: "conducting",
        traits: ["evocation", "magical"],
    },
    corrosive: {
        damage: {
            dice: [{ damageType: "acid", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.corrosive.Name",
                    text: "XPRPG.WeaponPropertyRune.corrosive.Note.criticalSuccess",
                },
            ],
        },
        level: 8,
        name: "XPRPG.WeaponPropertyRune.corrosive.Name",
        price: 500,
        rarity: "common",
        slug: "corrosive",
        traits: ["acid", "conjuration", "magical"],
    },
    crushing: {
        damage: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.crushing.Name",
                    text: "XPRPG.WeaponPropertyRune.crushing.Note.criticalSuccess",
                },
            ],
        },
        level: 3,
        name: "XPRPG.WeaponPropertyRune.crushing.Name",
        price: 50,
        rarity: "uncommon",
        slug: "crushing",
        traits: ["magical", "necromancy"],
    },
    cunning: {
        level: 5,
        name: "XPRPG.WeaponPropertyRune.cunning.Name",
        price: 140,
        rarity: "common",
        slug: "cunning",
        traits: ["divination", "magical"],
    },
    dancing: {
        level: 13,
        name: "XPRPG.WeaponPropertyRune.dancing.Name",
        price: 2_700,
        rarity: "uncommon",
        slug: "dancing",
        traits: ["evocation", "magical"],
    },
    demolishing: {
        damage: {
            dice: [
                {
                    damageType: "force",
                    category: "persistent",
                    diceNumber: 1,
                    dieSize: "d6",
                    predicate: ["target:trait:construct"],
                },
            ],
        },
        level: 6,
        name: "XPRPG.WeaponPropertyRune.demolishing.Name",
        price: 225,
        rarity: "rare",
        slug: "demolishing",
        traits: ["evocation", "magical"],
    },
    disrupting: {
        damage: {
            dice: [
                {
                    damageType: "positive",
                    diceNumber: 1,
                    dieSize: "d6",
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.disrupting.Name",
                    text: "XPRPG.WeaponPropertyRune.disrupting.Note.criticalSuccess",
                },
            ],
        },
        level: 5,
        name: "XPRPG.WeaponPropertyRune.disrupting.Name",
        price: 150,
        rarity: "common",
        slug: "disrupting",
        traits: ["magical", "necromancy"],
    },
    energizing: {
        level: 6,
        name: "XPRPG.WeaponPropertyRune.energizing.Name",
        price: 250,
        rarity: "uncommon",
        slug: "energizing",
        traits: ["abjuration", "magical"],
    },
    extending: {
        level: 7,
        name: "XPRPG.WeaponPropertyRune.extending.Name",
        price: 700,
        rarity: "common",
        slug: "extending",
        traits: ["magical", "transmutation"],
    },
    fanged: {
        level: 2,
        name: "XPRPG.WeaponPropertyRune.fanged.Name",
        price: 30,
        rarity: "uncommon",
        slug: "fanged",
        traits: ["magical", "transmutation"],
    },
    fearsome: {
        damage: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.fearsome.Name",
                    text: "XPRPG.WeaponPropertyRune.fearsome.Note.criticalSuccess",
                },
            ],
        },
        level: 5,
        name: "XPRPG.WeaponPropertyRune.fearsome.Name",
        price: 160,
        rarity: "common",
        slug: "fearsome",
        traits: ["emotion", "enchantment", "fear", "magical", "mental"],
    },
    flaming: {
        damage: {
            dice: [
                { damageType: "fire", diceNumber: 1, dieSize: "d6" },
                {
                    damageType: "fire",
                    category: "persistent",
                    diceNumber: 1,
                    dieSize: "d10",
                    critical: true,
                },
            ],
        },
        level: 8,
        name: "XPRPG.WeaponPropertyRune.flaming.Name",
        price: 500,
        rarity: "common",
        slug: "flaming",
        traits: ["conjuration", "fire", "magical"],
    },
    frost: {
        damage: {
            dice: [{ damageType: "cold", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.frost.Name",
                    text: "XPRPG.WeaponPropertyRune.frost.Note.criticalSuccess",
                },
            ],
        },
        level: 8,
        name: "XPRPG.WeaponPropertyRune.frost.Name",
        price: 500,
        rarity: "common",
        slug: "frost",
        traits: ["cold", "conjuration", "magical"],
    },
    ghostTouch: {
        damage: {
            notes: [
                {
                    predicate: [{ or: ["target:trait:incorporeal", { not: "target" }] }],
                    title: "XPRPG.WeaponPropertyRune.ghostTouch.Name",
                    text: "XPRPG.WeaponPropertyRune.ghostTouch.Note",
                },
            ],
        },
        level: 4,
        name: "XPRPG.WeaponPropertyRune.ghostTouch.Name",
        price: 75,
        rarity: "common",
        slug: "ghostTouch",
        traits: ["magical", "transmutation"],
    },
    greaterAnchoring: {
        damage: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterAnchoring.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterAnchoring.Note.criticalSuccess",
                },
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.greaterAnchoring.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterAnchoring.Note.success",
                },
            ],
        },
        level: 18,
        name: "XPRPG.WeaponPropertyRune.greaterAnchoring.Name",
        price: 22_000,
        rarity: "uncommon",
        slug: "greaterAnchoring",
        traits: ["abjuration", "magical"],
    },
    greaterBloodbane: {
        level: 13,
        name: "XPRPG.WeaponPropertyRune.greaterBloodbane.Name",
        price: 2_800,
        rarity: "uncommon",
        slug: "greaterBloodbane",
        traits: ["dwarf", "evocation", "magical"],
    },
    greaterBrilliant: {
        damage: {
            dice: [
                { damageType: "fire", diceNumber: 1, dieSize: "d4" },
                {
                    damageType: "good",
                    diceNumber: 1,
                    dieSize: "d4",
                    predicate: [{ or: ["target:trait:fiend", { not: "target" }] }],
                },
                {
                    damageType: "positive",
                    diceNumber: 1,
                    dieSize: "d4",
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterBrilliant.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterBrilliant.Note.criticalSuccess",
                },
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.greaterBrilliant.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterBrilliant.Note.success",
                },
            ],
            ignoredResistances: [
                { type: "fire", max: null },
                { type: "good", max: null },
                { type: "positive", max: null },
            ],
        },
        level: 18,
        name: "XPRPG.WeaponPropertyRune.greaterBrilliant.Name",
        price: 24_000,
        rarity: "common",
        slug: "greaterBrilliant",
        traits: ["evocation", "magical"],
    },
    greaterCorrosive: {
        damage: {
            dice: [{ damageType: "acid", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterCorrosive.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterCorrosive.Note.criticalSuccess",
                },
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.greaterCorrosive.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterCorrosive.Note.success",
                },
            ],
        },
        level: 15,
        name: "XPRPG.WeaponPropertyRune.greaterCorrosive.Name",
        price: 6_500,
        rarity: "common",
        slug: "greaterCorrosive",
        traits: ["acid", "conjuration", "magical"],
    },
    greaterCrushing: {
        damage: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterCrushing.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterCrushing.Note.criticalSuccess",
                },
            ],
        },
        level: 9,
        name: "XPRPG.WeaponPropertyRune.greaterCrushing.Name",
        price: 650,
        rarity: "uncommon",
        slug: "greaterCrushing",
        traits: ["magical", "necromancy"],
    },
    greaterDisrupting: {
        damage: {
            dice: [
                {
                    damageType: "positive",
                    diceNumber: 2,
                    dieSize: "d6",
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterDisrupting.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterDisrupting.Note.criticalSuccess",
                },
            ],
        },
        level: 14,
        name: "XPRPG.WeaponPropertyRune.greaterDisrupting.Name",
        price: 4_300,
        rarity: "uncommon",
        slug: "greaterDisrupting",
        traits: ["magical", "necromancy"],
    },
    greaterExtending: {
        level: 13,
        name: "XPRPG.WeaponPropertyRune.greaterExtending.Name",
        price: 3_000,
        rarity: "common",
        slug: "greaterExtending",
        traits: ["magical", "transmutation"],
    },
    greaterFanged: {
        level: 8,
        name: "XPRPG.WeaponPropertyRune.greaterFanged.Name",
        price: 425,
        rarity: "uncommon",
        slug: "greaterFanged",
        traits: ["magical", "transmutation"],
    },
    greaterFearsome: {
        damage: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterFearsome.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterFearsome.Note.criticalSuccess",
                },
            ],
        },
        level: 12,
        name: "XPRPG.WeaponPropertyRune.greaterFearsome.Name",
        price: 2_000,
        rarity: "common",
        slug: "greaterFearsome",
        traits: ["emotion", "enchantment", "fear", "magical", "mental"],
    },
    greaterFlaming: {
        damage: {
            dice: [
                { damageType: "fire", diceNumber: 1, dieSize: "d6" },
                {
                    damageType: "fire",
                    category: "persistent",
                    diceNumber: 2,
                    dieSize: "d10",
                    critical: true,
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterFlaming.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterFlaming.Note.criticalSuccess",
                },
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.greaterFlaming.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterFlaming.Note.success",
                },
            ],
            ignoredResistances: [{ type: "fire", max: null }],
        },
        level: 15,
        name: "XPRPG.WeaponPropertyRune.greaterFlaming.Name",
        price: 6_500,
        rarity: "common",
        slug: "greaterFlaming",
        traits: ["conjuration", "fire", "magical"],
    },
    greaterFrost: {
        damage: {
            dice: [{ damageType: "cold", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterFrost.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterFrost.Note.criticalSuccess",
                },
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.greaterFrost.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterFrost.Note.success",
                },
            ],
            ignoredResistances: [{ type: "cold", max: null }],
        },
        level: 15,
        name: "XPRPG.WeaponPropertyRune.greaterFrost.Name",
        price: 6_500,
        rarity: "common",
        slug: "greaterFrost",
        traits: ["cold", "conjuration", "magical"],
    },
    greaterHauling: {
        level: 11,
        name: "XPRPG.WeaponPropertyRune.greaterHauling.Name",
        price: 1_300,
        rarity: "uncommon",
        slug: "greaterHauling",
        traits: ["evocation", "magical"],
    },
    greaterImpactful: {
        damage: {
            dice: [{ damageType: "force", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterImpactful.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterImpactful.Note.criticalSuccess",
                },
            ],
        },
        level: 17,
        name: "XPRPG.WeaponPropertyRune.greaterImpactful.Name",
        price: 15_000,
        rarity: "common",
        slug: "greaterImpactful",
        traits: ["evocation", "force", "magical"],
    },
    greaterShock: {
        damage: {
            dice: [{ damageType: "electricity", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterShock.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterShock.Note.criticalSuccess",
                },
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.greaterShock.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterShock.Note.success",
                },
            ],
            ignoredResistances: [{ type: "electricity", max: null }],
        },
        level: 15,
        name: "XPRPG.WeaponPropertyRune.greaterShock.Name",
        price: 6_500,
        rarity: "common",
        slug: "greaterShock",
        traits: ["electricity", "evocation", "magical"],
    },
    greaterThundering: {
        damage: {
            dice: [{ damageType: "sonic", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.greaterThundering.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterThundering.Note.criticalSuccess",
                },
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.greaterThundering.Name",
                    text: "XPRPG.WeaponPropertyRune.greaterThundering.Note.success",
                },
            ],
            ignoredResistances: [{ type: "sonic", max: null }],
        },
        level: 15,
        name: "XPRPG.WeaponPropertyRune.greaterThundering.Name",
        price: 6_500,
        rarity: "common",
        slug: "greaterThundering",
        traits: ["evocation", "magical", "sonic"],
    },
    grievous: {
        damage: {
            dice: [
                {
                    damageType: "bleed",
                    diceNumber: 1,
                    dieSize: "d6",
                    critical: true,
                    predicate: ["critical-specialization", "item:group:dart"],
                },
            ],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:axe"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Axe",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:brawling"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Brawling",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:club"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Club",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:flail"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Flail",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:hammer"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Hammer",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:knife"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Knife",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:polearm"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Polearm",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:shield"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Shield",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:sling"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Sling",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:spear"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Spear",
                },
                {
                    outcome: ["criticalSuccess"],
                    predicate: ["item:group:sword"],
                    title: "XPRPG.WeaponPropertyRune.grievous.Name",
                    text: "XPRPG.WeaponPropertyRune.grievous.Note.Sword",
                },
            ],
            adjustments: [
                {
                    slug: "critical-specialization",
                    predicate: ["item:group:pick"],
                    getNewValue: (current) => current * 2,
                },
            ],
        },
        level: 9,
        name: "XPRPG.WeaponPropertyRune.grievous.Name",
        price: 700,
        rarity: "common",
        slug: "grievous",
        traits: ["enchantment", "magical"],
    },
    hauling: {
        level: 6,
        name: "XPRPG.WeaponPropertyRune.hauling.Name",
        price: 225,
        rarity: "uncommon",
        slug: "hauling",
        traits: ["evocation", "magical"],
    },
    holy: {
        damage: {
            dice: [
                {
                    damageType: "good",
                    diceNumber: 1,
                    dieSize: "d6",
                },
            ],
        },
        level: 11,
        name: "XPRPG.WeaponPropertyRune.holy.Name",
        price: 1_400,
        rarity: "common",
        slug: "holy",
        traits: ["evocation", "good", "magical"],
    },
    hopeful: {
        attack: {
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.hopeful.Name",
                    text: "XPRPG.WeaponPropertyRune.hopeful.Note.criticalSuccess",
                },
            ],
        },
        level: 11,
        name: "XPRPG.WeaponPropertyRune.hopeful.Name",
        price: 1_200,
        rarity: "uncommon",
        slug: "hopeful",
        traits: ["enchantment", "magical"],
    },
    impactful: {
        damage: {
            dice: [{ damageType: "force", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.impactful.Name",
                    text: "XPRPG.WeaponPropertyRune.impactful.Note.criticalSuccess",
                },
            ],
        },
        level: 10,
        name: "XPRPG.WeaponPropertyRune.impactful.Name",
        price: 1_000,
        rarity: "common",
        slug: "impactful",
        traits: ["evocation", "force", "magical"],
    },
    keen: {
        attack: {
            notes: [
                {
                    outcome: ["success"],
                    title: "XPRPG.WeaponPropertyRune.keen.Name",
                    text: "XPRPG.WeaponPropertyRune.keen.Note",
                },
            ],
        },
        level: 13,
        name: "XPRPG.WeaponPropertyRune.keen.Name",
        price: 3_000,
        rarity: "uncommon",
        slug: "keen",
        traits: ["magical", "transmutation"],
    },
    kinWarding: {
        level: 3,
        name: "XPRPG.WeaponPropertyRune.kinWarding.Name",
        price: 52,
        rarity: "uncommon",
        slug: "kinWarding",
        traits: ["abjuration", "dwarf", "magical"],
    },
    majorFanged: {
        level: 15,
        name: "XPRPG.WeaponPropertyRune.majorFanged.Name",
        price: 6_000,
        rarity: "uncommon",
        slug: "majorFanged",
        traits: ["magical", "transmutation"],
    },
    pacifying: {
        level: 5,
        name: "XPRPG.WeaponPropertyRune.pacifying.Name",
        price: 150,
        rarity: "uncommon",
        slug: "pacifying",
        traits: ["enchantment", "magical"],
    },
    returning: {
        attack: {
            notes: [
                { title: "XPRPG.WeaponPropertyRune.returning.Name", text: "XPRPG.WeaponPropertyRune.returning.Note" },
            ],
        },
        level: 3,
        name: "XPRPG.WeaponPropertyRune.returning.Name",
        price: 55,
        rarity: "common",
        slug: "returning",
        traits: ["evocation", "magical"],
    },
    serrating: {
        damage: {
            dice: [{ damageType: "slashing", diceNumber: 1, dieSize: "d4" }],
        },
        level: 10,
        name: "XPRPG.WeaponPropertyRune.serrating.Name",
        price: 1_000,
        rarity: "uncommon",
        slug: "serrating",
        traits: ["evocation", "magical"],
    },
    shifting: {
        level: 6,
        name: "XPRPG.WeaponPropertyRune.shifting.Name",
        price: 225,
        rarity: "common",
        slug: "shifting",
        traits: ["magical", "transmutation"],
    },
    shock: {
        damage: {
            dice: [{ damageType: "electricity", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.shock.Name",
                    text: "XPRPG.WeaponPropertyRune.shock.Note.criticalSuccess",
                },
            ],
        },
        level: 8,
        name: "XPRPG.WeaponPropertyRune.shock.Name",
        price: 500,
        rarity: "common",
        slug: "shock",
        traits: ["electricity", "conjuration", "magical"],
    },
    speed: {
        level: 16,
        name: "XPRPG.WeaponPropertyRune.speed.Name",
        price: 10_000,
        rarity: "rare",
        slug: "speed",
        traits: ["magical", "transmutation"],
    },
    spellStoring: {
        level: 13,
        name: "XPRPG.WeaponPropertyRune.spellStoring.Name",
        price: 2_700,
        rarity: "uncommon",
        slug: "spellStoring",
        traits: ["abjuration", "magical"],
    },
    thundering: {
        damage: {
            dice: [{ damageType: "sonic", diceNumber: 1, dieSize: "d6" }],
            notes: [
                {
                    outcome: ["criticalSuccess"],
                    title: "XPRPG.WeaponPropertyRune.thundering.Name",
                    text: "XPRPG.WeaponPropertyRune.thundering.Note.criticalSuccess",
                },
            ],
        },
        level: 8,
        name: "XPRPG.WeaponPropertyRune.thundering.Name",
        price: 500,
        rarity: "common",
        slug: "thundering",
        traits: ["evocation", "magical", "sonic"],
    },
    unholy: {
        damage: {
            dice: [
                {
                    damageType: "evil",
                    diceNumber: 1,
                    dieSize: "d6",
                },
            ],
        },
        level: 11,
        name: "XPRPG.WeaponPropertyRune.unholy.Name",
        price: 1_400,
        rarity: "common",
        slug: "unholy",
        traits: ["evil", "evocation", "magical"],
    },
    vorpal: {
        level: 17,
        name: "XPRPG.WeaponPropertyRune.vorpal.Name",
        price: 15_000,
        rarity: "rare",
        slug: "vorpal",
        traits: ["evocation", "magical"],
    },
    wounding: {
        damage: {
            dice: [{ damageType: "bleed", diceNumber: 1, dieSize: "d6" }],
        },
        level: 7,
        name: "XPRPG.WeaponPropertyRune.wounding.Name",
        price: 340,
        rarity: "common",
        slug: "wounding",
        traits: ["magical", "necromancy"],
    },
};

function getPropertyRuneDice(runes: WeaponPropertyRuneType[]): DamageDiceXPRPG[] {
    return runes.flatMap((rune) => {
        const runeData = CONFIG.XPRPG.runes.weapon.property[rune];
        return toDamageDice(rune, runeData.damage?.dice ?? []);
    });
}

function getPropertyRuneAdjustments(runes: WeaponPropertyRuneType[]): ModifierAdjustment[] {
    return runes.flatMap(
        (rune) =>
            CONFIG.XPRPG.runes.weapon.property[rune].damage?.adjustments?.map(
                (a): ModifierAdjustment => ({ ...a, predicate: new PredicateXPRPG(a.predicate ?? []) })
            ) ?? []
    );
}

/* -------------------------------------------- */
/*  Rune Valuation                              */
/* -------------------------------------------- */

interface RuneValuationData {
    level: number;
    price: number;
    rarity: Rarity;
    traits: WeaponTrait[];
    otherTags?: OtherWeaponTag[];
}

// https://2e.aonprd.com/Equipment.aspx?Category=23&Subcategory=25
const POTENCY_RUNE_DATA: Record<OneToFour, RuneValuationData> = {
    1: { level: 2, price: 35, rarity: "common", traits: ["evocation"] },
    2: { level: 10, price: 935, rarity: "common", traits: ["evocation"] },
    3: { level: 16, price: 8935, rarity: "common", traits: ["evocation"] },
    4: { level: 16, price: 8935, rarity: "common", traits: ["evocation"] },
};

// https://2e.aonprd.com/Equipment.aspx?Category=23&Subcategory=25
const STRIKING_RUNE_DATA: Record<OneToThree, RuneValuationData> = {
    1: { level: 4, price: 65, rarity: "common", traits: ["evocation"] },
    2: { level: 12, price: 1065, rarity: "common", traits: ["evocation"] },
    3: { level: 19, price: 31065, rarity: "common", traits: ["evocation"] },
};

interface WeaponValuationData {
    potency: { 0: null } & Record<OneToFour, RuneValuationData>;
    striking: { 0: null } & Record<OneToThree, RuneValuationData>;
}

const WEAPON_VALUATION_DATA: WeaponValuationData = {
    potency: { 0: null, ...POTENCY_RUNE_DATA },
    striking: { 0: null, ...STRIKING_RUNE_DATA },
};

export {
    RuneValuationData,
    WEAPON_VALUATION_DATA,
    WeaponPropertyRuneData,
    getPropertyRuneAdjustments,
    getPropertyRuneDice,
    getPropertyRunes,
    getPropertySlots,
    getResilientBonus,
    getStrikingDice,
};
