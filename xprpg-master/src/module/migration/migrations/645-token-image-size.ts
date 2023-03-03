import { ActorXPRPG } from "@actor";
import { ActorSourceXPRPG } from "@actor/data";
import { MigrationBase } from "../base";

/** Restore saved token images and sizes from old versions of the respective rule elements */
export class Migration645TokenImageSize extends MigrationBase {
    static override version = 0.645;

    imageOverrides: Map<string, VideoFilePath> = new Map();

    sizeOverrides: Map<string, { height: number; width: number }> = new Map();

    isTokenImageFlag(flag: unknown): flag is VideoFilePath {
        return typeof flag === "string";
    }

    isTokenSizeFlag(flag: unknown): flag is { height: number; width: number } {
        return (
            flag instanceof Object &&
            "height" in flag &&
            typeof flag["height"] === "number" &&
            "width" in flag &&
            typeof flag["width"] === "number"
        );
    }

    override async updateActor(actorSource: ActorSourceXPRPG) {
        const flags = actorSource.flags as OldTokenFlags;
        const originalImg = flags.xprpg?.token?.img;
        if (this.isTokenImageFlag(originalImg)) {
            this.imageOverrides.set(actorSource._id, originalImg);
        }

        const originalSize = flags.xprpg?.token?.size;
        if (this.isTokenSizeFlag(originalSize)) {
            this.sizeOverrides.set(actorSource._id, originalSize);
        }

        if (typeof flags.xprpg?.token === "object") {
            if ("game" in globalThis) flags.xprpg["-=token"] = null;
            delete flags.xprpg.token;
        }
    }

    override async updateToken(
        tokenSource: foundry.data.TokenSource,
        actor: Readonly<ActorXPRPG | null>
    ): Promise<void> {
        tokenSource.texture.src = this.imageOverrides.get(actor?.id ?? "") ?? tokenSource.texture.src;
        const sizeOverride = this.sizeOverrides.get(actor?.id ?? "");
        tokenSource.height = sizeOverride?.height ?? tokenSource.height;
        tokenSource.width = sizeOverride?.width ?? tokenSource.width;
    }
}

type OldTokenFlags = {
    xprpg?: {
        token?: {
            img?: string;
            size?: string;
        };
        "-=token"?: null;
    };
};
