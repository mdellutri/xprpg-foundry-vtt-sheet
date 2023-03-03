import { CharacterXPRPG } from "@actor/character";
import { BaseWeaponProficiencyKey, WeaponGroupProficiencyKey } from "@actor/character/data";
import { BaseWeaponType } from "@item/weapon/types";
import { LocalizeXPRPG } from "@module/system/localize";
import { fontAwesomeIcon, htmlClosest, objectHasKey } from "@util";

async function add(actor: CharacterXPRPG, event: MouseEvent): Promise<void> {
    const translations = LocalizeXPRPG.translations.XPRPG;
    const weaponGroups = CONFIG.XPRPG.weaponGroups;
    const baseWeapons = translations.Weapon.Base;
    const template = await renderTemplate("systems/xprpg/templates/actors/add-combat-proficiency-dialog.hbs", {
        message: translations.AddCombatProficiency.Message,
        weaponGroups,
        baseWeapons,
    });

    const dialog = new Dialog({
        title: LocalizeXPRPG.translations.XPRPG.AddCombatProficiency.Title,
        content: template,
        buttons: {
            add: {
                icon: fontAwesomeIcon("check").outerHTML,
                label: LocalizeXPRPG.translations.XPRPG.AddShortLabel,
                callback: async ($dialog) => {
                    const selection = $dialog.find('select[name="proficiency"]').val();
                    if (typeof selection === "string" && selection) {
                        const proficiencyKey =
                            selection in weaponGroups
                                ? (`weapon-group-${selection}` as WeaponGroupProficiencyKey)
                                : (`weapon-base-${selection}` as BaseWeaponProficiencyKey);
                        await actor.addAttackProficiency(proficiencyKey);
                        const tab = htmlClosest(event.currentTarget, ".tab.skills");
                        if (tab) {
                            const $tab = $(tab);
                            $tab.animate({ scrollTop: $tab.height() }, "slow");
                        }
                    }
                },
            },
            cancel: {
                icon: fontAwesomeIcon("times").outerHTML,
                label: game.i18n.localize("Cancel"),
            },
        },
        default: "cancel",
    });
    dialog.render(true);
}

function remove(actor: CharacterXPRPG, event: MouseEvent) {
    const weaponGroups = CONFIG.XPRPG.weaponGroups;
    const baseWeapons = LocalizeXPRPG.translations.XPRPG.Weapon.Base;
    const key = htmlClosest(event.currentTarget, "li.skill.custom")?.dataset.skill ?? "";
    const translationKey = key?.replace(/^weapon-(?:base|group)-/, "") ?? "";
    const name = objectHasKey(weaponGroups, translationKey)
        ? game.i18n.localize(weaponGroups[translationKey])
        : baseWeapons[translationKey as BaseWeaponType];

    const dialogText = LocalizeXPRPG.translations.XPRPG.RemoveCombatProficiency;
    const message = game.i18n.format(dialogText.Message, { proficiency: name });
    Dialog.confirm({
        title: dialogText.Title,
        content: `<p>${message}</p>`,
        defaultYes: false,
        yes: () => {
            if (!(key in actor._source.system.martial)) return;
            actor.update({ [`system.martial.-=${key}`]: null });
        },
    });
}

export const ManageAttackProficiencies = { add, remove };
