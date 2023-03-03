import { SceneXPRPG } from "@module/scene";
import { AmbientLightXPRPG } from "./ambient-light";
import { LightingLayerXPRPG } from "./layer/lighting";
import { MeasuredTemplateXPRPG } from "./measured-template";
import { TemplateLayerXPRPG } from "./layer/template";
import { TokenXPRPG } from "./token";
import { TokenLayerXPRPG } from "./layer/token";
import { EffectsCanvasGroupXPRPG } from "./group/effects";
export * from "./helpers";

export type CanvasXPRPG = Canvas<SceneXPRPG, AmbientLightXPRPG, MeasuredTemplateXPRPG, TokenXPRPG, EffectsCanvasGroupXPRPG>;

export {
    AmbientLightXPRPG,
    MeasuredTemplateXPRPG,
    TokenXPRPG,
    LightingLayerXPRPG,
    TemplateLayerXPRPG,
    TokenLayerXPRPG,
    EffectsCanvasGroupXPRPG,
};
