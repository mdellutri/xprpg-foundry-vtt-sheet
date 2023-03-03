import { resetActors } from "@actor/helpers";

const SETTINGS: Record<string, SettingRegistration> = {
    gradualBoostsVariant: {
        name: "XPRPG.SETTINGS.Variant.AbilityScore.GradualBoosts.Name",
        hint: "XPRPG.SETTINGS.Variant.AbilityScore.GradualBoosts.Hint",
        default: false,
        type: Boolean,
    },
    staminaVariant: {
        name: "XPRPG.SETTINGS.Variant.Stamina.Name",
        hint: "XPRPG.SETTINGS.Variant.Stamina.Hint",
        default: 0,
        type: Number,
        choices: {
            0: "XPRPG.SETTINGS.Variant.Stamina.Choices.0",
            1: "XPRPG.SETTINGS.Variant.Stamina.Choices.1", // I plan to expand this, hence the dropdown.
        },
    },
    ancestryParagonVariant: {
        name: "XPRPG.SETTINGS.Variant.AncestryParagon.Name",
        hint: "XPRPG.SETTINGS.Variant.AncestryParagon.Hint",
        default: 0,
        type: Boolean,
    },
    freeArchetypeVariant: {
        name: "XPRPG.SETTINGS.Variant.FreeArchetype.Name",
        hint: "XPRPG.SETTINGS.Variant.FreeArchetype.Hint",
        default: 0,
        type: Boolean,
    },
    dualClassVariant: {
        name: "XPRPG.SETTINGS.Variant.DualClass.Name",
        hint: "XPRPG.SETTINGS.Variant.DualClass.Hint",
        default: 0,
        type: Boolean,
    },
    automaticBonusVariant: {
        name: "XPRPG.SETTINGS.Variant.AutomaticBonus.Name",
        hint: "XPRPG.SETTINGS.Variant.AutomaticBonus.Hint",
        default: "noABP",
        type: String,
        choices: {
            noABP: "XPRPG.SETTINGS.Variant.AutomaticBonus.Choices.noABP",
            ABPFundamentalPotency: "XPRPG.SETTINGS.Variant.AutomaticBonus.Choices.ABPFundamentalPotency",
            ABPRulesAsWritten: "XPRPG.SETTINGS.Variant.AutomaticBonus.Choices.ABPRulesAsWritten",
        },
        onChange: () => {
            resetActors(game.actors.filter((a) => a.type === "character"));
        },
    },
    proficiencyVariant: {
        name: "XPRPG.SETTINGS.Variant.Proficiency.Name",
        hint: "XPRPG.SETTINGS.Variant.Proficiency.Hint",
        default: "ProficiencyWithLevel",
        type: String,
        choices: {
            ProficiencyWithLevel: "XPRPG.SETTINGS.Variant.Proficiency.Choices.ProficiencyWithLevel",
            ProficiencyWithoutLevel: "XPRPG.SETTINGS.Variant.Proficiency.Choices.ProficiencyWithoutLevel",
        },
    },
    proficiencyUntrainedModifier: {
        name: "XPRPG.SETTINGS.Variant.UntrainedModifier.Name",
        hint: "XPRPG.SETTINGS.Variant.UntrainedModifier.Hint",
        default: 0,
        type: Number,
    },
    proficiencyTrainedModifier: {
        name: "XPRPG.SETTINGS.Variant.TrainedModifier.Name",
        hint: "XPRPG.SETTINGS.Variant.TrainedModifier.Hint",
        default: 2,
        type: Number,
    },
    proficiencyExpertModifier: {
        name: "XPRPG.SETTINGS.Variant.ExpertModifier.Name",
        hint: "XPRPG.SETTINGS.Variant.ExpertModifier.Hint",
        default: 4,
        type: Number,
    },
    proficiencyMasterModifier: {
        name: "XPRPG.SETTINGS.Variant.MasterModifier.Name",
        hint: "XPRPG.SETTINGS.Variant.MasterModifier.Hint",
        default: 6,
        type: Number,
    },
    proficiencyLegendaryModifier: {
        name: "XPRPG.SETTINGS.Variant.LegendaryModifier.Name",
        hint: "XPRPG.SETTINGS.Variant.LegendaryModifier.Hint",
        default: 8,
        type: Number,
    },
};

export class VariantRulesSettings extends FormApplication {
    static override get defaultOptions(): FormApplicationOptions {
        return {
            ...super.defaultOptions,
            title: "XPRPG.SETTINGS.Variant.Title",
            id: "variant-rules-settings",
            template: "systems/xprpg/templates/system/settings/variant-rules-settings.hbs",
            width: 550,
            height: "auto",
            closeOnSubmit: true,
        };
    }

    override async getData(): Promise<Record<string, { value: unknown; setting: SettingRegistration }>> {
        return Object.entries(SETTINGS).reduce(
            (data: Record<string, { value: unknown; setting: SettingRegistration }>, [key, setting]) => ({
                ...data,
                [key]: { value: game.settings.get("xprpg", key), setting },
            }),
            {}
        );
    }

    static registerSettings(): void {
        for (const [k, v] of Object.entries(SETTINGS)) {
            v.config = false;
            v.scope = "world";
            game.settings.register("xprpg", k, v);
        }
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);
        $html.find("button[name=reset]").on("click", (event) => this.onResetDefaults(event));
    }

    /**
     * Handle button click to reset default settings
     * @param event The initial button click event
     */
    private async onResetDefaults(event: JQuery.ClickEvent): Promise<this> {
        event.preventDefault();
        for (const [k, v] of Object.entries(SETTINGS)) {
            await game.settings.set("xprpg", k, v?.default);
        }
        return this.render();
    }

    protected override async _onSubmit(
        event: Event,
        options: OnSubmitFormOptions = {}
    ): Promise<Record<string, unknown>> {
        event.preventDefault();
        return super._onSubmit(event, options);
    }

    protected override async _updateObject(_event: Event, data: Record<string, unknown>): Promise<void> {
        for (const key of Object.keys(SETTINGS)) {
            game.settings.set("xprpg", key, data[key]);
        }
    }
}
