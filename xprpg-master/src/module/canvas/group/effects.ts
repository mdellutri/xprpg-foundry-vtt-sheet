class EffectsCanvasGroupXPRPG extends EffectsCanvasGroup {
    /** Is rules-based vision enabled and applicable to the scene? */
    get rulesBasedVision(): boolean {
        return game.settings.get("xprpg", "automation.rulesBasedVision") && canvas.ready && !!canvas.scene?.tokenVision;
    }
}

export { EffectsCanvasGroupXPRPG };
