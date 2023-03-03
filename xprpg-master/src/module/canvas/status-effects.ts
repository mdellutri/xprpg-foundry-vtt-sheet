import { LocalizeXPRPG } from "@system/localize";
import { StatusEffectIconTheme } from "@scripts/config";
import { ErrorXPRPG, fontAwesomeIcon, htmlQueryAll, objectHasKey } from "@util";
import { TokenXPRPG } from "@module/canvas/token";
import { EncounterXPRPG } from "@module/encounter";
import { ChatMessageXPRPG } from "@module/chat-message";
import { PersistentDialog } from "@item/condition/persistent-damage-dialog";
import { resetActors } from "@actor/helpers";

const debouncedRender = foundry.utils.debounce(() => {
    canvas.tokens.hud.render();
}, 20);

/** Handle interaction with the TokenHUD's status effects menu */
export class StatusEffects {
    /** The ID of the last token processed following an encounter update */
    static #lastCombatantToken: string | null = null;

    static readonly #ICON_THEME_DIRS: Record<StatusEffectIconTheme, string> = {
        default: "systems/xprpg/icons/conditions/",
        blackWhite: "systems/xprpg/icons/conditions-2/",
    };

    /** Set the theme for condition icons on tokens */
    static setIconTheme(): void {
        const iconTheme = game.settings.get("xprpg", "statusEffectType");
        CONFIG.XPRPG.statusEffects.lastIconTheme = iconTheme;
        CONFIG.XPRPG.statusEffects.iconDir = this.#ICON_THEME_DIRS[iconTheme];
        this.#updateStatusIcons();
    }

    /** Link status effect icons to conditions */
    static initialize(): void {
        const iconTheme = game.settings.get("xprpg", "statusEffectType");
        CONFIG.XPRPG.statusEffects.lastIconTheme = iconTheme;
        CONFIG.XPRPG.statusEffects.iconDir = this.#ICON_THEME_DIRS[iconTheme];
        this.#updateStatusIcons();
    }

    static get conditions() {
        return LocalizeXPRPG.translations.XPRPG.condition;
    }

    /**
     * If the system setting statusEffectType is changed, we need to upgrade CONFIG
     * And migrate all statusEffect URLs of all Tokens
     */
    static async migrateStatusEffectUrls(chosenSetting: StatusEffectIconTheme): Promise<void> {
        console.debug("XPRPG System | Changing status effect icon types");
        const iconDir = this.#ICON_THEME_DIRS[chosenSetting];
        CONFIG.XPRPG.statusEffects.iconDir = iconDir;
        CONFIG.XPRPG.statusEffects.lastIconTheme = chosenSetting;
        this.#updateStatusIcons();
        await resetActors();
        if (canvas.ready) {
            for (const token of canvas.tokens.placeables) {
                token.drawEffects();
            }
        }
    }

    static #activateListeners(html: HTMLElement): void {
        // Mouse actions
        for (const control of htmlQueryAll(html, ".effect-control")) {
            control.addEventListener("click", (event) => {
                this.#setStatusValue(control, event);
            });
            control.addEventListener("contextmenu", (event) => {
                this.#setStatusValue(control, event);
            });

            control.addEventListener("mouseover", () => {
                this.#showStatusLabel(control);
            });
            control.addEventListener("mouseout", () => {
                this.#showStatusLabel(control);
            });
        }
    }

    /** Updates the core CONFIG.statusEffects with the new icons */
    static #updateStatusIcons(): void {
        const iconTheme = game.settings.get("xprpg", "statusEffectType");
        const directory = iconTheme === "default" ? "conditions" : "conditions-2";
        CONFIG.statusEffects = Object.entries(CONFIG.XPRPG.statusEffects.conditions).map(([id, label]) => ({
            id,
            label,
            icon: `systems/xprpg/icons/${directory}/${id}.webp` as const,
        }));
        CONFIG.statusEffects.push({
            id: "dead",
            label: "XPRPG.Actor.Dead",
            icon: CONFIG.controlIcons.defeated,
        });
    }

    static async onRenderTokenHUD(html: HTMLElement, tokenData: TokenHUDData): Promise<void> {
        const token = canvas.tokens.get(tokenData._id);
        if (!token) return;

        const iconGrid = html.querySelector<HTMLElement>(".status-effects");
        if (!iconGrid) throw ErrorXPRPG("Unexpected error retrieving status effects grid");

        const affectingConditions = token.actor?.itemTypes.condition.filter((c) => c.isInHUD) ?? [];

        const titleBar = document.createElement("div");
        titleBar.className = "title-bar";
        iconGrid.append(titleBar);

        const statusIcons = iconGrid.querySelectorAll<HTMLImageElement>(".effect-control");

        for (const icon of statusIcons) {
            // Replace the img element with a picture element, which can display ::after content
            const picture = document.createElement("picture");
            picture.classList.add("effect-control");
            picture.dataset.statusId = icon.dataset.statusId;
            picture.title = icon.title;
            const iconSrc = icon.getAttribute("src") as ImageFilePath;
            picture.setAttribute("src", iconSrc);
            const newIcon = document.createElement("img");
            newIcon.src = iconSrc;
            picture.append(newIcon);
            icon.replaceWith(picture);

            const slug = picture.dataset.statusId ?? "";
            const affecting = affectingConditions.filter((c) => c.slug === slug);
            if (affecting.length > 0 || iconSrc === token.document.overlayEffect) {
                picture.classList.add("active");
            }

            if (affecting.length > 0) {
                // Show a badge icon if the condition has a value or is locked
                const isOverridden = affecting.every((c) => c.system.references.overriddenBy.length > 0);
                const isLocked = affecting.every((c) => c.isLocked);
                const hasValue = affecting.some((c) => c.value);

                if (isOverridden) {
                    picture.classList.add("overridden");
                    const badge = fontAwesomeIcon("angle-double-down");
                    badge.classList.add("badge");
                    picture.append(badge);
                } else if (isLocked) {
                    picture.classList.add("locked");
                    const badge = fontAwesomeIcon("lock");
                    badge.classList.add("badge");
                    picture.append(badge);
                } else if (hasValue) {
                    picture.classList.add("valued");
                    const badge = document.createElement("i");
                    badge.classList.add("badge");
                    const value = Math.max(...affecting.map((c) => c.value ?? 1));
                    badge.innerText = value.toString();
                    picture.append(badge);
                }
            }
        }

        this.#activateListeners(iconGrid);
    }

    /** Called by `EncounterXPRPG#_onUpdate` */
    static onUpdateEncounter(encounter: EncounterXPRPG): void {
        if (!(game.user.isGM && game.settings.get("xprpg", "statusEffectShowCombatMessage"))) return;

        if (!encounter.started) {
            this.#lastCombatantToken = null;
            return;
        }

        const { combatant } = encounter;
        const token = combatant?.token;
        if (!(combatant && token)) return;

        if (token.id !== this.#lastCombatantToken && typeof combatant.initiative === "number" && !combatant.defeated) {
            this.#lastCombatantToken = token.id;
            this.#createChatMessage(token.object, combatant.hidden);
        }
    }

    /** Show the Status Effect name and summary on mouseover of the token HUD */
    static #showStatusLabel(control: HTMLElement): void {
        const titleBar = control.closest(".status-effects")?.querySelector<HTMLElement>(".title-bar");
        if (titleBar && control.title) {
            titleBar.innerText = control.title;
            titleBar.classList.toggle("active");
        }
    }

    /**
     * A click event handler to increment or decrement valued conditions.
     * @param event The window click event
     */
    static async #setStatusValue(control: HTMLElement, event: MouseEvent): Promise<void> {
        event.preventDefault();
        event.stopPropagation();

        const slug = control.dataset.statusId;

        for (const token of canvas.tokens.controlled) {
            const { actor } = token;
            if (!(actor && slug)) continue;

            // Persistent damage goes through a dialog instead
            if (slug === "persistent-damage") {
                await new PersistentDialog(actor).render(true);
                continue;
            }

            const condition = actor.itemTypes.condition.find(
                (c) => c.slug === slug && c.isInHUD && !c.system.references.parent
            );

            if (event.type === "click") {
                if (typeof condition?.value === "number") {
                    await game.xprpg.ConditionManager.updateConditionValue(condition.id, token, condition.value + 1);
                } else if (objectHasKey(CONFIG.XPRPG.conditionTypes, slug)) {
                    await token.actor?.increaseCondition(slug);
                } else {
                    this.#toggleStatus(token, control, event);
                }
            } else if (event.type === "contextmenu") {
                // Remove or decrement condition
                if (event.ctrlKey) {
                    // Remove all conditions
                    const conditionIds = actor.itemTypes.condition.filter((c) => c.slug === slug).map((c) => c.id);
                    await token.actor?.deleteEmbeddedDocuments("Item", conditionIds);
                } else if (condition?.value) {
                    await game.xprpg.ConditionManager.updateConditionValue(condition.id, token, condition.value - 1);
                } else {
                    await this.#toggleStatus(token, control, event);
                }
            }
        }
    }

    static async #toggleStatus(token: TokenXPRPG, control: HTMLElement, event: MouseEvent): Promise<void> {
        const { actor } = token;
        if (!actor) return;

        const slug = control.dataset.statusId ?? "";
        const imgElement = control.querySelector("img");
        const iconSrc = imgElement?.getAttribute("src") as ImageFilePath | null | undefined;

        const affecting = actor?.itemTypes.condition.find((c) => c.slug === slug && !c.system.references.parent);
        const conditionIds: string[] = [];

        if (event.type === "click" && !affecting) {
            if (objectHasKey(CONFIG.XPRPG.conditionTypes, slug)) {
                const newCondition = game.xprpg.ConditionManager.getCondition(slug).toObject();
                await token.actor?.createEmbeddedDocuments("Item", [newCondition]);
            } else if (iconSrc && (event.shiftKey || control.dataset.statusId === "dead")) {
                await token.toggleEffect(iconSrc, { overlay: true, active: true });
            }
        } else if (event.type === "contextmenu") {
            if (affecting) conditionIds.push(affecting.id);

            if (conditionIds.length > 0) {
                await token.actor?.deleteEmbeddedDocuments("Item", conditionIds);
            } else if (token.document.overlayEffect === iconSrc) {
                await token.toggleEffect(iconSrc, { overlay: true, active: false });
            }
        }
    }

    /** Creates a ChatMessage with the Actors current status effects. */
    static #createChatMessage(token: TokenXPRPG, whisper = false) {
        // Get the active applied conditions.
        // Iterate the list to create the chat and bubble chat dialog.
        const conditions = token.actor?.itemTypes.condition.filter((c) => c.active) ?? [];
        const statusEffectList = conditions.map((condition): string => {
            const conditionInfo = StatusEffects.conditions[condition.slug];
            const summary = conditionInfo.summary ?? "";
            const conditionValue = condition.value ?? "";
            return `
                <li><img src="${condition.img}" title="${summary}">
                    <span class="statuseffect-li">
                        <span class="statuseffect-li-text">${condition.name} ${conditionValue}</span>
                        <div class="statuseffect-rules"><h2>${condition.name}</h2>${condition.description}</div>
                    </span>
                </li>`;
        });

        if (statusEffectList.length === 0) return;

        const content = `
            <div class="dice-roll">
                <div class="dice-result">
                    <div class="dice-total statuseffect-message">
                        <ul>${statusEffectList.join("")}</ul>
                    </div>
                </div>
            </div>
        `;

        const messageSource: DeepPartial<foundry.data.ChatMessageSource> = {
            user: game.user.id,
            speaker: { alias: game.i18n.format("XPRPG.StatusEffects", { name: token.name }) },
            content,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        };
        const isNPCEvent = !token.actor?.hasPlayerOwner;
        const hideNPCEvent = isNPCEvent && game.settings.get("xprpg", "metagame_secretCondition");
        if (hideNPCEvent || whisper) {
            messageSource.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
        }
        ChatMessageXPRPG.create(messageSource);
    }

    /** Re-render the token HUD */
    static refresh(): void {
        if (canvas.ready && canvas.tokens.hud.rendered) {
            debouncedRender();
        }
    }
}
