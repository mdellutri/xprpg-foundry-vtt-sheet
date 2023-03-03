import { TokenDocumentXPRPG } from "@scene";

export interface TokenDataXPRPG<T extends TokenDocumentXPRPG = TokenDocumentXPRPG> extends foundry.data.TokenData<T> {
    actorData: DeepPartial<NonNullable<T["actor"]>["_source"]>;
    flags: {
        xprpg: {
            [key: string]: unknown;
            linkToActorSize: boolean;
            autoscale: boolean;
        };
        [key: string]: Record<string, unknown>;
    };
}
