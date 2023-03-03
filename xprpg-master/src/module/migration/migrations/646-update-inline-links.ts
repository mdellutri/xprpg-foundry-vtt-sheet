import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

export class Migration646UpdateInlineLinks extends MigrationBase {
    static override version = 0.646;

    private updateCheckAttributes(markup = ""): string {
        return markup
            .replace(/\bdata-xprpg-([a-z]+)-check="\w*"/g, 'data-xprpg-check="$1"')
            .replace(/\bdata-xprpg-(?:saving-throw|skill-check)\b/g, "data-xprpg-check");
    }

    override async updateActor(actorData: ActorSourceXPRPG): Promise<void> {
        if (actorData.type === "hazard") {
            const hazardDetails = actorData.system.details;
            hazardDetails.disable = this.updateCheckAttributes(hazardDetails.disable ?? "");
        }
    }

    override async updateItem(itemData: ItemSourceXPRPG): Promise<void> {
        const description = itemData.system.description;
        description.value = this.updateCheckAttributes(description.value ?? "");
    }
}
