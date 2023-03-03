export function registerKeybindings(): void {
    game.keybindings.register("xprpg", "cycle-token-stack", {
        name: "XPRPG.Keybinding.CycleTokenStack.Label",
        hint: "XPRPG.Keybinding.CycleTokenStack.Hint",
        editable: [{ key: "KeyZ", modifiers: [] }],
        onUp: (): boolean => canvas.tokens.cycleStack(),
    });

    // Defer to the Perfect Vision module if enabled
    if (!game.modules.get("perfect-vision")?.active) {
        game.keybindings.register("xprpg", "gm-vision", {
            name: "XPRPG.Keybinding.GMVision.Label",
            hint: "XPRPG.Keybinding.GMVision.Hint",
            editable: [{ key: "KeyG", modifiers: ["Control"] }],
            restricted: true,
            onDown: (context: KeyboardEventContext): boolean => {
                context.event.preventDefault();
                return true;
            },
            onUp: (): boolean => {
                if (ui.controls.control?.name === "lighting") {
                    // Ensure the toggle in lighting controls continues to reflect the current status
                    const toggle = ui.controls.control.tools.find((t) => t.name === "gm-vision");
                    toggle?.onClick?.(); // Does the same as below
                } else {
                    game.settings.set("xprpg", "gmVision", !game.settings.get("xprpg", "gmVision"));
                }
                return true;
            },
        });
    }
}
