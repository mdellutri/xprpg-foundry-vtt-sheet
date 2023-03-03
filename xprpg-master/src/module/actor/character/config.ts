import { CreatureConfig, CreatureConfigData } from "@actor/creature/config";
import { CharacterXPRPG } from ".";

export class CharacterConfig extends CreatureConfig<CharacterXPRPG> {
    override async getData(options: Partial<DocumentSheetOptions> = {}): Promise<PCConfigData> {
        const { showBasicUnarmed } = this.actor.flags.xprpg;
        return {
            ...(await super.getData(options)),
            showBasicUnarmed,
        };
    }
}

interface PCConfigData extends CreatureConfigData<CharacterXPRPG> {
    showBasicUnarmed: boolean;
}
