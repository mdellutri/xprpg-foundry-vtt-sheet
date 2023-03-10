import { AlignmentTrait } from "@actor/creature/types";
import { OtherArmorTag } from "@item/armor/types";
import { ClassTrait } from "@item/class/data";
import { OtherConsumableTag } from "@item/consumable/types";
import { RANGE_TRAITS } from "@item/data/values";
import { PreciousMaterialType } from "@item/physical/types";
import { MagicSchool, MagicTradition } from "@item/spell/types";
import { OtherWeaponTag } from "@item/weapon/types";
import { sluggify } from "@util";

// Ancestry and heritage traits
const ancestryTraits = {
    "half-elf": "XPRPG.TraitHalfElf",
    "half-orc": "XPRPG.TraitHalfOrc",
    aasimar: "XPRPG.TraitAasimar",
    aberration: "XPRPG.TraitAberration",
    anadi: "XPRPG.TraitAnadi",
    android: "XPRPG.TraitAndroid",
    aphorite: "XPRPG.TraitAphorite",
    automaton: "XPRPG.TraitAutomaton",
    azarketi: "XPRPG.TraitAzarketi",
    beastkin: "XPRPG.TraitBeastkin",
    catfolk: "XPRPG.TraitCatfolk",
    changeling: "XPRPG.TraitChangeling",
    conrasu: "XPRPG.TraitConrasu",
    dhampir: "XPRPG.TraitDhampir",
    duskwalker: "XPRPG.TraitDuskwalker",
    dwarf: "XPRPG.TraitDwarf",
    elf: "XPRPG.TraitElf",
    fetchling: "XPRPG.TraitFetchling",
    fleshwarp: "XPRPG.TraitFleshwarp",
    ganzi: "XPRPG.TraitGanzi",
    geniekin: "XPRPG.TraitGeniekin",
    ghoran: "XPRPG.TraitGhoran",
    gnoll: "XPRPG.TraitGnoll",
    gnome: "XPRPG.TraitGnome",
    goblin: "XPRPG.TraitGoblin",
    goloma: "XPRPG.TraitGoloma",
    grippli: "XPRPG.TraitGrippli",
    halfling: "XPRPG.TraitHalfling",
    hobgoblin: "XPRPG.TraitHobgoblin",
    human: "XPRPG.TraitHuman",
    ifrit: "XPRPG.TraitIfrit",
    kashrishi: "XPRPG.TraitKashrishi",
    kitsune: "XPRPG.TraitKitsune",
    kobold: "XPRPG.TraitKobold",
    leshy: "XPRPG.TraitLeshy",
    lizardfolk: "XPRPG.TraitLizardfolk",
    nagaji: "XPRPG.TraitNagaji",
    orc: "XPRPG.TraitOrc",
    oread: "XPRPG.TraitOread",
    poppet: "XPRPG.TraitPoppet",
    ratfolk: "XPRPG.TraitRatfolk",
    shisk: "XPRPG.TraitShisk",
    shoony: "XPRPG.TraitShoony",
    skeleton: "XPRPG.TraitSkeleton",
    sprite: "XPRPG.TraitSprite",
    strix: "XPRPG.TraitStrix",
    suli: "XPRPG.TraitSuli",
    sylph: "XPRPG.TraitSylph",
    tengu: "XPRPG.TraitTengu",
    tiefling: "XPRPG.TraitTiefling",
    undine: "XPRPG.TraitUndine",
    vanara: "XPRPG.TraitVanara",
    vishkanya: "XPRPG.TraitVishkanya",
};

// Secondary traits of ancestries and heritages
const ancestryItemTraits = {
    ...ancestryTraits,
    aeon: "XPRPG.TraitAeon",
    amphibious: "XPRPG.TraitAmphibious",
    automaton: "XPRPG.TraitAutomaton",
    construct: "XPRPG.TraitConstruct",
    fey: "XPRPG.TraitFey",
    fungus: "XPRPG.TraitFungus",
    humanoid: "XPRPG.TraitHumanoid",
    plant: "XPRPG.TraitPlant",
    undead: "XPRPG.TraitUndead",
};

const elementalTraits = {
    air: "XPRPG.TraitAir",
    earth: "XPRPG.TraitEarth",
    fire: "XPRPG.TraitFire",
    metal: "XPRPG.TraitMetal",
    water: "XPRPG.TraitWater",
};

const energyDamageTypes = {
    acid: "XPRPG.TraitAcid",
    cold: "XPRPG.TraitCold",
    electricity: "XPRPG.TraitElectricity",
    fire: "XPRPG.TraitFire",
    force: "XPRPG.TraitForce",
    negative: "XPRPG.TraitNegative",
    positive: "XPRPG.TraitPositive",
    sonic: "XPRPG.TraitSonic",
};

const magicTraditions: Record<MagicTradition, string> = {
    arcane: "XPRPG.TraitArcane",
    divine: "XPRPG.TraitDivine",
    occult: "XPRPG.TraitOccult",
    primal: "XPRPG.TraitPrimal",
};

