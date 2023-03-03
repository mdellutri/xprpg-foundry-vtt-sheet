import { AmbientLightDocumentXPRPG } from "@module/scene";
import { LightingLayerXPRPG } from ".";

export class AmbientLightXPRPG extends AmbientLight<AmbientLightDocumentXPRPG> {
    /** Is this light actually a source of darkness? */
    get isDarkness(): boolean {
        return this.source.isDarkness;
    }
}

export interface AmbientLightXPRPG {
    get layer(): LightingLayerXPRPG<this>;
}
