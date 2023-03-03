import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { HomebrewTag, HOMEBREW_TRAIT_KEYS } from "@system/settings/homebrew";
import { LocalizeXPRPG } from "@system/localize";
import { sluggify } from "@util";
import { MigrationBase } from "../base";

export class Migration674StableHomebrewTagIDs extends MigrationBase {
    static override version = 0.674;

    private homebrewKeys = deepClone(HOMEBREW_TRAIT_KEYS);

    private homebrewTags = this.homebrewKeys.reduce(
        (settings, key) => mergeObject(settings, { [key]: game.settings.get("xprpg", `homebrew.${key}`) }),
        {} as Record<(typeof this.homebrewKeys)[number], HomebrewTag[]>
    );

    private updateDocumentTags(documentTags: string[] = []): void {
        for (const key of this.homebrewKeys) {
            const homebrewTags = this.homebrewTags[key];
            for (const tag of homebrewTags) {
                const index = documentTags.indexOf(tag.id);
                if (index !== -1) documentTags.splice(index, 1, `hb_${sluggify(tag.value)}`);
            }
        }
    }

    override async updateActor(source: MaybeWithExtraNestedTraits): Promise<void> {
        if (source.type === "familiar" || !source.system.traits?.traits) return;

        this.updateDocumentTags(source.system.traits.traits.value);
        if (source.type === "character" || source.type === "npc") {
            this.updateDocumentTags(source.system.traits?.languages.value);
        }
    }

    override async updateItem(itemSource: ItemSourceXPRPG): Promise<void> {
        this.updateDocumentTags(itemSource.system.traits?.value);
    }

    override async migrate(): Promise<void> {
        for (const key of this.homebrewKeys) {
            const tags: { id: string; value: string }[] = this.homebrewTags[key];

            for (const tag of tags) {
                tag.id = `hb_${sluggify(tag.value)}`;
                const tagMap: Record<string, string> =
                    key === "baseWeapons" ? LocalizeXPRPG.translations.XPRPG.Weapon.Base : CONFIG.XPRPG[key];
                tagMap[tag.id] = tag.value;
                delete tagMap[key];
            }
            if (tags.length > 0) await game.settings.set("xprpg", `homebrew.${key}`, tags);
        }
    }
}

type MaybeWithExtraNestedTraits = ActorSourceXPRPG & {
    system: {
        traits: {
            traits?: { value: string[] };
        };
    };
};