const creatureTraits = {
    ...ancestryItemTraits,
    ...elementalTraits,
    ...energyDamageTypes,
    ...magicTraditions,
    aberration: "XPRPG.TraitAberration",
    aeon: "XPRPG.TraitAeon",
    aesir: "XPRPG.TraitAesir",
    agathion: "XPRPG.TraitAgathion",
    alchemical: "XPRPG.TraitAlchemical",
    angel: "XPRPG.TraitAngel",
    animal: "XPRPG.TraitAnimal",
    anugobu: "XPRPG.TraitAnugobu",
    aquatic: "XPRPG.TraitAquatic",
    archon: "XPRPG.TraitArchon",
    astral: "XPRPG.TraitAstral",
    asura: "XPRPG.TraitAsura",
    azata: "XPRPG.TraitAzata",
    beast: "XPRPG.TraitBeast",
    boggard: "XPRPG.TraitBoggard",
    caligni: "XPRPG.TraitCaligni",
    celestial: "XPRPG.TraitCelestial",
    "charau-ka": "XPRPG.TraitCharauKa",
    clockwork: "XPRPG.TraitClockwork",
    construct: "XPRPG.TraitConstruct",
    couatl: "XPRPG.TraitCouatl",
    daemon: "XPRPG.TraitDaemon",
    darvakka: "XPRPG.TraitDarvakka",
    demon: "XPRPG.TraitDemon",
    dero: "XPRPG.TraitDero",
    devil: "XPRPG.TraitDevil",
    dinosaur: "XPRPG.TraitDinosaur",
    div: "XPRPG.TraitDiv",
    dragon: "XPRPG.TraitDragon",
    dream: "XPRPG.TraitDream",
    drow: "XPRPG.TraitDrow",
    duergar: "XPRPG.TraitDuergar",
    duskwalker: "XPRPG.TraitDuskwalker",
    eidolon: "XPRPG.TraitEidolon",
    elemental: "XPRPG.TraitElemental",
    ethereal: "XPRPG.TraitEthereal",
    evocation: "XPRPG.TraitEvocation",
    fiend: "XPRPG.TraitFiend",
    formian: "XPRPG.TraitFormian",
    fungus: "XPRPG.TraitFungus",
    genie: "XPRPG.TraitGenie",
    ghoran: "XPRPG.TraitGhoran",
    ghost: "XPRPG.TraitGhost",
    ghoul: "XPRPG.TraitGhoul",
    ghul: "XPRPG.TraitGhul",
    giant: "XPRPG.TraitGiant",
    golem: "XPRPG.TraitGolem",
    gremlin: "XPRPG.TraitGremlin",
    grioth: "XPRPG.TraitGrioth",
    grippli: "XPRPG.TraitGrippli",
    hag: "XPRPG.TraitHag",
    hantu: "XPRPG.TraitHantu",
    herald: "XPRPG.TraitHerald",
    humanoid: "XPRPG.TraitHumanoid",
    ifrit: "XPRPG.TraitIfrit",
    ikeshti: "XPRPG.TraitIkeshti",
    illusion: "XPRPG.TraitIllusion",
    incorporeal: "XPRPG.TraitIncorporeal",
    inevitable: "XPRPG.TraitInevitable",
    kami: "XPRPG.TraitKami",
    kovintus: "XPRPG.TraitKovintus",
    light: "XPRPG.TraitLight",
    locathah: "XPRPG.TraitLocathah",
    mental: "XPRPG.TraitMental",
    merfolk: "XPRPG.TraitMerfolk",
    mindless: "XPRPG.TraitMindless",
    minion: "XPRPG.TraitMinion",
    monitor: "XPRPG.TraitMonitor",
    morlock: "XPRPG.TraitMorlock",
    mortic: "XPRPG.TraitMortic",
    mummy: "XPRPG.TraitMummy",
    munavri: "XPRPG.TraitMunavri",
    mutant: "XPRPG.TraitMutant",
    nagaji: "XPRPG.TraitNagaji",
    nymph: "XPRPG.TraitNymph",
    oni: "XPRPG.TraitOni",
    ooze: "XPRPG.TraitOoze",
    orc: "XPRPG.TraitOrc",
    oread: "XPRPG.TraitOread",
    paaridar: "XPRPG.TraitPaaridar",
    petitioner: "XPRPG.TraitPetitioner",
    phantom: "XPRPG.TraitPhantom",
    poison: "XPRPG.TraitPoison",
    protean: "XPRPG.TraitProtean",
    psychopomp: "XPRPG.TraitPsychopomp",
    qlippoth: "XPRPG.TraitQlippoth",
    rakshasa: "XPRPG.TraitRakshasa",
    reflection: "XPRPG.TraitReflection",
    sahkil: "XPRPG.TraitSahkil",
    samsaran: "XPRPG.TraitSamsaran",
    "sea-devil": "XPRPG.TraitSeaDevil",
    serpentfolk: "XPRPG.TraitSerpentfolk",
    seugathi: "XPRPG.TraitSeugathi",
    shabti: "XPRPG.TraitShabti",
    shadow: "XPRPG.TraitShadow",
    shobhad: "XPRPG.TraitShobhad",
    siktempora: "XPRPG.TraitSiktempora",
    skeleton: "XPRPG.TraitSkeleton",
    skelm: "XPRPG.TraitSkelm",
    skulk: "XPRPG.TraitSkulk",
    soulbound: "XPRPG.TraitSoulbound",
    spirit: "XPRPG.TraitSpirit",
    spriggan: "XPRPG.TraitSpriggan",
    stheno: "XPRPG.TraitStheno",
    summoned: "XPRPG.TraitSummoned",
    swarm: "XPRPG.TraitSwarm",
    sylph: "XPRPG.TraitSylph",
    tane: "XPRPG.TraitTane",
    tanggal: "XPRPG.TraitTanggal",
    tengu: "XPRPG.TraitTengu",
    time: "XPRPG.TraitTime",
    titan: "XPRPG.TraitTitan",
    troll: "XPRPG.TraitTroll",
    troop: "XPRPG.TraitTroop",
    undead: "XPRPG.TraitUndead",
    undine: "XPRPG.TraitUndine",
    urdefhan: "XPRPG.TraitUrdefhan",
    vampire: "XPRPG.TraitVampire",
    vanara: "XPRPG.TraitVanara",
    velstrac: "XPRPG.TraitVelstrac",
    vishkanya: "XPRPG.TraitVishkanya",
    wayang: "XPRPG.TraitWayang",
    werecreature: "XPRPG.TraitWerecreature",
    wight: "XPRPG.TraitWight",
    "wild-hunt": "XPRPG.TraitWildHunt",
    wraith: "XPRPG.TraitWraith",
    wyrwood: "XPRPG.TraitWyrwood",
    xulgath: "XPRPG.TraitXulgath",
    zombie: "XPRPG.TraitZombie",
};

