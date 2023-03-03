import { MystifiedTraits } from "@item/data/values";
import { HotbarXPRPG } from "@module/apps/hotbar";
import {
    ActorDirectoryXPRPG,
    ItemDirectoryXPRPG,
    ChatLogXPRPG,
    CompendiumDirectoryXPRPG,
    EncounterTrackerXPRPG,
} from "@module/apps/sidebar";
import {
    AmbientLightXPRPG,
    EffectsCanvasGroupXPRPG,
    LightingLayerXPRPG,
    MeasuredTemplateXPRPG,
    TemplateLayerXPRPG,
    TokenLayerXPRPG,
    TokenXPRPG,
} from "@module/canvas";
import { setPerceptionModes } from "@module/canvas/perception/modes";
import { XPRPGCONFIG } from "@scripts/config";
import { registerHandlebarsHelpers } from "@scripts/handlebars";
import { registerFonts } from "@scripts/register-fonts";
import { registerKeybindings } from "@scripts/register-keybindings";
import { registerTemplates } from "@scripts/register-templates";
import { SetGameXPRPG } from "@scripts/set-game-XPRPG";
import { registerSettings } from "@system/settings";
import { htmlQueryAll } from "@util";

export const Init = {
    listen: (): void => {
        Hooks.once("init", () => {
            console.log("XPRPG System | Initializing Xenos Paragon: Roleplaying Game System");

            CONFIG.XPRPG = XPRPGCONFIG;
            CONFIG.debug.ruleElement ??= false;

            // Assign canvas layer and placeable classes
            CONFIG.AmbientLight.layerClass = LightingLayerXPRPG;
            CONFIG.AmbientLight.objectClass = AmbientLightXPRPG;

            CONFIG.MeasuredTemplate.objectClass = MeasuredTemplateXPRPG;
            CONFIG.MeasuredTemplate.layerClass = TemplateLayerXPRPG;
            CONFIG.MeasuredTemplate.defaults.angle = 90;
            CONFIG.MeasuredTemplate.defaults.width = 1;

            CONFIG.Token.objectClass = TokenXPRPG;
            CONFIG.Token.layerClass = TokenLayerXPRPG;

            CONFIG.Canvas.groups.effects.groupClass = EffectsCanvasGroupXPRPG;
            CONFIG.Canvas.layers.lighting.layerClass = LightingLayerXPRPG;
            CONFIG.Canvas.layers.templates.layerClass = TemplateLayerXPRPG;
            CONFIG.Canvas.layers.tokens.layerClass = TokenLayerXPRPG;

            setPerceptionModes();

            // Automatically advance world time by 6 seconds each round
            CONFIG.time.roundTime = 6;
            // Decimals are 😠
            CONFIG.Combat.initiative.decimals = 0;

            // Assign the XPRPG Sidebar subclasses
            CONFIG.ui.actors = ActorDirectoryXPRPG;
            CONFIG.ui.items = ItemDirectoryXPRPG;
            CONFIG.ui.combat = EncounterTrackerXPRPG;
            CONFIG.ui.chat = ChatLogXPRPG;
            CONFIG.ui.compendium = CompendiumDirectoryXPRPG;
            CONFIG.ui.hotbar = HotbarXPRPG;

            // The condition in Xenos Paragon: Roleplaying Gameis "blinded" rather than "blind"
            CONFIG.specialStatusEffects.BLIND = "blinded";

            // Insert templates into DOM tree so Applications can render into
            if (document.querySelector("#ui-top") !== null) {
                // Template element for effects-panel
                const uiTop = document.querySelector("#ui-top");
                const template = document.createElement("template");
                template.setAttribute("id", "xprpg-effects-panel");
                uiTop?.insertAdjacentElement("afterend", template);
            }

            // configure the bundled TinyMCE editor with XPRPG-specific options
            CONFIG.TinyMCE.extended_valid_elements = "xprpg-action[action|glyph]";
            CONFIG.TinyMCE.content_css = CONFIG.TinyMCE.content_css.concat("systems/xprpg/styles/main.css");
            CONFIG.TinyMCE.style_formats = (CONFIG.TinyMCE.style_formats ?? []).concat({
                title: "XPRPG",
                items: [
                    {
                        title: "Icons A D T F R",
                        inline: "span",
                        classes: ["xprpg-icon"],
                        wrapper: true,
                    },
                    {
                        title: "Inline Header",
                        block: "h4",
                        classes: "inline-header",
                    },
                    {
                        title: "Info Block",
                        block: "section",
                        classes: "info",
                        wrapper: true,
                        exact: true,
                        merge_siblings: false,
                    },
                    {
                        title: "Stat Block",
                        block: "section",
                        classes: "statblock",
                        wrapper: true,
                        exact: true,
                        merge_siblings: false,
                    },
                    {
                        title: "Trait",
                        block: "section",
                        classes: "traits",
                        wrapper: true,
                    },
                    {
                        title: "Written Note",
                        block: "p",
                        classes: "message",
                    },
                    {
                        title: "GM Text Block",
                        block: "div",
                        wrapper: true,
                        attributes: {
                            "data-visibility": "gm",
                        },
                    },
                    {
                        title: "GM Text Inline",
                        inline: "span",
                        attributes: {
                            "data-visibility": "gm",
                        },
                    },
                ],
            });

            // Register custom enricher
            CONFIG.TextEditor.enrichers.push({
                pattern: new RegExp("@(Check|Localize|Template)\\[([^\\]]+)\\](?:{([^}]+)})?", "g"),
                enricher: (match, options) => game.xprpg.TextEditor.enrichString(match, options),
            });

            // Soft-set system-preferred core settings until they've been explicitly set by the GM
            // const schema = foundry.data.PrototypeToken.schema;
            // schema.displayName.default = schema.displayBars.default = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;

            // Register stuff with the Foundry client
            registerFonts();
            registerHandlebarsHelpers();
            registerKeybindings();
            registerSettings();
            registerTemplates();

            MystifiedTraits.compile();

            // Create and populate initial game.xprpg interface
            SetGameXPRPG.onInit();

            // Disable tagify style sheets from modules
            for (const element of htmlQueryAll(document.head, "link[rel=stylesheet]")) {
                const href = element.getAttribute("href");
                if (href?.startsWith("modules/") && href.endsWith("tagify.css")) {
                    element.setAttribute("disabled", "");
                }
            }
        });
    },
};
