import { ABCItemXPRPG, FeatXPRPG, ItemXPRPG } from "@item";
import { OneToFour } from "@module/data";
import { BackgroundData } from "./data";

class BackgroundXPRPG extends ABCItemXPRPG {
    /** Set a skill feat granted by a GrantItem RE as one of this background's configured items */
    override prepareSiblingData(this: Embedded<BackgroundXPRPG>): void {
        if (Object.keys(this.system.items).length > 0) return;
        const grantedSkillFeat = Object.values(this.flags.xprpg.itemGrants)
            .flatMap((g) => this.actor.items.get(g.id) ?? [])
            .find((i: Embedded<ItemXPRPG> & { featType?: unknown }): i is Embedded<FeatXPRPG> => i.featType === "skill");

        if (grantedSkillFeat) {
            this.system.items["GRANT"] = {
                uuid: grantedSkillFeat.sourceId ?? grantedSkillFeat.uuid,
                img: grantedSkillFeat.img,
                name: grantedSkillFeat.name,
                level: 1,
            };
            grantedSkillFeat.system.location = this.id;
        }
    }

    override prepareActorData(this: Embedded<BackgroundXPRPG>): void {
        if (!this.actor.isOfType("character")) {
            console.error("Only a character can have a background");
            return;
        }

        this.actor.background = this;
        const { build } = this.actor.system;

        // Add ability boosts
        const boosts = Object.values(this.system.boosts);
        for (const boost of boosts) {
            if (boost.selected) {
                build.abilities.boosts.background.push(boost.selected);
            }
        }

        const { trainedSkills } = this.system;
        if (trainedSkills.value.length === 1) {
            const key = trainedSkills.value[0];
            const skill = this.actor.system.skills[key];
            skill.rank = Math.max(skill.rank, 1) as OneToFour;
        }
    }
}

interface BackgroundXPRPG extends ABCItemXPRPG {
    readonly data: BackgroundData;
}

export { BackgroundXPRPG };
