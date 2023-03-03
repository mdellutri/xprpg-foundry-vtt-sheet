export class LicenseViewer extends Application {
    static override get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "license-viewer",
            title: game.i18n.localize("XPRPG.LicenseViewer.Label"),
            template: "systems/xprpg/templates/packs/license-viewer.hbs",
            width: 500,
            height: 600,
            resizable: true,
            tabs: [
                {
                    navSelector: "nav",
                    contentSelector: "section.content",
                    initial: "landing-page",
                },
            ],
        });
    }
}
