import { CharacterDetails } from "@actor/character/data";
import { CreatureTrait } from "@actor/creature/types";
import { ActorSourceXPRPG } from "@actor/data";
import { FeatSource, ItemSourceXPRPG } from "@item/data";
import { FeatSystemSource } from "@item/feat/data";
import { HeritageSource, HeritageSystemSource } from "@item/heritage/data";
import { Rarity } from "@module/data";
import { creatureTraits } from "@scripts/config/traits";
import { MigrationBase } from "../base";

const toDelete = ["featType", "actionCategory", "actions", "actionType", "level", "location"] as const;

export class Migration711HeritageItems extends MigrationBase {
    static override version = 0.711;

    private isHeritageFeature(feature: ItemSourceXPRPG): feature is FeatSource {
        return feature.type === "feat" && (feature as MaybeWithHeritageFeatType).system.featType.value === "heritage";
    }

    private officialAncestries: Record<string, { name: string; uuid: ItemUUID } | undefined> = {
        tengu: {
            name: "Tengu",
            uuid: "Compendium.xprpg.ancestries.18xDKYPDBLEv2myX",
        },
        kitsune: {
            name: "Kitsune",
            uuid: "Compendium.xprpg.ancestries.4BL5wf1VF9feC2rY",
        },
        poppet: {
            name: "Poppet",
            uuid: "Compendium.xprpg.ancestries.6F2fSFC1Eo1JdpY4",
        },
        kobold: {
            name: "Kobold",
            uuid: "Compendium.xprpg.ancestries.7oQxL6wgsokD3QXG",
        },
        catfolk: {
            name: "Catfolk",
            uuid: "Compendium.xprpg.ancestries.972EkpJOPv9KkQIW",
        },
        dwarf: {
            name: "Dwarf",
            uuid: "Compendium.xprpg.ancestries.BYj5ZvlXZdpaEgA6",
        },
        gnome: {
            name: "Gnome",
            uuid: "Compendium.xprpg.ancestries.CYlfsYLJcBOgqKtD",
        },
        fleshwarp: {
            name: "Fleshwarp",
            uuid: "Compendium.xprpg.ancestries.FXlXmNBFiiz9oasi",
        },
        strix: {
            name: "Strix",
            uuid: "Compendium.xprpg.ancestries.GXcC6oVa5quzgNHD",
        },
        android: {
            name: "Android",
            uuid: "Compendium.xprpg.ancestries.GfLwE884NoRC7cRi",
        },
        halfling: {
            name: "Halfling",
            uuid: "Compendium.xprpg.ancestries.GgZAHbrjnzWOZy2v",
        },
        lizardfolk: {
            name: "Lizardfolk",
            uuid: "Compendium.xprpg.ancestries.HWEgF7Gmoq55VhTL",
        },
        human: {
            name: "Human",
            uuid: "Compendium.xprpg.ancestries.IiG7DgeLWYrSNXuX",
        },
        ratfolk: {
            name: "Ratfolk",
            uuid: "Compendium.xprpg.ancestries.P6PcVnCkh4XMdefw",
        },
        elf: {
            name: "Elf",
            uuid: "Compendium.xprpg.ancestries.PgKmsA2aKdbLU6O0",
        },
        anadi: {
            name: "Anadi",
            uuid: "Compendium.xprpg.ancestries.TQEqWqc7BYiadUdY",
        },
        sprite: {
            name: "Sprite",
            uuid: "Compendium.xprpg.ancestries.TRqoeYfGAFjQbviF",
        },
        goloma: {
            name: "Goloma",
            uuid: "Compendium.xprpg.ancestries.c4secsSNG2AO7I5i",
        },
        leshy: {
            name: "Leshy",
            uuid: "Compendium.xprpg.ancestries.cdhgByGG1WtuaK73",
        },
        fetchling: {
            name: "Fetchling",
            uuid: "Compendium.xprpg.ancestries.hIA3qiUsxvLZXrFP",
        },
        grippli: {
            name: "Grippli",
            uuid: "Compendium.xprpg.ancestries.hXM5jXezIki1cMI2",
        },
        automaton: {
            name: "Automaton",
            uuid: "Compendium.xprpg.ancestries.kYsBAJ103T44agJF",
        },
        orc: {
            name: "Orc",
            uuid: "Compendium.xprpg.ancestries.lSGWXjcbOa6O5fTx",
        },
        hobgoblin: {
            name: "Hobgoblin",
            uuid: "Compendium.xprpg.ancestries.piNLXUrm9iaGqD2i",
        },
        shoony: {
            name: "Shoony",
            uuid: "Compendium.xprpg.ancestries.q6rsqYARyOGXZA8F",
        },
        goblin: {
            name: "Goblin",
            uuid: "Compendium.xprpg.ancestries.sQfjTMDaZbT9DThq",
        },
        conrasu: {
            name: "Conrasu",
            uuid: "Compendium.xprpg.ancestries.tZn4qIHCUA6wCdnI",
        },
        gnoll: {
            name: "Gnoll",
            uuid: "Compendium.xprpg.ancestries.vxbQ1Yw4qwgjTzqo",
        },
        shisk: {
            name: "Shisk",
            uuid: "Compendium.xprpg.ancestries.x1YinOddgUxwOLqP",
        },
        azarketi: {
            name: "Azarketi",
            uuid: "Compendium.xprpg.ancestries.yFoojz6q3ZjvceFw",
        },
    };