const classTraits: Record<ClassTrait, string> = {
    alchemist: "XPRPG.TraitAlchemist",
    barbarian: "XPRPG.TraitBarbarian",
    bard: "XPRPG.TraitBard",
    champion: "XPRPG.TraitChampion",
    cleric: "XPRPG.TraitCleric",
    druid: "XPRPG.TraitDruid",
    fighter: "XPRPG.TraitFighter",
    gunslinger: "XPRPG.TraitGunslinger",
    inventor: "XPRPG.TraitInventor",
    investigator: "XPRPG.TraitInvestigator",
    magus: "XPRPG.TraitMagus",
    monk: "XPRPG.TraitMonk",
    oracle: "XPRPG.TraitOracle",
    psychic: "XPRPG.TraitPsychic",
    ranger: "XPRPG.TraitRanger",
    rogue: "XPRPG.TraitRogue",
    sorcerer: "XPRPG.TraitSorcerer",
    summoner: "XPRPG.TraitSummoner",
    swashbuckler: "XPRPG.TraitSwashbuckler",
    thaumaturge: "XPRPG.TraitThaumaturge",
    witch: "XPRPG.TraitWitch",
    wizard: "XPRPG.TraitWizard",
};

const spellOtherTraits = {
    amp: "XPRPG.TraitAmp",
    attack: "XPRPG.TraitAttack",
    auditory: "XPRPG.TraitAuditory",
    aura: "XPRPG.TraitAura",
    beast: "XPRPG.TraitBeast",
    cantrip: "XPRPG.TraitCantrip",
    composition: "XPRPG.TraitComposition",
    concentrate: "XPRPG.TraitConcentrate",
    consecration: "XPRPG.TraitConsecration",
    contingency: "XPRPG.TraitContingency",
    curse: "XPRPG.TraitCurse",
    cursebound: "XPRPG.TraitCursebound",
    darkness: "XPRPG.TraitDarkness",
    death: "XPRPG.TraitDeath",
    detection: "XPRPG.TraitDetection",
    disease: "XPRPG.TraitDisease",
    dream: "XPRPG.TraitDream",
    eidolon: "XPRPG.TraitEidolon",
    emotion: "XPRPG.TraitEmotion",
    extradimensional: "XPRPG.TraitExtradimensional",
    fear: "XPRPG.TraitFear",
    fortune: "XPRPG.TraitFortune",
    fungus: "XPRPG.TraitFungus",
    healing: "XPRPG.TraitHealing",
    hex: "XPRPG.TraitHex",
    incapacitation: "XPRPG.TraitIncapacitation",
    incarnate: "XPRPG.TraitIncarnate",
    incorporeal: "XPRPG.TraitIncorporeal",
    inhaled: "XPRPG.TraitInhaled",
    light: "XPRPG.TraitLight",
    linguistic: "XPRPG.TraitLinguistic",
    litany: "XPRPG.TraitLitany",
    metamagic: "XPRPG.TraitMetamagic",
    mindless: "XPRPG.TraitMindless",
    misfortune: "XPRPG.TraitMisfortune",
    morph: "XPRPG.TraitMorph",
    move: "XPRPG.TraitMove",
    nonlethal: "XPRPG.TraitNonlethal",
    olfactory: "XPRPG.TraitOlfactory",
    plant: "XPRPG.TraitPlant",
    poison: "XPRPG.TraitPoison",
    polymorph: "XPRPG.TraitPolymorph",
    possession: "XPRPG.TraitPossession",
    prediction: "XPRPG.TraitPrediction",
    psyche: "XPRPG.TraitPsyche",
    revelation: "XPRPG.TraitRevelation",
    scrying: "XPRPG.TraitScrying",
    shadow: "XPRPG.TraitShadow",
    sleep: "XPRPG.TraitSleep",
    stance: "XPRPG.TraitStance",
    summoned: "XPRPG.TraitSummoned",
    teleportation: "XPRPG.TraitTeleportation",
    "true-name": "XPRPG.TraitTrueName",
    visual: "XPRPG.TraitVisual",
};

const alignmentTraits: Record<AlignmentTrait, string> = {
    chaotic: "XPRPG.TraitChaotic",
    evil: "XPRPG.TraitEvil",
    good: "XPRPG.TraitGood",
    lawful: "XPRPG.TraitLawful",
};

