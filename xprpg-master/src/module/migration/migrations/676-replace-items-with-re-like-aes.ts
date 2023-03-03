import { ActorSourceXPRPG } from "@actor/data";
import { ItemXPRPG } from "@item";
import { ItemSourceXPRPG } from "@item/data";
import { ErrorXPRPG } from "@util";
import { MigrationBase } from "../base";

/** Replace items containing FlatModifier `ActiveEffect`s with latest ones without */
export class Migration676ReplaceItemsWithRELikeAEs extends MigrationBase {
    static override version = 0.676;

    /** The feats Toughness and Mountain's Stoutness */
    private toughnessPromise = fromUuid("Compendium.xprpg.feats-srd.AmP0qu7c5dlBSath");
    private stoutnessPromise = fromUuid("Compendium.xprpg.feats-srd.COP89tjrNhEucuRW");

    /** The familiar ability Tough */
    private toughPromise = fromUuid("Compendium.xprpg.familiar-abilities.Le8UWr5BU8rV3iBf");

    private replaceItem({ items, type, slug, replacement }: ReplaceItemArgs): void {
        if (!(replacement instanceof ItemXPRPG)) throw ErrorXPRPG("Unexpected error retrieving compendium item");
        const current = items.find(
            (itemSource) => itemSource.type === type && itemSource.system.slug?.replace(/'/g, "") === slug
        );
        if (current) {
            const newSource = replacement.toObject();
            if (current.type === "feat" && newSource.type === "feat") {
                newSource.system.location = current.system.location;
            }
            items.splice(items.indexOf(current), 1, newSource);
        }
    }

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        if (actorSource.type === "familiar") {
            this.replaceItem({
                items: actorSource.items,
                type: "effect",
                slug: "tough",
                replacement: await this.toughPromise,
            });
        } else if (actorSource.type === "character") {
            this.replaceItem({
                items: actorSource.items,
                type: "feat",
                slug: "toughness",
                replacement: await this.toughnessPromise,
            });
            this.replaceItem({
                items: actorSource.items,
                type: "feat",
                slug: "mountains-stoutness",
                replacement: await this.stoutnessPromise,
            });
        }
    }
}

interface ReplaceItemArgs {
    items: ItemSourceXPRPG[];
    type: string;
    slug: string;
    replacement: ClientDocument | ClientDocument2 | null;
}
