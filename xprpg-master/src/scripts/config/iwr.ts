const immunityTypes = {
    acid: "XPRPG.Damage.RollFlavor.acid",
    adamantine: "XPRPG.Damage.IWR.Type.adamantine",
    air: "XPRPG.Damage.RollFlavor.air",
    "area-damage": "XPRPG.Damage.IWR.Type.area-damage",
    auditory: "XPRPG.Damage.IWR.Type.auditory",
    bleed: "XPRPG.Damage.RollFlavor.bleed",
    blinded: "XPRPG.Damage.IWR.Type.blinded",
    bludgeoning: "XPRPG.Damage.RollFlavor.bludgeoning",
    chaotic: "XPRPG.Damage.RollFlavor.chaotic",
    clumsy: "XPRPG.Damage.IWR.Type.clumsy",
    cold: "XPRPG.Damage.RollFlavor.cold",
    "cold-iron": "XPRPG.Damage.IWR.Type.cold-iron",
    confused: "XPRPG.Damage.IWR.Type.confused",
    conjuration: "XPRPG.Damage.IWR.Type.conjuration",
    controlled: "XPRPG.Damage.IWR.Type.controlled",
    "critical-hits": "XPRPG.Damage.IWR.Type.critical-hits",
    curse: "XPRPG.Damage.IWR.Type.curse",
    darkwood: "XPRPG.Damage.IWR.Type.darkwood",
    dazzled: "XPRPG.Damage.IWR.Type.dazzled",
    deafened: "XPRPG.Damage.IWR.Type.deafened",
    "death-effects": "XPRPG.Damage.IWR.Type.death-effects",
    disease: "XPRPG.Damage.IWR.Type.disease",
    doomed: "XPRPG.Damage.IWR.Type.doomed",
    drained: "XPRPG.Damage.IWR.Type.drained",
    earth: "XPRPG.Damage.RollFlavor.earth",
    electricity: "XPRPG.Damage.RollFlavor.electricity",
    emotion: "XPRPG.Damage.IWR.Type.emotion",
    enchantment: "XPRPG.Damage.IWR.Type.enchantment",
    energy: "XPRPG.Damage.IWR.Type.energy",
    enfeebled: "XPRPG.Damage.IWR.Type.enfeebled",
    evil: "XPRPG.Damage.RollFlavor.evil",
    evocation: "XPRPG.Damage.IWR.Type.evocation",
    fascinated: "XPRPG.Damage.IWR.Type.fascinated",
    fatigued: "XPRPG.Damage.IWR.Type.fatigued",
    "fear-effects": "XPRPG.Damage.IWR.Type.fear-effects",
    fire: "XPRPG.Damage.RollFlavor.fire",
    "flat-footed": "XPRPG.Damage.IWR.Type.flat-footed",
    fleeing: "XPRPG.Damage.IWR.Type.fleeing",
    force: "XPRPG.Damage.RollFlavor.force",
    frightened: "XPRPG.Damage.IWR.Type.frightened",
    good: "XPRPG.Damage.RollFlavor.good",
    grabbed: "XPRPG.Damage.IWR.Type.grabbed",
    healing: "XPRPG.Damage.IWR.Type.healing",
    illusion: "XPRPG.Damage.IWR.Type.illusion",
    immobilized: "XPRPG.Damage.IWR.Type.immobilized",
    inhaled: "XPRPG.Damage.IWR.Type.inhaled",
    lawful: "XPRPG.Damage.RollFlavor.lawful",
    light: "XPRPG.Damage.IWR.Type.light",
    magic: "XPRPG.Damage.IWR.Type.magic",
    mental: "XPRPG.Damage.RollFlavor.mental",
    "misfortune-effects": "XPRPG.Damage.IWR.Type.misfortune-effects",
    mithral: "XPRPG.Damage.IWR.Type.mithral",
    necromancy: "XPRPG.Damage.IWR.Type.necromancy",
    negative: "XPRPG.Damage.RollFlavor.negative",
    "non-magical": "XPRPG.Damage.IWR.Type.non-magical",
    "nonlethal-attacks": "XPRPG.Damage.IWR.Type.nonlethal-attacks",
    "object-immunities": "XPRPG.Damage.IWR.Type.object-immunities",
    olfactory: "XPRPG.Damage.IWR.Type.olfactory",
    orichalcum: "XPRPG.Damage.IWR.Type.orichalcum",
    paralyzed: "XPRPG.Damage.IWR.Type.paralyzed",
    petrified: "XPRPG.Damage.IWR.Type.petrified",
    physical: "XPRPG.Damage.IWR.Type.physical",
    piercing: "XPRPG.Damage.RollFlavor.piercing",
    poison: "XPRPG.Damage.RollFlavor.poison",
    polymorph: "XPRPG.Damage.IWR.Type.polymorph",
    positive: "XPRPG.Damage.RollFlavor.positive",
    possession: "XPRPG.Damage.IWR.Type.possession",
    precision: "XPRPG.Damage.RollFlavor.precision",
    prone: "XPRPG.Damage.IWR.Type.prone",
    restrained: "XPRPG.Damage.IWR.Type.restrained",
    "salt-water": "XPRPG.Damage.IWR.Type.salt-water",
    scrying: "XPRPG.Damage.IWR.Type.scrying",
    sickened: "XPRPG.Damage.IWR.Type.sickened",
    silver: "XPRPG.Damage.IWR.Type.silver",
    slashing: "XPRPG.Damage.RollFlavor.slashing",
    sleep: "XPRPG.Damage.IWR.Type.sleep",
    slowed: "XPRPG.Damage.IWR.Type.slowed",
    sonic: "XPRPG.Damage.RollFlavor.sonic",
    "spell-deflection": "XPRPG.Damage.IWR.Type.spell-deflection",
    stunned: "XPRPG.Damage.IWR.Type.stunned",
    stupefied: "XPRPG.Damage.IWR.Type.stupefied",
    "swarm-attacks": "XPRPG.Damage.IWR.Type.swarm-attacks",
    "swarm-mind": "XPRPG.Damage.IWR.Type.swarm-mind",
    transmutation: "XPRPG.Damage.IWR.Type.transmutation",
    trip: "XPRPG.Damage.IWR.Type.trip",
    "unarmed-attacks": "XPRPG.Damage.IWR.Type.unarmed-attacks",
    unconscious: "XPRPG.Damage.IWR.Type.unconscious",
    visual: "XPRPG.Damage.IWR.Type.visual",
    water: "XPRPG.Damage.IWR.Type.water",
};

