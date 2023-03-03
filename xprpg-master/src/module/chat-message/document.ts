import { ActorXPRPG } from "@actor";
import { StrikeData } from "@actor/data/base";
import { ItemXPRPG, ItemProxyXPRPG } from "@item";
import { traditionSkills, TrickMagicItemEntry } from "@item/spellcasting-entry/trick";
import { UserXPRPG } from "@module/user";
import { TokenDocumentXPRPG } from "@scene";
import { InlineRollLinks } from "@scripts/ui/inline-roll-links";
import { UserVisibilityXPRPG } from "@scripts/ui/user-visibility";
import { CheckRoll } from "@system/check";
import { DamageRoll } from "@system/damage/roll";
import { htmlQuery, parseHTML } from "@util";
import { ChatRollDetails } from "./chat-roll-details";
import { CriticalHitAndFumbleCards } from "./crit-fumble-cards";
import { ChatMessageDataXPRPG, ChatMessageFlagsXPRPG, ChatMessageSourceXPRPG, StrikeLookupData } from "./data";
import * as Listeners from "./listeners";

class ChatMessageXPRPG extends ChatMessage<ActorXPRPG> {
    /** The chat log doesn't wait for data preparation before rendering, so set some data in the constructor */
    constructor(data: DeepPartial<ChatMessageSourceXPRPG> = {}, context: DocumentConstructionContext<null> = {}) {
        data.flags = mergeObject(expandObject(data.flags ?? {}), { core: {}, xprpg: {} });
        super(data, context);

        // Backward compatibility for roll messages prior to `rollerId` (user ID) being stored with the roll
        for (const roll of this.rolls) {
            if (roll instanceof CheckRoll) {
                roll.roller ??= this.user ?? null;
            }
        }
    }

    /** Is this a damage (or a manually-inputed non-D20) roll? */
    get isDamageRoll(): boolean {
        const firstRoll = this.rolls.at(0);
        if (!firstRoll || firstRoll.terms.some((t) => t instanceof FateDie || t instanceof Coin)) {
            return false;
        }

        if (this.flags.xprpg.context?.type === "damage-roll") {
            return true;
        }

        const isCheck = firstRoll instanceof CheckRoll || firstRoll.dice[0]?.faces === 20;
        const fromRollTable = !!this.flags.core.RollTable;
        return !(isCheck || fromRollTable);
    }

    /** Get the actor associated with this chat message */
    get actor(): ActorXPRPG | null {
        return ChatMessageXPRPG.getSpeakerActor(this.speaker);
    }

    /** If this is a check or damage roll, it will have target information */
    get target(): { actor: ActorXPRPG; token: Embedded<TokenDocumentXPRPG> } | null {
        const context = this.flags.xprpg.context;
        if (!context) return null;
        const targetUUID = "target" in context ? context.target?.token : null;
        if (!targetUUID) return null;

        const match = /^Scene\.(\w+)\.Token\.(\w+)$/.exec(targetUUID ?? "") ?? [];
        const scene = game.scenes.get(match[1] ?? "");
        const token = scene?.tokens.get(match[2] ?? "");
        const actor = token?.actor;

        return actor ? { actor, token } : null;
    }

    /** If the message came from dynamic inline content in a journal entry, the entry's ID may be used to retrieve it */
    get journalEntry(): JournalEntry | null {
        const uuid = this.flags.xprpg.journalEntry;
        if (!uuid) return null;

        const entryId = /^JournalEntry.([A-Za-z0-9]{16})$/.exec(uuid)?.at(1);
        return game.journal.get(entryId ?? "") ?? null;
    }

    /** Does this message include a check (1d20 + c) roll? */
    get isCheckRoll(): boolean {
        return this.rolls[0] instanceof CheckRoll;
    }

    /** Does the message include a rerolled check? */
    get isReroll(): boolean {
        const context = this.flags.xprpg.context;
        return !!context && "isReroll" in context && !!context.isReroll;
    }

    /** Does the message include a check that hasn't been rerolled? */
    get isRerollable(): boolean {
        const roll = this.rolls[0];
        return !!(
            this.actor?.isOwner &&
            this.canUserModify(game.user, "update") &&
            roll instanceof CheckRoll &&
            roll.isRerollable
        );
    }

