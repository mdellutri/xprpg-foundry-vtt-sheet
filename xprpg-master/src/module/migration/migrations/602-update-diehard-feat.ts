import { MigrationBase } from "../base";
import { ActorSourceXPRPG } from "@actor/data";
import { FeatXPRPG } from "@item";

export class Migration602UpdateDiehardFeat extends MigrationBase {
    static override version = 0.602;
    override requiresFlush = true;

    private diehardPromise: Promise<ClientDocument | ClientDocument2 | null>;

    constructor() {
        super();
        this.diehardPromise = fromUuid("Compendium.xprpg.feats-srd.I0BhPWqYf1bbzEYg");
    }

    override async updateActor(actorData: ActorSourceXPRPG) {
        const diehard = actorData.items.find(
            (itemData) => itemData.system.slug === "diehard" && itemData.type === "feat"
        );

        if (actorData.type === "character" && diehard !== undefined) {
            actorData.system.attributes.dying.max = 4;
            const diehardIndex = actorData.items.indexOf(diehard);
            const newDiehard = await this.diehardPromise;
            if (!(newDiehard instanceof FeatXPRPG)) {
                throw Error("XPRPG System | Expected item not found in Compendium");
            }
            actorData.items.splice(diehardIndex, 1, newDiehard.toObject());
        }
    }
}