const weaknessTypes = {
    acid: "XPRPG.Damage.RollFlavor.acid",
    adamantine: "XPRPG.Damage.IWR.Type.adamantine",
    air: "XPRPG.Damage.RollFlavor.air",
    "area-damage": "XPRPG.Damage.IWR.Type.area-damage",
    "arrow-vulnerability": "XPRPG.Damage.IWR.Type.arrow-vulnerability",
    "axe-vulnerability": "XPRPG.Damage.IWR.Type.axe-vulnerability",
    bleed: "XPRPG.Damage.RollFlavor.bleed",
    bludgeoning: "XPRPG.Damage.RollFlavor.bludgeoning",
    chaotic: "XPRPG.Damage.RollFlavor.chaotic",
    cold: "XPRPG.Damage.RollFlavor.cold",
    "cold-iron": "XPRPG.Damage.IWR.Type.cold-iron",
    "critical-hits": "XPRPG.Damage.IWR.Type.critical-hits",
    darkwood: "XPRPG.Damage.IWR.Type.darkwood",
    earth: "XPRPG.Damage.RollFlavor.earth",
    electricity: "XPRPG.Damage.RollFlavor.electricity",
    emotion: "XPRPG.Damage.IWR.Type.emotion",
    energy: "XPRPG.Damage.IWR.Type.energy",
    evil: "XPRPG.Damage.RollFlavor.evil",
    fire: "XPRPG.Damage.RollFlavor.fire",
    force: "XPRPG.Damage.RollFlavor.force",
    "ghost-touch": "XPRPG.Damage.IWR.Type.ghost-touch",
    good: "XPRPG.Damage.RollFlavor.good",
    lawful: "XPRPG.Damage.RollFlavor.lawful",
    light: "XPRPG.Damage.IWR.Type.light",
    magical: "XPRPG.Damage.IWR.Type.magical",
    mental: "XPRPG.Damage.RollFlavor.mental",
    metal: "XPRPG.Damage.RollFlavor.metal",
    mithral: "XPRPG.Damage.IWR.Type.mithral",
    negative: "XPRPG.Damage.RollFlavor.negative",
    "non-magical": "XPRPG.Damage.IWR.Type.non-magical",
    "nonlethal-attacks": "XPRPG.Damage.IWR.Type.nonlethal-attacks",
    orichalcum: "XPRPG.Damage.IWR.Type.orichalcum",
    physical: "XPRPG.Damage.IWR.Type.physical",
    piercing: "XPRPG.Damage.RollFlavor.piercing",
    poison: "XPRPG.Damage.RollFlavor.poison",
    positive: "XPRPG.Damage.RollFlavor.positive",
    precision: "XPRPG.Damage.RollFlavor.precision",
    radiation: "XPRPG.Damage.IWR.Type.radiation",
    salt: "XPRPG.Damage.IWR.Type.salt",
    "salt-water": "XPRPG.Damage.IWR.Type.salt-water",
    silver: "XPRPG.Damage.IWR.Type.silver",
    slashing: "XPRPG.Damage.RollFlavor.slashing",
    sonic: "XPRPG.Damage.RollFlavor.sonic",
    "splash-damage": "XPRPG.Damage.IWR.Type.splash-damage",
    "unarmed-attacks": "XPRPG.Damage.IWR.Type.unarmed-attacks",
    "vampire-weaknesses": "XPRPG.Damage.IWR.Type.vampire-weaknesses",
    vorpal: "XPRPG.Damage.IWR.Type.vorpal",
    "vorpal-fear": "XPRPG.Damage.IWR.Type.vorpal-fear",
    "vulnerable-to-sunlight": "XPRPG.Damage.IWR.Type.vulnerable-to-sunlight",
    warpglass: "XPRPG.Damage.IWR.Type.warpglass",
    water: "XPRPG.Damage.IWR.Type.water",
    weapons: "XPRPG.Damage.IWR.Type.weapons",
    "weapons-shedding-bright-light": "XPRPG.Damage.IWR.Type.weapons-shedding-bright-light",
};

