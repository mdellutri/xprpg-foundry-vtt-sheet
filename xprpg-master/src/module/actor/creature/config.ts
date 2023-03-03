import { ALLIANCES } from "@actor/creature/values";
import { createSheetOptions, SheetOptions } from "@module/sheet/helpers";
import { ErrorXPRPG, setHasElement } from "@util";
import { CreatureXPRPG } from ".";
import { BaseCreatureSource, CreatureSystemSource, CreatureType } from "./data";

/** A DocumentSheet presenting additional, per-actor settings */
abstract class CreatureConfig<TActor extends CreatureXPRPG> extends DocumentSheet<TActor> {
    override get title(): string {
        const namespace = this.actor.isOfType("character") ? "Character" : "NPC";
        return game.i18n.localize(`XPRPG.Actor.${namespace}.Configure.Title`);
    }

    override get template(): string {
        return `systems/xprpg/templates/actors/${this.actor.type}/config.hbs`;
    }

    get actor(): TActor {
        return this.object;
    }

    static override get defaultOptions(): DocumentSheetOptions {
        const options = super.defaultOptions;
        options.width = 450;
        return options;
    }

    override async getData(options: Partial<DocumentSheetOptions> = {}): Promise<CreatureConfigData<TActor>> {
        const source: BaseCreatureSource<CreatureType, CreatureSystemSource> = this.actor._source;
        const alliance =
            source.system.details?.alliance === null ? "neutral" : source.system.details?.alliance ?? "default";
        const defaultValue = game.i18n.localize(
            this.actor.hasPlayerOwner ? "XPRPG.Actor.Creature.Alliance.Party" : "XPRPG.Actor.Creature.Alliance.Opposition"
        );

        const allianceOptions = {
            default: game.i18n.format("XPRPG.Actor.Creature.Alliance.Default", { alliance: defaultValue }),
            opposition: "XPRPG.Actor.Creature.Alliance.Opposition",
            party: "XPRPG.Actor.Creature.Alliance.Party",
            neutral: "XPRPG.Actor.Creature.Alliance.Neutral",
        };

        return {
            ...(await super.getData(options)),
            alliances: createSheetOptions(allianceOptions, { value: [alliance] }),
        };
    }

    /** Remove stored property if it's set to default; otherwise, update */
    override async _updateObject(event: Event, formData: Record<string, unknown>): Promise<void> {
        const key = "system.details.alliance";
        const alliance = formData[key];

        if (alliance === "default") {
            delete formData[key];
            formData["system.details.-=alliance"] = null;
        } else if (alliance === "neutral") {
            formData[key] = null;
        } else if (!setHasElement(ALLIANCES, alliance)) {
            throw ErrorXPRPG("Unrecognized alliance");
        }

        return super._updateObject(event, formData);
    }
}

interface CreatureConfigData<TActor extends CreatureXPRPG> extends DocumentSheetData<TActor> {
    alliances: SheetOptions;
}

export { CreatureConfig, CreatureConfigData };
