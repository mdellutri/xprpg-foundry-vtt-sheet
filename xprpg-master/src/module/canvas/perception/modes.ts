import { TokenXPRPG } from "../token";
import { HearingSource } from "./hearing-source";

const darkvision = new VisionMode({
    id: "darkvision",
    label: "VISION.ModeDarkvision",
    canvas: {
        shader: ColorAdjustmentsSamplerShader,
        uniforms: { enable: true, contrast: 0, saturation: -1.0, brightness: 0 },
    },
    lighting: {
        levels: {
            // from core-bundled darkvision mode: maybe restore?
            // [VisionMode.LIGHTING_LEVELS.DIM]: VisionMode.LIGHTING_LEVELS.BRIGHT,
        },
        background: { visibility: VisionMode.LIGHTING_VISIBILITY.REQUIRED },
    },
    vision: {
        darkness: { adaptive: true },
        defaults: { attenuation: 0, contrast: 0, saturation: -1.0, brightness: 0.75, range: Infinity },
    },
});

class VisionDetectionMode extends DetectionModeBasicSight {
    constructor() {
        super({
            id: "basicSight",
            label: "DETECTION.BasicSight",
            type: DetectionMode.DETECTION_TYPES.SIGHT,
        });
    }

    /** Short-circuit test to false if token is GM-hidden */
    override testVisibility(
        visionSource: VisionSource<Token>,
        mode: TokenDetectionMode,
        config?: CanvasVisibilityTestConfig
    ): boolean {
        return (
            !(config?.object instanceof PlaceableObject && config.object.document.hidden) &&
            super.testVisibility(visionSource, mode, config)
        );
    }

    protected override _canDetect(visionSource: VisionSource<TokenXPRPG>, target: PlaceableObject): boolean {
        if (!super._canDetect(visionSource, target)) return false;
        const targetIsUndetected =
            target instanceof TokenXPRPG && !!target.actor?.hasCondition("undetected", "unnoticed");
        return !targetIsUndetected;
    }
}

class HearingDetectionMode extends DetectionMode {
    constructor() {
        super({
            id: "hearing",
            label: "XPRPG.Actor.Creature.Sense.Type.Hearing",
            type: DetectionMode.DETECTION_TYPES.SOUND,
        });
    }

    static override getDetectionFilter(): OutlineOverlayFilter {
        const filter = (this._detectionFilter ??= OutlineOverlayFilter.create({
            wave: true,
            knockout: false,
        }));
        filter.thickness = 1;
        return filter;
    }

    /** Short-circuit test to false if token is GM-hidden */
    override testVisibility(
        visionSource: VisionSource<Token>,
        mode: TokenDetectionMode,
        config?: CanvasVisibilityTestConfig
    ): boolean {
        return (
            config?.object instanceof TokenXPRPG &&
            !config.object.document.hidden &&
            super.testVisibility(visionSource, mode, config)
        );
    }

    protected override _canDetect(visionSource: VisionSource<TokenXPRPG>, target: PlaceableObject): boolean {
        // Not if the target isn't a token
        if (!(target instanceof TokenXPRPG)) return false;

        // Not if the target doesn't emit sound
        if (!target.actor?.emitsSound) return false;

        if (!game.settings.get("xprpg", "automation.rulesBasedVision")) return true;

        // Not if the target is unnoticed or undetected
        if (target.actor?.hasCondition("undetected", "unnoticed")) {
            return false;
        }

        // Only if the subject can hear
        return !visionSource.object.actor?.hasCondition("deafened");
    }

    /**
     * A vision source is passed due to lack of core support for non-vision-based detection.
     * Retrieve hearing source and test against that.
     */
    protected override _testLOS(
        visionSource: VisionSource<TokenXPRPG>,
        _mode: TokenDetectionMode,
        _target: PlaceableObject,
        test: CanvasVisibilityTestXPRPG
    ): boolean {
        test.loh ??= new Map();
        const hearingSource = visionSource.object.hearing;
        const hasLOH = test.loh.get(hearingSource) ?? hearingSource.los.contains(test.point.x, test.point.y);
        test.loh.set(hearingSource, hasLOH);

        return hasLOH;
    }
}

declare namespace HearingDetectionMode {
    // eslint-disable-next-line no-var
    var _detectionFilter: OutlineOverlayFilter | undefined;
}

interface CanvasVisibilityTestXPRPG extends CanvasVisibilityTest {
    loh?: Map<HearingSource<TokenXPRPG>, boolean>;
}

class DetectionModeTremorXPRPG extends DetectionModeTremor {
    constructor() {
        super({
            id: "feelTremor",
            label: "DETECTION.FeelTremor",
            walls: false,
            type: DetectionMode.DETECTION_TYPES.MOVE,
        });
    }

    static override getDetectionFilter(): OutlineOverlayFilter {
        const filter = super.getDetectionFilter();
        filter.thickness = 1;
        return filter;
    }

    protected override _canDetect(visionSource: VisionSource<TokenXPRPG>, target: PlaceableObject): boolean {
        return (
            super._canDetect(visionSource, target) &&
            target instanceof TokenXPRPG &&
            !target.actor?.isOfType("loot") &&
            !target.actor?.hasCondition("undetected", "unnoticed")
        );
    }
}

function setPerceptionModes(): void {
    CONFIG.Canvas.visionModes.darkvision = darkvision;
    CONFIG.Canvas.detectionModes.basicSight = new VisionDetectionMode();
    CONFIG.Canvas.detectionModes.hearing = new HearingDetectionMode();
    CONFIG.Canvas.detectionModes.feelTremor = new DetectionModeTremorXPRPG();
}

export { setPerceptionModes };
