import { ActorXPRPG } from "@actor/base";
import { SceneXPRPG } from "@module/scene";
import { TokenDocumentXPRPG } from "@module/scene/token-document";

export class FakeToken {
    _actor: ActorXPRPG | null;
    parent: SceneXPRPG | null;
    data: foundry.data.TokenData<TokenDocumentXPRPG>;

    constructor(
        data: foundry.data.TokenSource,
        context: TokenDocumentConstructionContext<SceneXPRPG | null, ActorXPRPG | null> = {}
    ) {
        this.data = duplicate(data) as foundry.data.TokenData<TokenDocumentXPRPG>;
        this.parent = context.parent ?? null;
        this._actor = context.actor ?? null;
    }

    get actor() {
        return this._actor;
    }

    get scene() {
        return this.parent;
    }

    get id() {
        return this.data._id;
    }

    get name() {
        return this.data.name;
    }

    update(changes: EmbeddedDocumentUpdateData<TokenDocument>, context: DocumentModificationContext = {}) {
        changes["_id"] = this.id;
        this.scene?.updateEmbeddedDocuments("Token", [changes], context);
    }
}
