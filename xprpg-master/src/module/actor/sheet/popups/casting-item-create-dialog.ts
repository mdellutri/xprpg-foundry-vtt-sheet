import { ActorXPRPG } from "@actor/index";
import { SpellXPRPG } from "@item";
import { SpellConsumableItemType } from "@item/consumable/spell-consumables";
import { OneToTen } from "@module/data";
import { ErrorXPRPG } from "@util";

interface FormInputData extends FormApplicationData<ActorXPRPG> {
    itemTypeOptions?: Object;
    validLevels?: number[];
    itemType?: SpellConsumableItemType;
    level?: OneToTen;
}

type FormOutputData = {
    itemType: SpellConsumableItemType;
    level: OneToTen;
};

const itemTypeOptions = Object.fromEntries(
    new Map<SpellConsumableItemType, string>([
        ["scroll", "XPRPG.CastingItemCreateDialog.scroll"],
        ["wand", "XPRPG.CastingItemCreateDialog.wand"],
        ["cantripDeck5", "XPRPG.CastingItemCreateDialog.cantripDeck5"],
    ])
);

export class CastingItemCreateDialog extends FormApplication<ActorXPRPG> {
    onSubmitCallback: CastingItemCreateCallback;
    spell: SpellXPRPG;
    formDataCache: FormOutputData;

    constructor(
        object: ActorXPRPG,
        options: Partial<FormApplicationOptions>,
        callback: CastingItemCreateCallback,
        spell: SpellXPRPG
    ) {
        super(object, options);

        this.spell = spell;
        this.formDataCache = {
            itemType: this.spell.isCantrip ? "cantripDeck5" : "scroll",
            level: spell.baseLevel,
        };
        this.onSubmitCallback = callback;
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;

        options.classes = [];
        options.title = game.i18n.localize("XPRPG.CastingItemCreateDialog.title");
        options.template = "systems/xprpg/templates/popups/casting-item-create-dialog.hbs";
        options.width = "auto";
        options.submitOnChange = true;
        options.closeOnSubmit = false;

        return options;
    }

    override async getData(): Promise<FormInputData> {
        if (!this.spell) {
            throw ErrorXPRPG("CastingItemCreateDialog | Could not read spelldata");
        }

        const { cantripDeck5: cantripDeck5, ...nonCantripOptions } = itemTypeOptions;
        const minimumLevel = this.spell.baseLevel;
        const levels = Array.from(Array(11 - minimumLevel).keys()).map((index) => minimumLevel + index);
        return {
            ...(await super.getData()),
            validLevels: levels,
            itemTypeOptions: this.spell.isCantrip ? { cantripDeck5: cantripDeck5 } : nonCantripOptions,
            itemType: this.formDataCache.itemType,
            level: this.formDataCache.level,
        };
    }

    override async _updateObject(event: Event, formData: FormOutputData) {
        Object.assign(this.formDataCache, formData);

        if (event.type !== "submit") {
            await this.render();
            return;
        }

        if (this.formDataCache.itemType === "wand" && this.formDataCache.level === 10) {
            ui.notifications.warn(game.i18n.localize("XPRPG.CastingItemCreateDialog.10thLevelWand"));
        } else if (this.onSubmitCallback && this.spell) {
            this.onSubmitCallback(this.formDataCache.level, this.formDataCache.itemType, this.spell);
        }
        this.close();
    }
}

type CastingItemCreateCallback = (
    level: OneToTen,
    itemType: SpellConsumableItemType,
    spell: SpellXPRPG
) => Promise<void>;