const damageTraits = {
    ...alignmentTraits,
    ...elementalTraits,
    ...energyDamageTypes,
    light: "XPRPG.TraitLight",
    magical: "XPRPG.TraitMagical",
    mental: "XPRPG.TraitMental",
    nonlethal: "XPRPG.TraitNonlethal",
    plant: "XPRPG.TraitPlant",
    radiation: "XPRPG.TraitRadiation",
};

const magicSchools: Record<MagicSchool, string> = {
    abjuration: "XPRPG.TraitAbjuration",
    conjuration: "XPRPG.TraitConjuration",
    divination: "XPRPG.TraitDivination",
    enchantment: "XPRPG.TraitEnchantment",
    evocation: "XPRPG.TraitEvocation",
    illusion: "XPRPG.TraitIllusion",
    necromancy: "XPRPG.TraitNecromancy",
    transmutation: "XPRPG.TraitTransmutation",
};

const spellTraits = {
    ...alignmentTraits,
    ...classTraits,
    ...damageTraits,
    ...elementalTraits,
    ...magicSchools,
    ...magicTraditions,
    ...spellOtherTraits,
};

const weaponTraits = {
    ...alignmentTraits,
    ...ancestryTraits,
    ...elementalTraits,
    ...energyDamageTypes,
    ...magicSchools,
    ...magicTraditions,
    adjusted: "XPRPG.TraitAdjusted",
    alchemical: "XPRPG.TraitAlchemical",
    agile: "XPRPG.TraitAgile",
    apex: "XPRPG.TraitApex",
    artifact: "XPRPG.TraitArtifact",
    attached: "XPRPG.TraitAttached",
    "attached-to-shield": "XPRPG.TraitAttachedToShield",
    "attached-to-crossbow-or-firearm": "XPRPG.TraitAttachedToCrossbowOrFirearm",
    auditory: "XPRPG.TraitAuditory",
    backstabber: "XPRPG.TraitBackstabber",
    backswing: "XPRPG.TraitBackswing",
    bomb: "XPRPG.TraitBomb",
    brace: "XPRPG.TraitBrace",
    brutal: "XPRPG.TraitBrutal",
    "capacity-2": "XPRPG.TraitCapacity2",
    "capacity-3": "XPRPG.TraitCapacity3",
    "capacity-4": "XPRPG.TraitCapacity4",
    "capacity-5": "XPRPG.TraitCapacity5",
    climbing: "XPRPG.TraitClimbing",
    clockwork: "XPRPG.TraitClockwork",
    cobbled: "XPRPG.TraitCobbled",
    combination: "XPRPG.TraitCombination",
    concealable: "XPRPG.TraitConcealable",
    concussive: "XPRPG.TraitConcussive",
    consumable: "XPRPG.TraitConsumable",
    "critical-fusion": "XPRPG.TraitCriticalFusion",
    cursed: "XPRPG.TraitCursed",
    "deadly-d6": "XPRPG.TraitDeadlyD6",
    "deadly-d8": "XPRPG.TraitDeadlyD8",
    "deadly-2d8": "XPRPG.TraitDeadly2D8",
    "deadly-3d8": "XPRPG.TraitDeadly3D8",
    "deadly-4d8": "XPRPG.TraitDeadly4D8",
    "deadly-d10": "XPRPG.TraitDeadlyD10",
    "deadly-2d10": "XPRPG.TraitDeadly2D10",
    "deadly-3d10": "XPRPG.TraitDeadly3D10",
    "deadly-4d10": "XPRPG.TraitDeadly4D10",
    "deadly-d12": "XPRPG.TraitDeadlyD12",
    "deadly-2d12": "XPRPG.TraitDeadly2D12",
    "deadly-3d12": "XPRPG.TraitDeadly3D12",
    "deadly-4d12": "XPRPG.TraitDeadly4D12",
    death: "XPRPG.TraitDeath",
    disarm: "XPRPG.TraitDisarm",
    disease: "XPRPG.TraitDisease",
    "double-barrel": "XPRPG.TraitDoubleBarrel",
    emotion: "XPRPG.TraitEmotion",
    extradimensional: "XPRPG.TraitExtradimensional",
    "fatal-aim-d10": "XPRPG.TraitFatalAimD10",
    "fatal-aim-d12": "XPRPG.TraitFatalAimD12",
    "fatal-d8": "XPRPG.TraitFatalD8",
    "fatal-d10": "XPRPG.TraitFatalD10",
    "fatal-d12": "XPRPG.TraitFatalD12",
    fear: "XPRPG.TraitFear",
    finesse: "XPRPG.TraitFinesse",
    forceful: "XPRPG.TraitForceful",
    fortune: "XPRPG.TraitFortune",
    "free-hand": "XPRPG.TraitFreeHand",
    fungus: "XPRPG.TraitFungus",
    grapple: "XPRPG.TraitGrapple",
    hampering: "XPRPG.TraitHampering",
    healing: "XPRPG.TraitHealing",
    infused: "XPRPG.TraitInfused",
    inhaled: "XPRPG.TraitInhaled",
    injection: "XPRPG.TraitInjection",
    intelligent: "XPRPG.TraitIntelligent",
    invested: "XPRPG.TraitInvested",
    "jousting-d6": "XPRPG.TraitJoustingD6",
    kickback: "XPRPG.TraitKickback",
    light: "XPRPG.TraitLight",
    magical: "XPRPG.TraitMagical",
    mental: "XPRPG.TraitMental",
    modular: "XPRPG.TraitModular",
    monk: "XPRPG.TraitMonk",
    nonlethal: "XPRPG.TraitNonlethal",
    olfactory: "XPRPG.TraitOlfactory",
    parry: "XPRPG.TraitParry",
    plant: "XPRPG.TraitPlant",
    poison: "XPRPG.TraitPoison",
    propulsive: "XPRPG.TraitPropulsive",
    "ranged-trip": "XPRPG.TraitRangedTrip",
    razing: "XPRPG.TraitRazing",
    reach: "XPRPG.TraitReach",
    recovery: "XPRPG.TraitRecovery",
    repeating: "XPRPG.TraitRepeating",
    resonant: "XPRPG.TraitResonant",
    saggorak: "XPRPG.TraitSaggorak",
    "scatter-5": "XPRPG.TraitScatter5",
    "scatter-10": "XPRPG.TraitScatter10",
    "scatter-15": "XPRPG.TraitScatter15",
    scrying: "XPRPG.TraitScrying",
    shadow: "XPRPG.TraitShadow",
    shove: "XPRPG.TraitShove",
    splash: "XPRPG.TraitSplash",
    staff: "XPRPG.TraitStaff",
    sweep: "XPRPG.TraitSweep",
    tech: "XPRPG.TraitTech",
    teleportation: "XPRPG.TraitTeleportation",
    tethered: "XPRPG.TraitTethered",
    thrown: "XPRPG.TraitThrown",
    "thrown-10": "XPRPG.TraitThrown10",
    "thrown-15": "XPRPG.TraitThrown15",
    "thrown-20": "XPRPG.TraitThrown20",
    "thrown-30": "XPRPG.TraitThrown30",
    "thrown-40": "XPRPG.TraitThrown40",
    "thrown-60": "XPRPG.TraitThrown60",
    "thrown-80": "XPRPG.TraitThrown80",
    "thrown-100": "XPRPG.TraitThrown100",
    "thrown-200": "XPRPG.TraitThrown200",
    training: "XPRPG.TraitTraining",
    trip: "XPRPG.TraitTrip",
    twin: "XPRPG.TraitTwin",
    "two-hand-d6": "XPRPG.TraitTwoHandD6",
    "two-hand-d8": "XPRPG.TraitTwoHandD8",
    "two-hand-d10": "XPRPG.TraitTwoHandD10",
    "two-hand-d12": "XPRPG.TraitTwoHandD12",
    unarmed: "XPRPG.TraitUnarmed",
    vehicular: "XPRPG.TraitVehicular",
    "versatile-acid": "XPRPG.TraitVersatileAcid",
    "versatile-b": "XPRPG.TraitVersatileB",
    "versatile-chaotic": "XPRPG.TraitVersatileChaotic",
    "versatile-cold": "XPRPG.TraitVersatileCold",
    "versatile-electricity": "XPRPG.TraitVersatileElectricity",
    "versatile-evil": "XPRPG.TraitVersatileEvil",
    "versatile-fire": "XPRPG.TraitVersatileFire",
    "versatile-force": "XPRPG.TraitVersatileForce",
    "versatile-good": "XPRPG.TraitVersatileGood",
    "versatile-lawful": "XPRPG.TraitVersatileLawful",
    "versatile-negative": "XPRPG.TraitVersatileNegative",
    "versatile-p": "XPRPG.TraitVersatileP",
    "versatile-positive": "XPRPG.TraitVersatilePositive",
    "versatile-s": "XPRPG.TraitVersatileS",
    "versatile-sonic": "XPRPG.TraitVersatileSonic",
    "volley-20": "XPRPG.TraitVolley20",
    "volley-30": "XPRPG.TraitVolley30",
    "volley-50": "XPRPG.TraitVolley50",
};