    /** Get the owned item associated with this chat message */
    get item(): Embedded<ItemXPRPG> | null {
        // If this is a strike, we usually want the strike's item
        const strike = this._strike;
        if (strike?.item) return strike.item as Embedded<ItemXPRPG>;

        const item = (() => {
            const domItem = this.getItemFromDOM();
            if (domItem) return domItem;

            const origin = this.flags.xprpg?.origin ?? null;
            const match = /Item\.(\w+)/.exec(origin?.uuid ?? "") ?? [];
            return this.actor?.items.get(match?.[1] ?? "") ?? null;
        })();
        if (!item) return null;

        // Assign spellcasting entry, currently only used for trick magic item
        const { tradition } = this.flags.xprpg?.casting ?? {};
        const isCharacter = item.actor.isOfType("character");
        if (tradition && item.isOfType("spell") && !item.spellcasting && isCharacter) {
            const trick = new TrickMagicItemEntry(item.actor, traditionSkills[tradition]);
            item.trickMagicEntry = trick;
        }

        if (item?.isOfType("spell")) {
            const spellVariant = this.flags.xprpg.spellVariant;
            const castLevel = this.flags.xprpg.casting?.level ?? item.level;
            const modifiedSpell = item.loadVariant({ overlayIds: spellVariant?.overlayIds, castLevel });
            return modifiedSpell ?? item;
        }

        return item;
    }

    /** If this message was for a strike, return the strike. Strikes will change in a future release */
    get _strike(): StrikeData | null {
        const { actor } = this;
        if (!actor?.system.actions) return null;

        // Get the strike index from either the flags or the DOM. In the case of roll macros, it's in the DOM
        const strikeData = ((): Pick<StrikeLookupData, "index" | "altUsage"> | null => {
            if (this.flags.xprpg.strike) return this.flags.xprpg.strike;
            const messageHTML = htmlQuery(ui.chat.element[0], `li[data-message-id="${this.id}"]`);
            const chatCard = htmlQuery(messageHTML, ".chat-card");
            const index = chatCard?.dataset.strikeIndex === undefined ? null : Number(chatCard?.dataset.strikeIndex);
            return typeof index === "number" ? { index } : null;
        })();

        if (strikeData) {
            const { index, altUsage } = strikeData;
            const action = actor.system.actions.at(index) ?? null;
            return altUsage
                ? action?.altUsages?.find((w) => (altUsage === "thrown" ? w.item.isThrown : w.item.isMelee)) ?? null
                : action;
        }

        return null;
    }

    /** Get stringified item source from the DOM-rendering of this chat message */
    getItemFromDOM(): Embedded<ItemXPRPG> | null {
        const $domMessage = $("ol#chat-log").children(`li[data-message-id="${this.id}"]`);
        const sourceString = $domMessage.find("div.xprpg.item-card").attr("data-embedded-item") ?? "null";
        try {
            const itemSource = JSON.parse(sourceString);
            const item = itemSource
                ? new ItemProxyXPRPG(itemSource, {
                      parent: this.actor,
                      fromConsumable: this.flags?.xprpg?.isFromConsumable,
                  })
                : null;
            return item as Embedded<ItemXPRPG> | null;
        } catch (_error) {
            return null;
        }
    }

    async showDetails() {
        if (!this.flags.xprpg.context) return;
        new ChatRollDetails(this).render(true);
    }

    /** Get the token of the speaker if possible */
    get token(): Embedded<TokenDocumentXPRPG> | null {
        if (!game.scenes) return null;
        const sceneId = this.speaker.scene ?? "";
        const tokenId = this.speaker.token ?? "";
        return game.scenes.get(sceneId)?.tokens.get(tokenId) ?? null;
    }

    override getRollData(): Record<string, unknown> {
        const { actor, item } = this;
        return { ...actor?.getRollData(), ...item?.getRollData() };
    }

