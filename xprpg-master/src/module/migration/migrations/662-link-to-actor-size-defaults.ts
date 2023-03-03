import { ActorXPRPG } from "@actor";
import { ActorSourceXPRPG } from "@actor/data";
import { MigrationBase } from "../base";

/** Set default linkToActorSize flag */
export class Migration662LinkToActorSizeDefaults extends MigrationBase {
    static override version = 0.662;

    override async updateActor(actorSource: ActorSourceXPRPG): Promise<void> {
        const linkToActorSize = !["hazard", "loot"].includes(actorSource.type);
        actorSource.prototypeToken.flags ??= { xprpg: { linkToActorSize } };
        actorSource.prototypeToken.flags.xprpg ??= { linkToActorSize };
        actorSource.prototypeToken.flags.xprpg.linkToActorSize ??= linkToActorSize;
    }

    override async updateToken(tokenSource: foundry.data.TokenSource, actor: ActorXPRPG): Promise<void> {
        const linkToActorSize = !["hazard", "loot"].includes(actor.type);
        tokenSource.flags.xprpg ??= { linkToActorSize };
        tokenSource.flags.xprpg.linkToActorSize ??= linkToActorSize;
    }
}