const preciousMaterials: Record<PreciousMaterialType, string> = {
    abysium: "XPRPG.PreciousMaterialAbysium",
    adamantine: "XPRPG.PreciousMaterialAdamantine",
    "cold-iron": "XPRPG.PreciousMaterialColdIron",
    darkwood: "XPRPG.PreciousMaterialDarkwood",
    djezet: "XPRPG.PreciousMaterialDjezet",
    dragonhide: "XPRPG.PreciousMaterialDragonhide",
    "grisantian-pelt": "XPRPG.PreciousMaterialGrisantianPelt",
    inubrix: "XPRPG.PreciousMaterialInubrix",
    mithral: "XPRPG.PreciousMaterialMithral",
    noqual: "XPRPG.PreciousMaterialNoqual",
    orichalcum: "XPRPG.PreciousMaterialOrichalcum",
    peachwood: "XPRPG.PreciousMaterialPeachwood",
    siccatite: "XPRPG.PreciousMaterialSiccatite",
    silver: "XPRPG.PreciousMaterialSilver",
    "sisterstone-dusk": "XPRPG.PreciousMaterialSisterstoneDusk",
    "sisterstone-scarlet": "XPRPG.PreciousMaterialSisterstoneScarlet",
    "sovereign-steel": "XPRPG.PreciousMaterialSovereignSteel",
    warpglass: "XPRPG.PreciousMaterialWarpglass",
};

const otherArmorTags: Record<OtherArmorTag, string> = {
    shoddy: "XPRPG.Item.Physical.OtherTag.Shoddy",
};

const otherConsumableTags: Record<OtherConsumableTag, string> = {
    herbal: "XPRPG.Item.Physical.OtherTag.Herbal",
};