    private heritagesWithoutAncestryInName: Record<string, string | undefined> = {
        "half-elf": "human",
        "half-orc": "human",
        "skilled-heritage": "human",
        "versatile-heritage": "human",
        draxie: "sprite",
        grig: "sprite",
        melixie: "sprite",
        nyktera: "sprite",
        pixie: "sprite",
        "deep-rat": "ratfolk",
        "desert-rat": "ratfolk",
        "longsnout-rat": "ratfolk",
        "sewer-rat": "ratfolk",
        "shadow-rat": "ratfolk",
        "snow-rat": "ratfolk",
        "tunnel-rat": "ratfolk",
        "rite-of-invocation": "conrasu",
        "rite-of-knowing": "conrasu",
        "rite-of-light": "conrasu",
        "rite-of-passage": "conrasu",
        "rite-of-reinforcement": "conrasu",
    };

    private ancestrySlugs = Object.keys(this.officialAncestries);

    private heritageFromFeat(feature: FeatSource): HeritageSourceWithNoAncestrySlug {
        const featureSlug = feature.system.slug ?? "";
        const ancestrySlug =
            this.heritagesWithoutAncestryInName[featureSlug] ?? this.ancestrySlugs.find((s) => featureSlug.includes(s));
        const ancestryReference = this.officialAncestries[ancestrySlug ?? ""] ?? null;
        const traits: { rarity: Rarity; value: string[] } = feature.system.traits;
        const { flags } = feature;

        if (flags.core?.sourceId) {
            flags.core.sourceId = flags.core.sourceId.replace("ancestryfeatures", "heritages") as ItemUUID;
        }

        return {
            _id: randomID(),
            type: "heritage",
            img: feature.img.endsWith("/feat.svg") ? "systems/xprpg/icons/default-icons/heritage.svg" : feature.img,
            name: feature.name,
            effects: [],
            folder: feature.folder,
            flags: feature.flags,
            sort: feature.sort,
            ownership: feature.ownership,
            system: {
                description: feature.system.description,
                rules: feature.system.rules,
                schema: feature.system.schema,
                slug: feature.system.slug,
                ancestry: ancestryReference,
                traits: {
                    value: traits.value.filter(
                        (t): t is CreatureTrait =>
                            (t in creatureTraits || t.startsWith("hb_")) && !(t in this.officialAncestries)
                    ),
                    rarity: traits.rarity,
                },
                source: feature.system.source,
            },
        };
    }

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        const heritageFeatures = actorSource.items.filter((i): i is FeatSource => this.isHeritageFeature(i));
        const firstHeritageFeature = heritageFeatures[0];
        const hasRealHeritage = actorSource.items.some((i) => i.type === "heritage");
        if (!hasRealHeritage && firstHeritageFeature && actorSource.type === "character") {
            const heritageSource = this.heritageFromFeat(firstHeritageFeature);
            const items: object[] = actorSource.items;
            items.push(heritageSource);

            const details: MaybeWithStoredHeritage = actorSource.system.details;
            if (details.heritage) {
                details["-=heritage"] = null;
                if (!("game" in globalThis)) delete details.heritage;
            }
        }

        for (const feature of heritageFeatures) {
            actorSource.items.splice(actorSource.items.indexOf(feature), 1);
        }
    }

    override async updateItem(itemSource: ItemSourceXPRPG, actorSource?: ActorSourceXPRPG): Promise<void> {
        if (actorSource || !this.isHeritageFeature(itemSource)) return;

        const newSource: { type: string; img: ImageFilePath; system: object } = itemSource;
        newSource.type = "heritage";
        if (itemSource.img === "systems/xprpg/icons/default-icons/feat.svg") {
            itemSource.img = "systems/xprpg/icons/default-icons/heritage.svg";
        }
        type WithPropertyDeletions = HeritageSystemSourceWithNoAncestrySlug & FeatPropertyDeletions;
        const newSystemData: WithPropertyDeletions = this.heritageFromFeat(itemSource).system;
        const deletionProperties = toDelete.map((k) => `-=${k}` as const);
        for (const property of deletionProperties) {
            newSystemData[property] = null;
        }
        if (!("game" in globalThis)) {
            for (const property of toDelete) {
                delete newSystemData[property];
            }
        }
        newSource.system = newSystemData;
    }
}

type FeatKeys = (typeof toDelete)[number];
type DeletionKeys = `-=${FeatKeys}`;
type FeatPropertyDeletions = DeepPartial<Omit<FeatSystemSource, "traits">> & {
    [K in DeletionKeys | FeatKeys]?: unknown;
};

type MaybeWithHeritageFeatType = ItemSourceXPRPG & {
    system: {
        featType: {
            value: string;
        };
    };
};

interface HeritageSourceWithNoAncestrySlug extends Omit<HeritageSource, "system"> {
    system: HeritageSystemSourceWithNoAncestrySlug;
}

interface HeritageSystemSourceWithNoAncestrySlug extends Omit<HeritageSystemSource, "ancestry"> {
    ancestry: { uuid: ItemUUID; name: string } | null;
}

type MaybeWithStoredHeritage = Omit<CharacterDetails, "heritage"> & { heritage?: unknown; "-=heritage"?: null };
