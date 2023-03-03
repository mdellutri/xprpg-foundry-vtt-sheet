import { AmbientLightXPRPG } from "@module/canvas";
import { SceneXPRPG } from ".";

class AmbientLightDocumentXPRPG extends AmbientLightDocument {
    /** Is this light actually a source of darkness? */
    get isDarkness(): boolean {
        return this.object.source.isDarkness;
    }
}

interface AmbientLightDocumentXPRPG extends AmbientLightDocument {
    readonly parent: SceneXPRPG | null;

    get object(): AmbientLightXPRPG;
}

export { AmbientLightDocumentXPRPG };