const otherWeaponTags: Record<OtherWeaponTag, string> = {
    crossbow: "XPRPG.Weapon.Base.crossbow",
    improvised: "XPRPG.Item.Physical.OtherTag.Improvised",
    shoddy: "XPRPG.Item.Physical.OtherTag.Shoddy",
};

const rangeTraits = RANGE_TRAITS.reduce(
    (descriptions, trait) => ({ ...descriptions, [trait]: `XPRPG.Trait${sluggify(trait, { camel: "bactrian" })}` }),
    {} as Record<(typeof RANGE_TRAITS)[number], string>
);

const npcAttackTraits = {
    ...weaponTraits,
    ...preciousMaterials,
    ...rangeTraits,
    curse: "XPRPG.TraitCurse",
    "reach-0": "XPRPG.TraitReach0",
    "reach-10": "XPRPG.TraitReach10",
    "reach-15": "XPRPG.TraitReach15",
    "reach-20": "XPRPG.TraitReach20",
    "reach-25": "XPRPG.TraitReach25",
    "reach-30": "XPRPG.TraitReach30",
    "reach-40": "XPRPG.TraitReach40",
    "reach-50": "XPRPG.TraitReach50",
    "reach-60": "XPRPG.TraitReach60",
    "reach-100": "XPRPG.TraitReach100",
    "reach-1000": "XPRPG.TraitReach1000",
    "reload-0": "XPRPG.TraitReload0",
    "reload-1": "XPRPG.TraitReload1",
    "reload-2": "XPRPG.TraitReload2",
    "reload-1-min": "XPRPG.TraitReload1Min",
};

const featTraits = {
    ...ancestryTraits,
    ...classTraits,
    ...damageTraits,
    ...magicSchools,
    ...magicTraditions,
    ...spellTraits,
    additive1: "XPRPG.TraitAdditive1",
    additive2: "XPRPG.TraitAdditive2",
    additive3: "XPRPG.TraitAdditive3",
    aftermath: "XPRPG.TraitAftermath",
    alchemical: "XPRPG.TraitAlchemical",
    archetype: "XPRPG.TraitArchetype",
    artifact: "XPRPG.TraitArtifact",
    auditory: "XPRPG.TraitAuditory",
    aura: "XPRPG.TraitAura",
    class: "XPRPG.Class",
    concentrate: "XPRPG.TraitConcentrate",
    dedication: "XPRPG.TraitDedication",
    detection: "XPRPG.TraitDetection",
    deviant: "XPRPG.TraitDeviant",
    downtime: "XPRPG.TraitDowntime",
    emotion: "XPRPG.TraitEmotion",
    evolution: "XPRPG.TraitEvolution",
    esoterica: "XPRPG.TraitEsoterica",
    exploration: "XPRPG.TraitExploration",
    fear: "XPRPG.TraitFear",
    finisher: "XPRPG.TraitFinisher",
    flourish: "XPRPG.TraitFlourish",
    fortune: "XPRPG.TraitFortune",
    general: "XPRPG.TraitGeneral",
    injury: "XPRPG.TraitInjury",
    lineage: "XPRPG.TraitLineage",
    manipulate: "XPRPG.TraitManipulate",
    metamagic: "XPRPG.TraitMetamagic",
    mindshift: "XPRPG.TraitMindshift",
    modification: "XPRPG.TraitModification",
    move: "XPRPG.TraitMove",
    multiclass: "XPRPG.TraitMulticlass",
    oath: "XPRPG.TraitOath",
    olfactory: "XPRPG.TraitOlfactory",
    open: "XPRPG.TraitOpen",
    "pervasive-magic": "XPRPG.TraitPervasiveMagic",
    poison: "XPRPG.TraitPoison",
    press: "XPRPG.TraitPress",
    rage: "XPRPG.TraitRage",
    reckless: "XPRPG.TraitReckless",
    reflection: "XPRPG.TraitReflection",
    secret: "XPRPG.TraitSecret",
    skill: "XPRPG.TraitSkill",
    social: "XPRPG.TraitSocial",
    spellshot: "XPRPG.TraitSpellshot",
    stamina: "XPRPG.TraitStamina",
    stance: "XPRPG.TraitStance",
    tandem: "XPRPG.TraitTandem",
    time: "XPRPG.TraitTime",
    "true-name": "XPRPG.TraitTrueName",
    unstable: "XPRPG.TraitUnstable",
    vigilante: "XPRPG.TraitVigilante",
    virulent: "XPRPG.TraitVirulent",
};