const resistanceTypes = {
    acid: "XPRPG.Damage.RollFlavor.acid",
    adamantine: "XPRPG.Damage.IWR.Type.adamantine",
    air: "XPRPG.Damage.RollFlavor.air",
    "all-damage": "XPRPG.Damage.IWR.Type.all-damage",
    "area-damage": "XPRPG.Damage.IWR.Type.area-damage",
    bleed: "XPRPG.Damage.RollFlavor.bleed",
    bludgeoning: "XPRPG.Damage.RollFlavor.bludgeoning",
    chaotic: "XPRPG.Damage.RollFlavor.chaotic",
    cold: "XPRPG.Damage.RollFlavor.cold",
    "cold-iron": "XPRPG.Damage.IWR.Type.cold-iron",
    "critical-hits": "XPRPG.Damage.IWR.Type.critical-hits",
    "damage-from-spells": "XPRPG.Damage.IWR.Type.damage-from-spells",
    darkwood: "XPRPG.Damage.IWR.Type.darkwood",
    earth: "XPRPG.Damage.RollFlavor.earth",
    electricity: "XPRPG.Damage.RollFlavor.electricity",
    energy: "XPRPG.Damage.IWR.Type.energy",
    evil: "XPRPG.Damage.RollFlavor.evil",
    fire: "XPRPG.Damage.RollFlavor.fire",
    force: "XPRPG.Damage.RollFlavor.force",
    "ghost-touch": "XPRPG.Damage.IWR.Type.ghost-touch",
    good: "XPRPG.Damage.RollFlavor.good",
    lawful: "XPRPG.Damage.RollFlavor.lawful",
    light: "XPRPG.Damage.IWR.Type.light",
    magical: "XPRPG.Damage.IWR.Type.magical",
    mental: "XPRPG.Damage.RollFlavor.mental",
    metal: "XPRPG.Damage.RollFlavor.metal",
    mithral: "XPRPG.Damage.IWR.Type.mithral",
    negative: "XPRPG.Damage.RollFlavor.negative",
    "non-magical": "XPRPG.Damage.IWR.Type.non-magical",
    nonlethal: "XPRPG.Damage.IWR.Type.nonlethal",
    "nonlethal-attacks": "XPRPG.Damage.IWR.Type.nonlethal-attacks",
    orichalcum: "XPRPG.Damage.IWR.Type.orichalcum",
    physical: "XPRPG.Damage.IWR.Type.physical",
    piercing: "XPRPG.Damage.RollFlavor.piercing",
    plant: "XPRPG.Damage.IWR.Type.plant",
    poison: "XPRPG.Damage.RollFlavor.poison",
    positive: "XPRPG.Damage.RollFlavor.positive",
    precision: "XPRPG.Damage.RollFlavor.precision",
    "protean-anatomy": "XPRPG.Damage.IWR.Type.protean-anatomy",
    radiation: "XPRPG.Damage.IWR.Type.radiation",
    salt: "XPRPG.Damage.IWR.Type.salt",
    "salt-water": "XPRPG.Damage.IWR.Type.salt-water",
    silver: "XPRPG.Damage.IWR.Type.silver",
    slashing: "XPRPG.Damage.RollFlavor.slashing",
    sonic: "XPRPG.Damage.RollFlavor.sonic",
    "unarmed-attacks": "XPRPG.Damage.IWR.Type.unarmed-attacks",
    vorpal: "XPRPG.Damage.IWR.Type.vorpal",
    "vorpal-adamantine": "XPRPG.Damage.IWR.Type.vorpal-adamantine",
    warpglass: "XPRPG.Damage.IWR.Type.warpglass",
    water: "XPRPG.Damage.IWR.Type.water",
    weapons: "XPRPG.Damage.IWR.Type.weapons",
    "weapons-shedding-bright-light": "XPRPG.Damage.IWR.Type.weapons-shedding-bright-light",
};

export { immunityTypes, weaknessTypes, resistanceTypes };
