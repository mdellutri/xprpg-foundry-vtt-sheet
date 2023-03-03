import { ClassXPRPG } from "@item/class";
import { createSheetTags, SheetOptions } from "@module/sheet/helpers";
import { ABCSheetData, ABCSheetXPRPG } from "../abc/sheet";

export class ClassSheetXPRPG extends ABCSheetXPRPG<ClassXPRPG> {
    override async getData(options?: Partial<DocumentSheetOptions>): Promise<ClassSheetData> {
        const sheetData = await super.getData(options);
        const itemData = sheetData.item;

        return {
            ...sheetData,
            skills: CONFIG.XPRPG.skills,
            proficiencyChoices: CONFIG.XPRPG.proficiencyLevels,
            selectedKeyAbility: this.getLocalizedAbilities(itemData.system.keyAbility),
            ancestryTraits: createSheetTags(CONFIG.XPRPG.ancestryItemTraits, itemData.system.traits),
            trainedSkills: createSheetTags(CONFIG.XPRPG.skills, itemData.system.trainedSkills),
            ancestryFeatLevels: createSheetTags(CONFIG.XPRPG.levels, itemData.system.ancestryFeatLevels),
            classFeatLevels: createSheetTags(CONFIG.XPRPG.levels, itemData.system.classFeatLevels),
            generalFeatLevels: createSheetTags(CONFIG.XPRPG.levels, itemData.system.generalFeatLevels),
            skillFeatLevels: createSheetTags(CONFIG.XPRPG.levels, itemData.system.skillFeatLevels),
            skillIncreaseLevels: createSheetTags(CONFIG.XPRPG.levels, itemData.system.skillIncreaseLevels),
        };
    }
}

interface ClassSheetData extends ABCSheetData<ClassXPRPG> {
    skills: typeof CONFIG.XPRPG.skills;
    proficiencyChoices: typeof CONFIG.XPRPG.proficiencyLevels;
    selectedKeyAbility: Record<string, string>;
    ancestryTraits: SheetOptions;
    trainedSkills: SheetOptions;
    ancestryFeatLevels: SheetOptions;
    classFeatLevels: SheetOptions;
    generalFeatLevels: SheetOptions;
    skillFeatLevels: SheetOptions;
    skillIncreaseLevels: SheetOptions;
}
