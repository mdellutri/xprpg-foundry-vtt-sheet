import { SkillAbbreviation } from "@actor/creature/data";
import { identifyItem, IdentifyAlchemyDCs, IdentifyMagicDCs, GenericIdentifyDCs } from "@item/identification";
import { PhysicalItemXPRPG } from "@item/physical";
import { ChatMessageXPRPG } from "@module/chat-message";
import { objectHasKey } from "@util";

export class IdentifyItemPopup extends FormApplication<PhysicalItemXPRPG> {
    static override get defaultOptions(): FormApplicationOptions {
        return {
            ...super.defaultOptions,
            id: "identify-item",
            title: game.i18n.localize("XPRPG.identification.Identify"),
            template: "systems/xprpg/templates/actors/identify-item.hbs",
            width: "auto",
            classes: ["identify-popup"],
        };
    }

    get item(): PhysicalItemXPRPG {
        return this.object;
    }

    override async getData(): Promise<IdentifyPopupData> {
        const item = this.object;
        const notMatchingTraditionModifier = game.settings.get("xprpg", "identifyMagicNotMatchingTraditionModifier");
        const proficiencyWithoutLevel = game.settings.get("xprpg", "proficiencyVariant") === "ProficiencyWithoutLevel";
        const dcs = identifyItem(item, { proficiencyWithoutLevel, notMatchingTraditionModifier });

        return {
            ...(await super.getData()),
            isMagic: ["arc", "nat", "rel", "occ"].some((s) => s in dcs),
            isAlchemical: "cra" in dcs,
            dcs,
        };
    }

    override activateListeners($form: JQuery<HTMLFormElement>): void {
        $form.find<HTMLButtonElement>("button.update-identification").on("click", (event) => {
            const $button = $(event.delegateTarget);
            this.submit({ updateData: { status: $button.val() } });
        });
        // add listener on Post skill checks to chat button that posts item unidentified img and name and skill checks
        $form.find<HTMLButtonElement>("button.post-skill-checks").on("click", async () => {
            const item = this.item;
            const itemImg = item.system.identification.unidentified.img;
            const itemName = item.system.identification.unidentified.name;
            const identifiedName = item.system.identification.identified.name;
            const skills = $("div#identify-item")
                .find("tr")
                .toArray()
                .flatMap((row): { name: string; shortForm: SkillAbbreviation; dc: number } | never[] => {
                    const shortForm = row.dataset.skill;
                    const dc = Number(row.dataset.dc);
                    if (!(Number.isInteger(dc) && objectHasKey(CONFIG.XPRPG.skills, shortForm))) {
                        return [];
                    }
                    const name = game.i18n.localize(CONFIG.XPRPG.skills[shortForm]);

                    return { shortForm, name, dc };
                });

            const content = await renderTemplate("systems/xprpg/templates/actors/identify-item-chat-skill-checks.hbs", {
                itemImg,
                itemName,
                identifiedName,
                skills,
            });

            await ChatMessageXPRPG.create({ user: game.user.id, content });
        });
    }

    protected override async _updateObject(_event: Event, formData: Record<string, unknown>): Promise<void> {
        const status = formData["status"];
        if (status === "identified") {
            await this.item.setIdentificationStatus(status);
        }
    }
}

interface IdentifyPopupData extends FormApplicationData {
    isMagic: boolean;
    isAlchemical: boolean;
    dcs: GenericIdentifyDCs | IdentifyMagicDCs | IdentifyAlchemyDCs;
}
