const tokens = canvas.tokens.controlled;

if (tokens.length === 0) {
    ui.notifications.error(`You must select at least one pc token`);
} else {
    game.xprpg.gm.launchTravelSheet(tokens.map((token) => token.actor));
}