const consumableTraits = {
    ...damageTraits,
    ...elementalTraits,
    ...magicSchools,
    ...magicTraditions,
    additive1: "XPRPG.TraitAdditive1",
    additive2: "XPRPG.TraitAdditive2",
    additive3: "XPRPG.TraitAdditive3",
    alchemical: "XPRPG.TraitAlchemical",
    attack: "XPRPG.TraitAttack",
    auditory: "XPRPG.TraitAuditory",
    aura: "XPRPG.TraitAura",
    catalyst: "XPRPG.TraitCatalyst",
    clockwork: "XPRPG.TraitClockwork",
    consumable: "XPRPG.TraitConsumable",
    contact: "XPRPG.TraitContact",
    curse: "XPRPG.TraitCurse",
    cursed: "XPRPG.TraitCursed",
    drug: "XPRPG.TraitDrug",
    elixir: "XPRPG.TraitElixir",
    emotion: "XPRPG.TraitEmotion",
    expandable: "XPRPG.TraitExpandable",
    fear: "XPRPG.TraitFear",
    fey: "XPRPG.TraitFey",
    fortune: "XPRPG.TraitFortune",
    fulu: "XPRPG.TraitFulu",
    gadget: "XPRPG.TraitGadget",
    healing: "XPRPG.TraitHealing",
    incapacitation: "XPRPG.TraitIncapacitation",
    infused: "XPRPG.TraitInfused",
    ingested: "XPRPG.TraitIngested",
    inhaled: "XPRPG.TraitInhaled",
    injury: "XPRPG.TraitInjury",
    kobold: "XPRPG.TraitKobold",
    light: "XPRPG.TraitLight",
    linguistic: "XPRPG.TraitLinguistic",
    lozenge: "XPRPG.TraitLozenge",
    magical: "XPRPG.TraitMagical",
    mechanical: "XPRPG.TraitMechanical",
    misfortune: "XPRPG.TraitMisfortune",
    missive: "XPRPG.TraitMissive",
    morph: "XPRPG.TraitMorph",
    mutagen: "XPRPG.TraitMutagen",
    oil: "XPRPG.TraitOil",
    olfactory: "XPRPG.TraitOlfactory",
    poison: "XPRPG.TraitPoison",
    polymorph: "XPRPG.TraitPolymorph",
    possession: "XPRPG.TraitPossession",
    potion: "XPRPG.TraitPotion",
    precious: "XPRPG.TraitPrecious",
    processed: "XPRPG.TraitProcessed",
    scroll: "XPRPG.TraitScroll",
    scrying: "XPRPG.TraitScrying",
    sleep: "XPRPG.TraitSleep",
    snare: "XPRPG.TraitSnare",
    spellgun: "XPRPG.TraitSpellgun",
    splash: "XPRPG.TraitSplash",
    structure: "XPRPG.TraitStructure",
    talisman: "XPRPG.TraitTalisman",
    teleportation: "XPRPG.TraitTeleportation",
    trap: "XPRPG.TraitTrap",
    virulent: "XPRPG.TraitVirulent",
    visual: "XPRPG.TraitVisual",
    wand: "XPRPG.TraitWand",
};

const actionTraits = {
    ...featTraits,
    ...consumableTraits,
    ...spellTraits,
    circus: "XPRPG.TraitCircus",
    summon: "XPRPG.TraitSummon",
};

const hazardTraits = {
    ...damageTraits,
    ...magicSchools,
    ...magicTraditions,
    aberration: "XPRPG.TraitAberration",
    alchemical: "XPRPG.TraitAlchemical",
    aquatic: "XPRPG.TraitAquatic",
    auditory: "XPRPG.TraitAuditory",
    clockwork: "XPRPG.TraitClockwork",
    consumable: "XPRPG.TraitConsumable",
    curse: "XPRPG.TraitCurse",
    environmental: "XPRPG.TraitEnvironmental",
    fungus: "XPRPG.TraitFungus",
    haunt: "XPRPG.TraitHaunt",
    inhaled: "XPRPG.TraitInhaled",
    kaiju: "XPRPG.TraitKaiju",
    magical: "XPRPG.TraitMagical",
    mechanical: "XPRPG.TraitMechanical",
    poison: "XPRPG.TraitPoison",
    shadow: "XPRPG.TraitShadow",
    steam: "XPRPG.TraitSteam",
    summoned: "XPRPG.TraitSummoned",
    technological: "XPRPG.TraitTechnological",
    teleportation: "XPRPG.TraitTeleportation",
    trap: "XPRPG.TraitTrap",
    virulent: "XPRPG.TraitVirulent",
    visual: "XPRPG.TraitVisual",
};

const vehicleTraits = {
    ...magicSchools,
    artifact: "XPRPG.TraitArtifact",
    clockwork: "XPRPG.TraitClockwork",
    magical: "XPRPG.TraitMagical",
    teleportation: "XPRPG.TraitTeleportation",
};

