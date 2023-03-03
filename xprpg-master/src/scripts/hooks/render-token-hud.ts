export const RenderTokenHUD = {
    listen: (): void => {
        Hooks.on("renderTokenHUD", (_app, $html, data) => {
            game.xprpg.StatusEffects.onRenderTokenHUD($html[0]!, data);
        });
    },
};
