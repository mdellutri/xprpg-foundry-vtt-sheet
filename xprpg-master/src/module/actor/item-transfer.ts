import { PhysicalItemXPRPG } from "@item/index";
import { LocalizeXPRPG } from "@module/system/localize";
import { UserXPRPG } from "@module/user";
import { ErrorXPRPG } from "@util";
import { ActorXPRPG } from "./index";

export interface ItemTransferData {
    source: {
        tokenId?: string;
        actorId: string;
        itemId: string;
    };
    target: {
        tokenId?: string;
        actorId: string;
    };
    quantity: number;
    containerId?: string;
}

export class ItemTransfer implements ItemTransferData {
    private templatePaths = {
        flavor: "./systems/xprpg/templates/chat/action/flavor.hbs",
        content: "./systems/xprpg/templates/chat/action/content.hbs",
    };

    constructor(
        public source: ItemTransferData["source"],
        public target: ItemTransferData["target"],
        public quantity: number,
        public containerId?: string
    ) {}

    async request(): Promise<void> {
        const gamemaster = game.users.find((u) => u.isGM && u.active);
        if (!gamemaster) {
            const source = this.getSource();
            const target = this.getTarget();
            const loot = [source, target].find((a) => a?.isLootableBy(game.user) && !a.isOwner);

            if (!(loot instanceof ActorXPRPG)) throw ErrorXPRPG("Unexpected missing actor");
            const translations = LocalizeXPRPG.translations.XPRPG.loot;
            ui.notifications.error(
                game.i18n.format(translations.GMSupervisionError, { loot: ItemTransfer.tokenName(loot) })
            );
            return;
        }

        console.debug(`XPRPG System | Requesting item transfer from GM ${gamemaster.name}`);
        game.socket.emit("system.xprpg", { request: "itemTransfer", data: this });
    }

    // Only a GM can call this method, or else Foundry will block it (or would if we didn't first)
    async enact(requester: UserXPRPG): Promise<void> {
        if (!game.user.isGM) {
            throw ErrorXPRPG("Unauthorized item transfer");
        }

        console.debug("XPRPG System | Enacting item transfer");
        const sourceActor = this.getSource();
        const sourceItem = sourceActor?.items?.find((i) => i.id === this.source.itemId);
        const targetActor = this.getTarget();

        // Sanity checks
        if (
            !(
                sourceActor instanceof ActorXPRPG &&
                sourceItem instanceof PhysicalItemXPRPG &&
                targetActor instanceof ActorXPRPG &&
                sourceActor.isLootableBy(game.user) &&
                targetActor.isLootableBy(game.user)
            )
        ) {
            throw ErrorXPRPG("Failed sanity check during item transfer");
        }

        const targetItem = await sourceActor.transferItemToActor(
            targetActor,
            sourceItem,
            this.quantity,
            this.containerId
        );
        const sourceIsLoot = sourceActor.isOfType("loot") && sourceActor.system.lootSheetType === "Loot";

        // A merchant transaction can fail if funds are insufficient, but a loot transfer failing is an error.
        if (!sourceItem && sourceIsLoot) {
            return;
        }

        this.sendMessage(requester, sourceActor, targetActor, targetItem);
    }

    /** Retrieve the full actor from the source or target ID */
    private getActor(tokenId: string | undefined, actorId: string): ActorXPRPG | null {
        if (typeof tokenId === "string") {
            const token = canvas.tokens.placeables.find((t) => t.id === tokenId);
            return token?.actor ?? null;
        }
        return game.actors.get(actorId) ?? null;
    }

    private getSource(): ActorXPRPG | null {
        return this.getActor(this.source.tokenId, this.source.actorId);
    }

    private getTarget(): ActorXPRPG | null {
        return this.getActor(this.target.tokenId, this.target.actorId);
    }

