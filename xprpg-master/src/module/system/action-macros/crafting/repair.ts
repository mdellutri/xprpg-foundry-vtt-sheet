import { PhysicalItemXPRPG } from "@item";
import { ChatMessageXPRPG } from "@module/chat-message";
import { calculateDC } from "@module/dc";
import { CheckDC } from "@system/degree-of-success";
import { ActionMacroHelpers } from "../helpers";
import { CharacterXPRPG } from "@actor";
import { SkillActionOptions } from "../types";
import { SelectItemDialog } from "./select-item";
import { UUIDUtils } from "@util/uuid-utils";

async function repair(options: RepairActionOptions) {
    // resolve item
    const item =
        options.item ??
        (options.uuid ? await UUIDUtils.fromUuid(options.uuid) : await SelectItemDialog.getItem("repair"));

    // ensure specified item is a valid crafting target
    if (item && !(item instanceof PhysicalItemXPRPG)) {
        ui.notifications.warn(game.i18n.format("XPRPG.Actions.Repair.Warning.NotPhysicalItem", { item: item.name }));
        return;
    }

    // check that actor has the necessary repair kit to craft item?
    // verify that item is damaged but not destroyed

    // figure out DC from item
    const dc: CheckDC | undefined =
        options.difficultyClass ??
        (() => {
            if (item) {
                const proficiencyWithoutLevel =
                    game.settings.get("xprpg", "proficiencyVariant") === "ProficiencyWithoutLevel";
                return {
                    label: game.i18n.format("XPRPG.Actions.Repair.Labels.ItemLevelRepairDC", { level: item.level }),
                    value: calculateDC(item.level, { proficiencyWithoutLevel }),
                    visibility: "all",
                };
            }
            return;
        })();

    const targetItemOptions = Array.from(item?.traits ?? []).map((trait) => `target:trait:${trait}`);

    const slug = options?.skill ?? "crafting";
    const rollOptions = ["action:repair", ...targetItemOptions];
    const modifiers = options?.modifiers;
    ActionMacroHelpers.simpleRollActionCheck({
        actors: options.actors,
        actionGlyph: options.glyph,
        title: "XPRPG.Actions.Repair.Title",
        checkContext: (opts) => ActionMacroHelpers.defaultCheckContext(opts, { modifiers, rollOptions, slug }),
        content: async (title) => {
            if (item) {
                const templatePath = "systems/xprpg/templates/system/actions/repair/item-heading-partial.hbs";
                const templateData = { item };
                const content = await renderTemplate(templatePath, templateData);
                return title + content;
            }
            return;
        },
        traits: ["exploration", "manipulate"],
        event: options.event,
        difficultyClass: dc,
        extraNotes: (selector: string) => [
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Repair", "criticalSuccess"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Repair", "success"),
            ActionMacroHelpers.note(selector, "XPRPG.Actions.Repair", "criticalFailure"),
        ],
        createMessage: false,
        callback: async (result) => {
            // react to check result by posting a chat message with appropriate follow-up options
            if (item && result.message instanceof ChatMessageXPRPG) {
                const messageSource = result.message.toObject();
                const flavor = await (async () => {
                    const proficiencyRank =
                        result.actor instanceof CharacterXPRPG ? result.actor.skills.crafting.rank : 0;
                    if ("criticalSuccess" === result.outcome) {
                        const label = "XPRPG.Actions.Repair.Labels.RestoreItemHitPoints";
                        const restored = String(10 + proficiencyRank * 10);
                        return renderRepairResult(item, "restore", label, restored);
                    } else if ("success" === result.outcome) {
                        const label = "XPRPG.Actions.Repair.Labels.RestoreItemHitPoints";
                        const restored = String(5 + proficiencyRank * 5);
                        return renderRepairResult(item, "restore", label, restored);
                    } else if ("criticalFailure" === result.outcome) {
                        const label = "XPRPG.Actions.Repair.Labels.RollItemDamage";
                        const damage = "2d6";
                        return renderRepairResult(item, "roll-damage", label, damage);
                    }
                    return "";
                })();
                if (flavor) {
                    messageSource.flavor += flavor;
                }
                await ChatMessage.create(messageSource);
            }
        },
    });
}

async function onRepairChatCardEvent(event: JQuery.ClickEvent, message: ChatMessageXPRPG | undefined, $card: JQuery) {
    const itemUuid = $card.attr("data-item-uuid");
    const item = await UUIDUtils.fromUuid(itemUuid ?? "");
    if (!(item instanceof PhysicalItemXPRPG)) return;
    const $button = $(event.currentTarget);
    const repair = $button.attr("data-repair");
    const speaker =
        message &&
        ChatMessageXPRPG.getSpeaker({
            actor: message.actor,
            alias: message.alias,
            token: message.token,
        });
    if (repair === "restore") {
        const value = Number($button.attr("data-repair-value") ?? "0");
        const beforeRepair = item.system.hp.value;
        const afterRepair = Math.min(item.system.hp.max, beforeRepair + value);
        await item.update({ "system.hp.value": afterRepair });
        const content = game.i18n.format("XPRPG.Actions.Repair.Chat.ItemRepaired", {
            itemName: item.name,
            repairedDamage: afterRepair - beforeRepair,
            afterRepairHitPoints: afterRepair,
            maximumHitPoints: item.system.hp.max,
        });
        await ChatMessage.create({ content, speaker });
    } else if (repair === "roll-damage") {
        const roll = await Roll.create("2d6").evaluate({ async: true });
        const templatePath = "systems/xprpg/templates/system/actions/repair/roll-damage-chat-message.hbs";
        const flavor = await renderTemplate(templatePath, {
            damage: {
                dealt: Math.max(0, roll.total - item.system.hardness),
                rolled: roll.total,
            },
            item,
        });
        await roll.toMessage({
            flags: {
                xprpg: {
                    suppressDamageButtons: true,
                },
            },
            flavor,
            speaker,
        });
    } else if (repair === "damage") {
        const hardness = Math.max(0, item.system.hardness);
        const damage = (message?.rolls.at(0)?.total ?? 0) - hardness;
        if (damage > 0) {
            const beforeDamage = item.system.hp.value;
            const afterDamage = Math.max(0, item.system.hp.value - damage);
            await item.update({ "system.hp.value": afterDamage });
            const content = game.i18n.format("XPRPG.Actions.Repair.Chat.ItemDamaged", {
                itemName: item.name,
                damageDealt: beforeDamage - afterDamage,
                afterDamageHitPoints: afterDamage,
                maximumHitPoints: item.system.hp.max,
            });
            await ChatMessage.create({ content, speaker });
        } else {
            const templatePath = "systems/xprpg/templates/system/actions/repair/roll-damage-chat-message.hbs";
            const content = await renderTemplate(templatePath, {
                damage: {
                    dealt: 0,
                    rolled: message?.rolls.at(0)?.total ?? 0,
                },
                item,
            });
            await ChatMessage.create({ content, speaker });
        }
    }
}

async function renderRepairResult(
    item: PhysicalItemXPRPG,
    result: "restore" | "roll-damage",
    buttonLabel: string,
    value: string
) {
    const templatePath = "systems/xprpg/templates/system/actions/repair/repair-result-partial.hbs";
    const label = game.i18n.format(buttonLabel, { value });
    return renderTemplate(templatePath, { item, label, result, value });
}

interface RepairActionOptions extends SkillActionOptions {
    difficultyClass?: CheckDC;
    item?: PhysicalItemXPRPG;
    uuid?: string;
}

export { onRepairChatCardEvent, repair };
