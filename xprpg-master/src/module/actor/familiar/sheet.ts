import { CharacterXPRPG } from "@actor";
import { CreatureSheetXPRPG } from "@actor/creature/sheet";
import { FamiliarXPRPG } from "@actor/familiar";
import { FamiliarSheetData } from "./types";

/**
 * @category Actor
 */
export class FamiliarSheetXPRPG extends CreatureSheetXPRPG<FamiliarXPRPG> {
    /** There is currently no actor config for familiars */
    protected readonly actorConfigClass = null;

    static override get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            classes: [...options.classes, "familiar"],
            width: 650,
            height: 680,
            tabs: [{ navSelector: ".sheet-navigation", contentSelector: ".sheet-content", initial: "attributes" }],
        });
        return options;
    }

    override get template() {
        return "systems/xprpg/templates/actors/familiar-sheet.hbs";
    }

    override async getData(options?: ActorSheetOptions): Promise<FamiliarSheetData> {
        const baseData = await super.getData(options);
        const familiar = this.actor;
        // Get all potential masters of the familiar
        const masters = game.actors.filter(
            (a): a is CharacterXPRPG => a.isOfType("character") && a.testUserPermission(game.user, "OWNER")
        );

        // list of abilities that can be selected as spellcasting ability
        const abilities = CONFIG.XPRPG.abilities;

        const size = CONFIG.XPRPG.actorSizes[familiar.system.traits.size.value] ?? null;
        const familiarAbilities = this.actor.master?.attributes?.familiarAbilities ?? { value: 0 };

        // Update save labels
        if (baseData.data.saves) {
            for (const key of ["fortitude", "reflex", "will"] as const) {
                const save = baseData.data.saves[key];
                save.label = CONFIG.XPRPG.saves[key];
            }
        }

        return {
            ...baseData,
            master: this.actor.master,
            masters,
            abilities,
            size,
            familiarAbilities,
        };
    }

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);

        $html.find("[data-action=perception-check]").on("click", (event) => {
            const options = this.actor.getRollOptions(["all", "perception"]);
            this.actor.attributes.perception.roll({ event, options });
        });

        $html.find("[data-attack-roll] *").on("click", (event) => {
            const options = this.actor.getRollOptions(["all", "attack"]);
            this.actor.system.attack.roll({ event, options });
        });
    }
}
