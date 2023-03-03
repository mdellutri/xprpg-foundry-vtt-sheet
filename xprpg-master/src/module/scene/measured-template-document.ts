import { MeasuredTemplateXPRPG } from "@module/canvas/measured-template";
import { SceneXPRPG } from "./document";

export class MeasuredTemplateDocumentXPRPG extends MeasuredTemplateDocument {}

export interface MeasuredTemplateDocumentXPRPG extends MeasuredTemplateDocument {
    readonly parent: SceneXPRPG | null;

    readonly _object: MeasuredTemplateXPRPG | null;
}
