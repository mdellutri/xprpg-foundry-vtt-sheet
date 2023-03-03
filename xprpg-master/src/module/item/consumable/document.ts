import { TrickMagicItemPopup } from "@actor/sheet/trick-magic-item-popup";
import { ItemXPRPG, PhysicalItemXPRPG, SpellcastingEntryXPRPG, SpellXPRPG, WeaponXPRPG } from "@item";
import { ItemSummaryData } from "@item/data";
import { TrickMagicItemEntry } from "@item/spellcasting-entry/trick";
import { ValueAndMax } from "@module/data";
import { RuleElementXPRPG } from "@module/rules";
import { DamageRoll } from "@system/damage/roll";
import { ErrorXPRPG } from "@util";
import { ConsumableData, ConsumableCategory } from "./data";
import { OtherConsumableTag } from "./types";

class ConsumableXPRPG extends PhysicalItemXPRPG {
    get otherTags(): Set<OtherConsumableTag> {
        return new Set(this.system.traits.otherTags);
    }

    get category(): ConsumableCategory {
        return this.system.consumableType.value;
    }

    get isAmmunition(): boolean {
        return this.category === "ammo";
    }

    get uses(): ValueAndMax {
        return {
            value: this.system.charges.value,
            max: this.system.charges.max,
        };
    }

    /** Should this item be automatically destroyed upon use */
    get autoDestroy(): boolean {
        return this.system.autoDestroy.value;
    }

    get embeddedSpell(): Embedded<SpellXPRPG> | null {
        if (!this.actor) throw ErrorXPRPG(`No owning actor found for "${this.name}" (${this.id})`);
        if (!this.system.spell) return null;

        return new SpellXPRPG(deepClone(this.system.spell), {
            parent: this.actor,
            fromConsumable: true,
        }) as Embedded<SpellXPRPG>;
    }

    get formula(): string | null {
        return this.system.consume.value.trim() || null;
    }

    /** Rule elements cannot be executed from consumable items, but they can be used to generate effects */
    override prepareRuleElements(): RuleElementXPRPG[] {
        const rules = super.prepareRuleElements();
        for (const rule of rules) {
            rule.ignored = true;
        }

        return rules;
    }

    override async getChatData(
        this: Embedded<ConsumableXPRPG>,
        htmlOptions: EnrichHTMLOptions = {}
    ): Promise<ItemSummaryData> {
        const systemData = this.system;
        const traits = this.traitChatData(CONFIG.XPRPG.consumableTraits);
        const [consumableType, isUsable] = this.isIdentified
            ? [game.i18n.localize(CONFIG.XPRPG.consumableTypes[this.category]), true]
            : [
                  this.generateUnidentifiedName({ typeOnly: true }),
                  !["other", "scroll", "talisman", "tool", "wand"].includes(this.category),
              ];

        const usesLabel = game.i18n.localize("XPRPG.ConsumableChargesLabel");

        return this.processChatData(htmlOptions, {
            ...systemData,
            traits,
            properties:
                this.isIdentified && this.uses.max > 0
                    ? [`${systemData.charges.value}/${systemData.charges.max} ${usesLabel}`]
                    : [],
            usesCharges: this.uses.max > 0,
            hasCharges: this.uses.max > 0 && this.uses.value > 0,
            consumableType,
            isUsable,
        });
    }

    override generateUnidentifiedName({ typeOnly = false }: { typeOnly?: boolean } = { typeOnly: false }): string {
        const liquidOrSubstance = () =>
            this.traits.has("inhaled") || this.traits.has("contact")
                ? "XPRPG.identification.UnidentifiedType.Substance"
                : "XPRPG.identification.UnidentifiedType.Liquid";
        const itemType = game.i18n.localize(
            ["drug", "elixir", "mutagen", "oil", "poison", "potion"].includes(this.category)
                ? liquidOrSubstance()
                : ["scroll", "snare", "ammo"].includes(this.category)
                ? CONFIG.XPRPG.consumableTypes[this.category]
                : "XPRPG.identification.UnidentifiedType.Object"
        );

        if (typeOnly) return itemType;

        return game.i18n.format("XPRPG.identification.UnidentifiedItem", { item: itemType });
    }

