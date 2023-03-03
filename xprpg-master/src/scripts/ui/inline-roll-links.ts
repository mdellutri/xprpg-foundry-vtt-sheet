import { ActorXPRPG, CreatureXPRPG } from "@actor";
import { SKILL_DICTIONARY } from "@actor/values";
import { Statistic } from "@system/statistic";
import { ChatMessageXPRPG } from "@module/chat-message";
import { calculateDC } from "@module/dc";
import { eventToRollParams } from "@scripts/sheet-util";
import { htmlClosest, htmlQueryAll, objectHasKey, sluggify } from "@util";
import { getSelectedOrOwnActors } from "@util/token-actor-utils";
import { MeasuredTemplateDocumentXPRPG } from "@scene";
import { MeasuredTemplateXPRPG } from "@module/canvas";

const inlineSelector = ["action", "check", "effect-area", "repost"].map((keyword) => `[data-xprpg-${keyword}]`).join(",");

export const InlineRollLinks = {
    injectRepostElement: (links: HTMLElement[], foundryDoc?: ClientDocument | ClientDocument2): void => {
        for (const link of links) {
            if (!foundryDoc || foundryDoc.isOwner) link.classList.add("with-repost");

            const repostButtons = htmlQueryAll(link, "i[data-xprpg-repost]");
            if (repostButtons.length > 0) {
                if (foundryDoc && !foundryDoc.isOwner) {
                    for (const button of repostButtons) {
                        button.remove();
                    }
                    link.classList.remove("with-repost");
                }
                continue;
            }

            if (foundryDoc && !foundryDoc.isOwner) continue;

            const newButton = document.createElement("i");
            newButton.classList.add("fas", "fa-comment-alt");
            newButton.setAttribute("data-xprpg-repost", "");
            newButton.setAttribute("title", game.i18n.localize("XPRPG.Repost"));
            link.appendChild(newButton);
        }
    },

    listen: ($html: HTMLElement | JQuery, foundryDoc?: ClientDocument | ClientDocument2): void => {
        const html = $html instanceof HTMLElement ? $html : $html[0]!;
        if ($html instanceof HTMLElement) $html = $($html);

        const links = htmlQueryAll(html, inlineSelector).filter((l) => l.nodeName === "SPAN");
        InlineRollLinks.injectRepostElement(links, foundryDoc);
        const $repostLinks = $html.find("i.fas.fa-comment-alt").filter(inlineSelector);

        InlineRollLinks.flavorDamageRolls(html, foundryDoc instanceof ActorXPRPG ? foundryDoc : null);

        const documentFromDOM = (
            html: HTMLElement
        ): ActorXPRPG | JournalEntry | JournalEntryPage<JournalEntry> | null => {
            if (foundryDoc instanceof ChatMessageXPRPG) return foundryDoc.actor ?? foundryDoc.journalEntry ?? null;
            if (
                foundryDoc instanceof ActorXPRPG ||
                foundryDoc instanceof JournalEntry ||
                foundryDoc instanceof JournalEntryPage
            ) {
                return foundryDoc;
            }

            const sheet: { id?: string; document?: unknown; actor?: unknown; journalEntry?: unknown } | null =
                ui.windows[Number(html.closest<HTMLElement>(".app.sheet")?.dataset.appid)];

            return sheet.document instanceof ActorXPRPG || sheet.document instanceof JournalEntry
                ? sheet.document
                : null;
        };

        $repostLinks.filter("i[data-xprpg-repost]").on("click", (event) => {
            const target = event.currentTarget;
            const parent = target.parentElement;
            const document = documentFromDOM(target);
            if (parent) InlineRollLinks.repostAction(parent, document);
            event.stopPropagation();
        });

        const $links = $(links);
        $links.filter("[data-xprpg-action]").on("click", (event) => {
            const $target = $(event.currentTarget);
            const { xprpgAction, xprpgGlyph, xprpgVariant, xprpgDc, xprpgShowDc, xprpgSkill } = $target[0]?.dataset ?? {};
            const action = game.xprpg.actions[xprpgAction ? sluggify(xprpgAction, { camel: "dromedary" }) : ""];
            const visibility = xprpgShowDc ?? "all";
            if (xprpgAction && action) {
                action({
                    event,
                    glyph: xprpgGlyph,
                    variant: xprpgVariant,
                    difficultyClass: xprpgDc ? { scope: "check", value: Number(xprpgDc) || 0, visibility } : undefined,
                    skill: xprpgSkill,
                });
            } else {
                console.warn(`XPRPG System | Skip executing unknown action '${xprpgAction}'`);
            }
        });

        $links.filter("[data-xprpg-check]").on("click", (event) => {
            const { xprpgCheck, xprpgDc, xprpgTraits, xprpgLabel, xprpgAdjustment } = event.currentTarget.dataset;
            const actors = getSelectedOrOwnActors();
            if (actors.length === 0) {
                ui.notifications.error(game.i18n.localize("XPRPG.UI.errorTargetToken"));
                return;
            }
            const creatureActors = actors.filter((actor): actor is CreatureXPRPG => actor.isOfType("creature"));
            const parsedTraits = xprpgTraits
                ?.split(",")
                .map((trait) => trait.trim())
                .filter((trait) => !!trait);
            const eventRollParams = eventToRollParams(event);

            switch (xprpgCheck) {
                case "perception": {
                    for (const actor of creatureActors) {
                        const perceptionCheck = actor.system.attributes.perception;
                        if (perceptionCheck) {
                            const dc = Number.isInteger(Number(xprpgDc))
                                ? { label: xprpgLabel, value: Number(xprpgDc) }
                                : null;
                            const options = actor.getRollOptions(["all", "perception"]);
                            if (parsedTraits) {
                                options.push(...parsedTraits);
                            }
                            perceptionCheck.roll?.({ event, options, dc });
                        } else {
                            console.warn(`XPRPG System | Skip rolling perception for '${actor}'`);
                        }
                    }
                    break;
                }
                case "flat": {
                    for (const actor of actors) {
                        const flatCheck = new Statistic(actor, {
                            label: "",
                            slug: "flat-check",
                            modifiers: [],
                            check: { type: "flat-check" },
                            domains: ["flat-check"],
                        });
                        if (flatCheck) {
                            const dc = Number.isInteger(Number(xprpgDc))
                                ? { label: xprpgLabel, value: Number(xprpgDc) }
                                : null;
                            flatCheck.check.roll({
                                ...eventRollParams,
                                extraRollOptions: parsedTraits,
                                dc,
                            });
                        } else {
                            console.warn(`XPRPG System | Skip rolling flat check for "${actor}"`);
                        }
                    }
                    break;
                }
                case "will":
                case "fortitude":
                case "reflex": {
                    // Get the origin actor if any
                    const document = documentFromDOM(html);

                    for (const actor of actors) {
                        const savingThrow = actor.saves?.[xprpgCheck];
                        if (xprpgCheck && savingThrow) {
                            const dc = Number.isInteger(Number(xprpgDc))
                                ? { label: xprpgLabel, value: Number(xprpgDc) }
                                : null;
                            savingThrow.check.roll({
                                ...eventRollParams,
                                extraRollOptions: parsedTraits,
                                origin: document instanceof ActorXPRPG ? document : null,
                                dc,
                            });
                        } else {
                            console.warn(`XPRPG System | Skip rolling unknown saving throw '${xprpgCheck}'`);
                        }
                    }
                    break;
                }
                default: {
                    const skillName = objectHasKey(SKILL_DICTIONARY, xprpgCheck)
                        ? SKILL_DICTIONARY[xprpgCheck]
                        : xprpgCheck ?? "";
                    for (const actor of creatureActors) {
                        const skill = actor.skills[skillName];
                        if (skillName && skill) {
                            const dcValue =
                                xprpgDc === "@self.level"
                                    ? ((): number => {
                                          const pwlSetting = game.settings.get("xprpg", "proficiencyVariant");
                                          const proficiencyWithoutLevel = pwlSetting === "ProficiencyWithoutLevel";
                                          const level = actor.level;
                                          const adjustment = Number(xprpgAdjustment) || 0;
                                          return calculateDC(level, { proficiencyWithoutLevel }) + adjustment;
                                      })()
                                    : Number(xprpgDc);
                            const dc = dcValue > 0 ? { label: xprpgLabel, value: dcValue } : null;
                            skill.check.roll({
                                ...eventRollParams,
                                extraRollOptions: parsedTraits,
                                dc,
                            });
                        } else {
                            console.warn(
                                `XPRPG System | Skip rolling unknown skill check or untrained lore '${skillName}'`
                            );
                        }
                    }
                }
            }
        });

        $links.filter("[data-xprpg-effect-area]").on("click", async (event) => {
            const { xprpgEffectArea, xprpgDistance, xprpgTemplateData, xprpgTraits, xprpgWidth } = event.currentTarget.dataset;
            const templateConversion: Record<string, MeasuredTemplateType> = {
                burst: "circle",
                emanation: "circle",
                line: "ray",
                cone: "cone",
                rect: "rect",
            } as const;

            if (typeof xprpgEffectArea === "string") {
                const templateData: DeepPartial<foundry.data.MeasuredTemplateSource> = JSON.parse(
                    xprpgTemplateData ?? "{}"
                );
                templateData.distance ||= Number(xprpgDistance);
                templateData.fillColor ||= game.user.color;
                templateData.t = templateConversion[xprpgEffectArea];

                if (templateData.t === "ray") {
                    templateData.width =
                        Number(xprpgWidth) || CONFIG.MeasuredTemplate.defaults.width * (canvas.dimensions?.distance ?? 1);
                } else if (templateData.t === "cone") {
                    templateData.angle = CONFIG.MeasuredTemplate.defaults.angle;
                }

                if (xprpgTraits) {
                    templateData.flags = {
                        xprpg: {
                            origin: {
                                traits: xprpgTraits.split(","),
                            },
                        },
                    };
                }

                const templateDoc = new MeasuredTemplateDocumentXPRPG(templateData, { parent: canvas.scene });
                await new MeasuredTemplateXPRPG(templateDoc).drawPreview();
            } else {
                console.warn(`XPRPG System | Could not create template'`);
            }
        });
    },

    repostAction: (
        target: HTMLElement,
        document: ActorXPRPG | JournalEntry | JournalEntryPage<JournalEntry> | null = null
    ): void => {
        if (!["xprpgAction", "xprpgCheck", "xprpgEffectArea"].some((d) => d in target.dataset)) {
            return;
        }

        const flavor = target.attributes.getNamedItem("data-xprpg-repost-flavor")?.value ?? "";
        const showDC =
            target.attributes.getNamedItem("data-xprpg-show-dc")?.value ?? (document?.hasPlayerOwner ? "all" : "gm");
        const speaker =
            document instanceof ActorXPRPG
                ? ChatMessageXPRPG.getSpeaker({
                      actor: document,
                      token: document.token ?? document.getActiveTokens(false, true).shift(),
                  })
                : ChatMessageXPRPG.getSpeaker();

        // If the originating document is a journal entry, include its UUID as a flag
        const flags = document instanceof JournalEntry ? { xprpg: { journalEntry: document.uuid } } : {};

        ChatMessageXPRPG.create({
            speaker,
            content: `<span data-visibility="${showDC}">${flavor}</span> ${target.outerHTML}`.trim(),
            flags,
        });
    },

    /** Give inline damage-roll links from items flavor text of the item name */
    flavorDamageRolls(html: HTMLElement, actor: ActorXPRPG | null = null): void {
        for (const rollLink of htmlQueryAll(html, "a.inline-roll[data-damage-roll]")) {
            const itemId = htmlClosest(rollLink, "[data-item-id]")?.dataset.itemId;
            const item = actor?.items.get(itemId ?? "");
            if (item) rollLink.dataset.flavor ||= item.name;
        }
    },
};