    override async getHTML(): Promise<JQuery> {
        const { actor } = this;

        // Enrich flavor, which is skipped by upstream
        if (this.isContentVisible) {
            const rollData = this.getRollData();
            this.flavor = await TextEditor.enrichHTML(this.flavor, { async: true, rollData });
        }

        const $html = await super.getHTML();
        const html = $html[0]!;
        if (!this.flags.xprpg.suppressDamageButtons && this.isDamageRoll) {
            await Listeners.DamageButtons.listen(this, html);
        }

        await Listeners.DamageTaken.listen(this, html);
        CriticalHitAndFumbleCards.appendButtons(this, $html);
        Listeners.ChatCards.listen($html);
        InlineRollLinks.listen(html, this);
        Listeners.DegreeOfSuccessHighlights.listen(this, html);
        Listeners.MessageTooltips.listen($html);
        if (canvas.ready) Listeners.SetAsInitiative.listen($html);

        // Add persistent damage recovery button and listener (if evaluating persistent)
        const roll = this.rolls[0];
        if (actor?.isOwner && roll instanceof DamageRoll && roll.options.evaluatePersistent) {
            const damageType = roll.instances.find((i) => i.persistent)?.type;
            const condition = damageType ? this.actor?.getCondition(`persistent-damage-${damageType}`) : null;
            if (condition) {
                const template = "systems/xprpg/templates/chat/persistent-damage-recovery.hbs";
                const section = parseHTML(await renderTemplate(template));
                html.querySelector(".message-content")?.append(section);
                html.dataset.actorIsTarget = "true";
            }

            htmlQuery(html, "[data-action=recover-persistent-damage]")?.addEventListener("click", () => {
                const { actor } = this;
                if (!actor) return;

                const damageType = roll.instances.find((i) => i.persistent)?.type;
                if (!damageType) return;

                const condition = actor.getCondition(`persistent-damage-${damageType}`);
                if (!condition?.system.persistent) {
                    const damageTypeLocalized = game.i18n.localize(CONFIG.XPRPG.damageTypes[damageType] ?? damageType);
                    const message = game.i18n.format("XPRPG.Item.Condition.PersistentDamage.Error.DoesNotExist", {
                        damageType: damageTypeLocalized,
                    });
                    return ui.notifications.warn(message);
                }

                condition.rollRecovery();
            });
        }

        html.addEventListener("mouseenter", () => this.onHoverIn());
        html.addEventListener("mouseleave", () => this.onHoverOut());

        const sender = html.querySelector<HTMLElement>(".message-sender");
        sender?.addEventListener("click", this.onClickSender.bind(this));
        sender?.addEventListener("dblclick", this.onClickSender.bind(this));

        UserVisibilityXPRPG.processMessageSender(this, html);
        if (!actor && this.content) UserVisibilityXPRPG.process(html, { document: this });

        return $html;
    }

    private onHoverIn(): void {
        if (!canvas.ready) return;
        const token = this.token?.object;
        if (token?.isVisible && !token.controlled) {
            token.emitHoverIn();
        }
    }

    private onHoverOut(): void {
        if (canvas.ready) this.token?.object?.emitHoverOut();
    }

    private onClickSender(event: MouseEvent): void {
        if (!canvas) return;
        const token = this.token?.object;
        if (token?.isVisible && token.isOwner) {
            token.controlled ? token.release() : token.control({ releaseOthers: !event.shiftKey });
            // If a double click, also pan to the token
            if (event.type === "dblclick") {
                const scale = Math.max(1, canvas.stage.scale.x);
                canvas.animatePan({ ...token.center, scale, duration: 1000 });
            }
        }
    }

    protected override _onCreate(
        data: foundry.data.ChatMessageSource,
        options: DocumentModificationContext,
        userId: string
    ) {
        super._onCreate(data, options, userId);

        // Handle critical hit and fumble card drawing
        if (this.isRoll && game.settings.get("xprpg", "drawCritFumble")) {
            CriticalHitAndFumbleCards.handleDraw(this);
        }
    }
}

interface ChatMessageXPRPG extends ChatMessage<ActorXPRPG> {
    readonly data: ChatMessageDataXPRPG<this>;

    flags: ChatMessageFlagsXPRPG;

    blind: this["data"]["blind"];
    type: this["data"]["type"];
    whisper: this["data"]["whisper"];

    get user(): UserXPRPG;
}

declare namespace ChatMessageXPRPG {
    function getSpeakerActor(speaker: foundry.data.ChatSpeakerSource | foundry.data.ChatSpeakerData): ActorXPRPG | null;
}

export { ChatMessageXPRPG };