    override getRollOptions(prefix = this.type): string[] {
        return [
            ...super.getRollOptions(prefix),
            ...Object.entries({
                [`category:${this.category}`]: true,
            })
                .filter(([, isTrue]) => isTrue)
                .map(([key]) => `${prefix}:${key}`),
        ];
    }

    isAmmoFor(weapon: ItemXPRPG): boolean {
        if (!(weapon instanceof WeaponXPRPG)) {
            console.warn("Cannot load a consumable into a non-weapon");
            return false;
        }

        const { max } = this.uses;
        return weapon.traits.has("repeating") ? max > 1 : max <= 1;
    }

    /** Use a consumable item, sending the result to chat */
    async consume(this: Embedded<ConsumableXPRPG>): Promise<void> {
        const { value, max } = this.uses;

        if (["scroll", "wand"].includes(this.category) && this.system.spell) {
            if (this.actor.spellcasting.canCastConsumable(this)) {
                this.castEmbeddedSpell();
            } else if (this.actor.itemTypes.feat.some((feat) => feat.slug === "trick-magic-item")) {
                new TrickMagicItemPopup(this);
            } else {
                const formatParams = { actor: this.actor.name, spell: this.name };
                const message = game.i18n.format("XPRPG.LackCastConsumableCapability", formatParams);
                ui.notifications.warn(message);
                return;
            }
        } else {
            const exhausted = max > 1 && value === 1;
            const key = exhausted ? "UseExhausted" : max > 1 ? "UseMulti" : "UseSingle";
            const content = game.i18n.format(`XPRPG.ConsumableMessage.${key}`, {
                name: this.name,
                current: value - 1,
            });

            // If using this consumable creates a roll, we need to show it
            const flags = {
                xprpg: {
                    origin: {
                        sourceId: this.flags.core?.sourceId,
                        uuid: this.uuid,
                        type: this.type,
                    },
                },
            };

            if (this.category !== "ammo") {
                const speaker = ChatMessage.getSpeaker({ actor: this.actor });

                if (this.formula) {
                    const damageType = this.traits.has("positive")
                        ? "positive"
                        : this.traits.has("negative")
                        ? "negative"
                        : "untyped";
                    new DamageRoll(`${this.formula}[${damageType}]`).toMessage({ speaker, flavor: content, flags });
                } else {
                    ChatMessage.create({ speaker, content, flags });
                }
            }
        }

        const quantity = this.quantity;

        // Optionally destroy the item
        if (this.autoDestroy && value <= 1) {
            if (quantity <= 1) {
                await this.delete();
            } else {
                // Deduct one from quantity if this item has one charge or doesn't have charges
                await this.update({
                    "system.quantity": Math.max(quantity - 1, 0),
                    "system.charges.value": max,
                });
            }
        } else {
            // Deduct one charge
            await this.update({
                "system.charges.value": Math.max(value - 1, 0),
            });
        }
    }

    async castEmbeddedSpell(this: Embedded<ConsumableXPRPG>, trickMagicItemData?: TrickMagicItemEntry): Promise<void> {
        const spell = this.embeddedSpell;
        if (!spell) return;
        const actor = this.actor;

        // Find the best spellcasting entry to cast this consumable
        const entry = (() => {
            if (trickMagicItemData) return trickMagicItemData;
            return actor.spellcasting
                .filter((entry) => entry.canCastSpell(spell, { origin: this }))
                .reduce((previous, current) => {
                    const previousDC = previous.statistic.dc.value;
                    const currentDC = current.statistic.dc.value;
                    return currentDC > previousDC ? current : previous;
                });
        })();

        if (entry) {
            const systemData = spell.system;
            if (entry instanceof SpellcastingEntryXPRPG) {
                systemData.location.value = entry.id;
            }

            entry.cast(spell, { consume: false });
        }
    }
}

interface ConsumableXPRPG extends PhysicalItemXPRPG {
    readonly data: ConsumableData;
}

export { ConsumableXPRPG };
