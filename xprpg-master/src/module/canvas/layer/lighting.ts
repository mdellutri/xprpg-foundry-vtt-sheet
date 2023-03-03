import { AmbientLightXPRPG } from "../ambient-light";

export class LightingLayerXPRPG<
    TAmbientLight extends AmbientLightXPRPG = AmbientLightXPRPG
> extends LightingLayer<TAmbientLight> {
    get lightingLevel(): number {
        return 1 - canvas.darknessLevel;
    }
}
