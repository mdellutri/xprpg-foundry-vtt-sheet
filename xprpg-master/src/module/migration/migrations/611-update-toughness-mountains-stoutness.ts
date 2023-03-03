import { MigrationBase } from "../base";
import { ActorSourceXPRPG } from "@actor/data";
import { FeatXPRPG } from "@item";
import { FeatSource } from "@item/data";
import { ErrorXPRPG } from "@util";

export class Migration611UpdateToughnessMountainsStoutness extends MigrationBase {
    static override version = 0.611;
    override requiresFlush = true;

    private featSlugs = ["mountains-stoutness", "mountain-s-stoutness", "toughness"];
    private featsPromise: Promise<FeatXPRPG[]>;

    constructor() {
        super();
        this.featsPromise = game.packs.get<CompendiumCollection<FeatXPRPG>>("xprpg.feats-srd")!.getDocuments();
    }

    override async updateActor(actorData: ActorSourceXPRPG) {
        if (actorData.type !== "character") return;

        const oldFeatsData = actorData.items.filter(
            (itemData): itemData is FeatSource =>
                this.featSlugs.includes(itemData.system.slug ?? "") && itemData.type === "feat"
        );
        for (const oldFeatData of oldFeatsData) {
            if (oldFeatData.system.slug === "mountain-s-stoutness") {
                oldFeatData.system.slug = "mountains-stoutness";
            }
            const slug = oldFeatData.system.slug;
            const newFeat =
                slug === "toughness"
                    ? (await this.featsPromise).find((feat) => feat.slug === "toughness")
                    : (await this.featsPromise).find((feat) => feat.slug === "mountains-stoutness");
            if (!(newFeat instanceof FeatXPRPG)) {
                throw ErrorXPRPG("Expected item not found in Compendium");
            }
            newFeat._source.system.location = oldFeatData.system.location;
            const oldFeatIndex = actorData.items.indexOf(oldFeatData);
            actorData.items.splice(oldFeatIndex, 1, newFeat.toObject());
        }
    }
}