const equipmentTraits = {
    ...alignmentTraits,
    ...ancestryTraits,
    ...elementalTraits,
    ...energyDamageTypes,
    ...magicSchools,
    ...magicTraditions,
    additive0: "XPRPG.TraitAdditive0",
    additive1: "XPRPG.TraitAdditive1",
    adjusted: "XPRPG.TraitAdjusted",
    adjustment: "XPRPG.TraitAdjustment",
    alchemical: "XPRPG.TraitAlchemical",
    apex: "XPRPG.TraitApex",
    artifact: "XPRPG.TraitArtifact",
    auditory: "XPRPG.TraitAuditory",
    aura: "XPRPG.TraitAura",
    barding: "XPRPG.TraitBarding",
    clockwork: "XPRPG.TraitClockwork",
    coda: "XPRPG.TraitCoda",
    companion: "XPRPG.TraitCompanion",
    contract: "XPRPG.TraitContract",
    consecration: "XPRPG.TraitConsecration",
    cursed: "XPRPG.TraitCursed",
    darkness: "XPRPG.TraitDarkness",
    death: "XPRPG.TraitDeath",
    detection: "XPRPG.TraitDetection",
    eidolon: "XPRPG.TraitEidolon",
    emotion: "XPRPG.TraitEmotion",
    expandable: "XPRPG.TraitExpandable",
    extradimensional: "XPRPG.TraitExtradimensional",
    fear: "XPRPG.TraitFear",
    focused: "XPRPG.TraitFocused",
    fortune: "XPRPG.TraitFortune",
    fulu: "XPRPG.TraitFulu",
    gadget: "XPRPG.TraitGadget",
    grimoire: "XPRPG.TraitGrimoire",
    healing: "XPRPG.TraitHealing",
    incapacitation: "XPRPG.TraitIncapacitation",
    incorporeal: "XPRPG.TraitIncorporeal",
    infused: "XPRPG.TraitInfused",
    intelligent: "XPRPG.TraitIntelligent",
    invested: "XPRPG.TraitInvested",
    light: "XPRPG.TraitLight",
    magical: "XPRPG.TraitMagical",
    mechanical: "XPRPG.TraitMechanical",
    mental: "XPRPG.TraitMental",
    misfortune: "XPRPG.TraitMisfortune",
    morph: "XPRPG.TraitMorph",
    mounted: "XPRPG.TraitMounted",
    nonlethal: "XPRPG.TraitNonlethal",
    plant: "XPRPG.TraitPlant",
    poison: "XPRPG.TraitPoison",
    polymorph: "XPRPG.TraitPolymorph",
    portable: "XPRPG.TraitPortable",
    precious: "XPRPG.TraitPrecious",
    prediction: "XPRPG.TraitPrediction",
    revelation: "XPRPG.TraitRevelation",
    saggorak: "XPRPG.TraitSaggorak",
    scrying: "XPRPG.TraitScrying",
    shadow: "XPRPG.TraitShadow",
    sleep: "XPRPG.TraitSleep",
    spellgun: "XPRPG.TraitSpellgun",
    spellheart: "XPRPG.TraitSpellheart",
    staff: "XPRPG.TraitStaff",
    steam: "XPRPG.TraitSteam",
    structure: "XPRPG.TraitStructure",
    tattoo: "XPRPG.TraitTattoo",
    teleportation: "XPRPG.TraitTeleportation",
    visual: "XPRPG.TraitVisual",
    wand: "XPRPG.TraitWand",
};

const shieldTraits = {
    "deflecting-bludgeoning": "XPRPG.DeflectingBludgeoning",
    "deflecting-piercing": "XPRPG.DeflectingBludgeoning",
    "deflecting-physical-ranged": "XPRPG.DeflectingPhysicalRanged",
    "deflecting-slashing": "XPRPG.DeflectingSlashing",
    foldaway: "XPRPG.TraitFoldaway",
    harnessed: "XPRPG.TraitHarnessed",
    "hefty-14": "XPRPG.TraitHefty14",
    inscribed: "XPRPG.TraitInscribed",
    "integrated-1d6-b": "XPRPG.TraitIntegrated1d6B",
    "integrated-1d6-p": "XPRPG.TraitIntegrated1d6P",
    "integrated-1d6-s": "XPRPG.TraitIntegrated1d6S",
    "integrated-1d6-s-versatile-p": "XPRPG.TraitIntegrated1d6SVersatileP",
    "launching-dart": "XPRPG.TraitLaunching",
    "shield-throw-20": "XPRPG.TraitShieldThrow20",
    "shield-throw-30": "XPRPG.TraitShieldThrow30",
};

const armorTraits = {
    ...alignmentTraits,
    ...elementalTraits,
    ...magicSchools,
    ...magicTraditions,
    ...shieldTraits,
    adjusted: "XPRPG.TraitAdjusted",
    alchemical: "XPRPG.TraitAlchemical",
    apex: "XPRPG.TraitApex",
    aquadynamic: "XPRPG.TraitAquadynamic",
    artifact: "XPRPG.TraitArtifact",
    auditory: "XPRPG.TraitAuditory",
    aura: "XPRPG.TraitAura",
    barding: "XPRPG.TraitBarding",
    bulwark: "XPRPG.TraitBulwark",
    clockwork: "XPRPG.TraitClockwork",
    comfort: "XPRPG.TraitComfort",
    cursed: "XPRPG.TraitCursed",
    "entrench-melee": "XPRPG.TraitEntrenchMelee",
    "entrench-ranged": "XPRPG.TraitEntrenchRanged",
    extradimensional: "XPRPG.TraitExtradimensional",
    focused: "XPRPG.TraitFocused",
    force: "XPRPG.TraitForce",
    flexible: "XPRPG.TraitFlexible",
    healing: "XPRPG.TraitHealing",
    hindering: "XPRPG.TraitHindering",
    inscribed: "XPRPG.TraitInscribed",
    intelligent: "XPRPG.TraitIntelligent",
    invested: "XPRPG.TraitInvested",
    laminar: "XPRPG.TraitLaminar",
    light: "XPRPG.TraitLight",
    magical: "XPRPG.TraitMagical",
    noisy: "XPRPG.TraitNoisy",
    plant: "XPRPG.TraitPlant",
    ponderous: "XPRPG.TraitPonderous",
};

export {
    actionTraits,
    alignmentTraits,
    ancestryItemTraits,
    ancestryTraits,
    armorTraits,
    classTraits,
    consumableTraits,
    creatureTraits,
    damageTraits,
    elementalTraits,
    energyDamageTypes,
    equipmentTraits,
    featTraits,
    hazardTraits,
    magicSchools,
    magicTraditions,
    npcAttackTraits,
    otherArmorTags,
    otherConsumableTags,
    otherWeaponTags,
    preciousMaterials,
    spellOtherTraits,
    spellTraits,
    vehicleTraits,
    weaponTraits,
};
