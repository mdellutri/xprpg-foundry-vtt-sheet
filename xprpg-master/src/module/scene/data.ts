import { ZeroToTwo } from "@module/data";
import type {
    AmbientLightDocumentXPRPG,
    MeasuredTemplateDocumentXPRPG,
    SceneXPRPG,
    TileDocumentXPRPG,
    TokenDocumentXPRPG,
} from ".";

type SceneDataXPRPG<T extends SceneXPRPG> = foundry.data.SceneData<
    T,
    TokenDocumentXPRPG,
    AmbientLightDocumentXPRPG,
    AmbientSoundDocument,
    DrawingDocument,
    MeasuredTemplateDocumentXPRPG,
    NoteDocument,
    TileDocumentXPRPG,
    WallDocument
>;

enum LightLevels {
    DARKNESS = 1 / 4,
    BRIGHT_LIGHT = 3 / 4,
}

type LightLevel = ZeroToTwo;

export { SceneDataXPRPG, LightLevel, LightLevels };