    // Prefer token names over actor names
    private static tokenName(document: ActorXPRPG | User): string {
        if (document instanceof ActorXPRPG) {
            // Synthetic actor: use its token name or, failing that, actor name
            if (document.token) return document.token.name;

            // Linked actor: use its token prototype name
            return document.prototypeToken?.name ?? document.name;
        }
        // User with an assigned character
        if (document.character instanceof ActorXPRPG) {
            const token = canvas.tokens.placeables.find((t) => t.actor?.id === document.id);
            return token?.name ?? document.character?.name;
        }

        // User with no assigned character (should never happen)
        return document.name;
    }

    /** Send a chat message that varies on the types of transaction and parties involved
     * @param requester   The player who requested an item transfer to be performed by the GM
     * @param sourceActor The actor from which the item was dragged
     * @param targetActor The actor on which the item was dropped
     * @param item        The item created on the target actor as a result of the drag & drop
     */
    private async sendMessage(
        requester: UserXPRPG,
        sourceActor: ActorXPRPG,
        targetActor: ActorXPRPG,
        item: PhysicalItemXPRPG | null
    ): Promise<void> {
        const translations = LocalizeXPRPG.translations.XPRPG.loot;

        if (!item) {
            const sourceIsMerchant = sourceActor.isOfType("loot") && sourceActor.system.lootSheetType === "Merchant";
            if (sourceIsMerchant) {
                const message = translations.InsufficientFundsMessage;
                // The buyer didn't have enough funds! No transaction.

                const content = await renderTemplate(this.templatePaths.content, {
                    imgPath: targetActor.img,
                    message: game.i18n.format(message, { buyer: targetActor.name }),
                });

                const flavor = await this.messageFlavor(sourceActor, targetActor, translations.BuySubtitle);

                await ChatMessage.create({
                    user: requester.id,
                    speaker: { alias: ItemTransfer.tokenName(targetActor) },
                    type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
                    flavor,
                    content,
                });
                return;
            } else {
                throw ErrorXPRPG("Unexpected item-transfer failure");
            }
        }

        // Exhaustive pattern match to determine speaker and item-transfer parties
        type PatternMatch = [speaker: string, subtitle: string, formatArgs: Parameters<Game["i18n"]["format"]>];

        const [speaker, subtitle, formatArgs] = ((): PatternMatch => {
            const isMerchant = (actor: ActorXPRPG) =>
                actor.isOfType("loot") && actor.system.lootSheetType === "Merchant";
            const isWhat = (actor: ActorXPRPG) => ({
                isCharacter: actor.testUserPermission(requester, "OWNER") && actor.isOfType("character"),
                isMerchant: isMerchant(actor),
                isNPC:
                    actor.isOfType("npc") &&
                    actor.isLootableBy(requester) &&
                    !actor.testUserPermission(requester, "OWNER"),
                isLoot:
                    actor.isOfType("loot") &&
                    actor.isLootableBy(requester) &&
                    !actor.testUserPermission(requester, "OWNER") &&
                    !isMerchant(actor),
            });
            const source = isWhat(sourceActor);
            const target = isWhat(targetActor);

            if (source.isCharacter && target.isLoot) {
                // Character deposits item in loot container
                return [
                    ItemTransfer.tokenName(sourceActor),
                    translations.DepositSubtitle,
                    [
                        translations.DepositMessage,
                        {
                            depositor: ItemTransfer.tokenName(sourceActor),
                            container: ItemTransfer.tokenName(targetActor),
                        },
                    ],
                ];
            } else if (source.isCharacter && target.isMerchant) {
                // Character gives item to merchant
                return [
                    ItemTransfer.tokenName(sourceActor),
                    translations.GiveSubtitle,
                    [
                        translations.GiveMessage,
                        { giver: ItemTransfer.tokenName(sourceActor), recipient: ItemTransfer.tokenName(targetActor) },
                    ],
                ];
            } else if (source.isCharacter && target.isNPC) {
                // Character drops item on dead NPC
                return [
                    ItemTransfer.tokenName(sourceActor),
                    translations.PlantSubtitle,
                    [
                        translations.PlantMessage,
                        { planter: ItemTransfer.tokenName(sourceActor), corpse: ItemTransfer.tokenName(targetActor) },
                    ],
                ];
            } else if (source.isLoot && target.isCharacter) {
                // Character takes item from loot container
                return [
                    ItemTransfer.tokenName(targetActor),
                    translations.TakeSubtitle,
                    [
                        translations.TakeMessage,
                        { taker: ItemTransfer.tokenName(targetActor), container: ItemTransfer.tokenName(sourceActor) },
                    ],
                ];
            } else if (source.isNPC && target.isCharacter) {
                // Character takes item from loot container
                return [
                    ItemTransfer.tokenName(targetActor),
                    translations.LootSubtitle,
                    [
                        translations.LootMessage,
                        { looter: ItemTransfer.tokenName(targetActor), corpse: ItemTransfer.tokenName(sourceActor) },
                    ],
                ];
            } else if ([source, target].every((actor) => actor.isLoot || actor.isNPC)) {
                return [
                    // Character transfers item between two loot containers
                    requester.character?.name ?? requester.name,
                    translations.TransferSubtitle,
                    [
                        translations.TransferMessage,
                        {
                            transferrer: requester.character?.name ?? requester.name,
                            fromContainer: ItemTransfer.tokenName(sourceActor),
                            toContainer: ItemTransfer.tokenName(targetActor),
                        },
                    ],
                ];
            } else if (source.isLoot && target.isMerchant) {
                // Character gives item to merchant directly from loot container
                return [
                    requester.character?.name ?? requester.name,
                    translations.GiveSubtitle,
                    [
                        translations.GiveMessage,
                        {
                            seller: requester.character?.name ?? requester.name,
                            buyer: ItemTransfer.tokenName(targetActor),
                        },
                    ],
                ];
            } else if (source.isMerchant && target.isCharacter) {
                // Merchant sells item to character
                return [
                    ItemTransfer.tokenName(sourceActor),
                    translations.SellSubtitle,
                    [
                        translations.SellMessage,
                        { seller: ItemTransfer.tokenName(sourceActor), buyer: ItemTransfer.tokenName(targetActor) },
                    ],
                ];
            } else if (source.isMerchant && target.isLoot) {
                // Merchant sells item to character, who stows it directly in loot container
                return [
                    requester.character?.name ?? requester.name,
                    translations.SellSubtitle,
                    [
                        translations.SellMessage,
                        {
                            seller: ItemTransfer.tokenName(sourceActor),
                            buyer: requester.character?.name ?? requester.name,
                        },
                    ],
                ];
            } else {
                // Possibly to fill out later: Merchant sells item to character directly from loot container
                throw ErrorXPRPG("Unexpected item-transfer failure");
            }
        })();
        const formatProperties = formatArgs[1];
        if (!formatProperties) throw ErrorXPRPG("Unexpected item-transfer failure");
        formatProperties.quantity = this.quantity;
        formatProperties.item = item.name;

        // Don't bother showing quantity if it's only 1:
        const content = await renderTemplate(this.templatePaths.content, {
            imgPath: item.img,
            message: game.i18n.format(...formatArgs).replace(/\b1 × /, ""),
        });

        const flavor = await this.messageFlavor(sourceActor, targetActor, subtitle);

        await ChatMessage.create({
            user: requester.id,
            speaker: { alias: speaker },
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
            flavor,
            content,
        });
    }

    private async messageFlavor(sourceActor: ActorXPRPG, targetActor: ActorXPRPG, subtitle: string): Promise<string> {
        return await renderTemplate(this.templatePaths.flavor, {
            action: {
                title: "XPRPG.TraitInteract",
                subtitle: subtitle,
                tooltip: "XPRPG.TraitInteract",
                typeNumber: sourceActor.isOfType("loot") && targetActor.isOfType("loot") ? 2 : 1,
            },
            traits: [
                {
                    name: CONFIG.XPRPG.featTraits.manipulate,
                    description: CONFIG.XPRPG.traitsDescriptions.manipulate,
                },
            ],
        });
    }
}
