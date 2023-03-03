import { ActorSourceXPRPG } from "@actor/data";
import { ItemSourceXPRPG } from "@item/data";
import { RuleElementSource } from "@module/rules";
import { MigrationBase } from "../base";

/** Remove stored roll options, add flat-footed toggle to select items  */
export class Migration795CleanupFlatFootedToggle extends MigrationBase {
    static override version = 0.795;

    get #flatFootedToggle(): RollOptionRESource {
        return {
            key: "RollOption",
            domain: "all",
            label: "XPRPG.SpecificRule.TOTMToggle.FlatFooted",
            option: "target:condition:flat-footed",
            toggleable: "totm",
        };
    }

    override async updateActor(source: ActorSourceXPRPG): Promise<void> {
        if (source.flags.xprpg?.rollOptions) {
            source.flags.xprpg["-=rollOptions"] = null;
        }
    }

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (source.type === "feat" || (source.type === "action" && source.system.slug === "sneak-attack")) {
            switch (source.system.slug) {
                case "sneak-attack":
                case "laughing-shadow":
                case "shadow-sneak-attack":
                case "butterflys-sting":
                case "game-hunter-dedication": {
                    if (!source.system.rules.some((r) => this.#isFlatFootedToggle(r))) {
                        source.system.rules.push(this.#flatFootedToggle);
                    }
                }
            }
        }
    }

    #isFlatFootedToggle(rule: MaybeFlatFootedToggle): boolean {
        return (
            rule.key === "RollOption" && rule.option === "target:condition:flat-footed" && rule.toggleable === "totm"
        );
    }
}

interface MaybeFlatFootedToggle extends RuleElementSource {
    domain?: unknown;
    option?: unknown;
    toggleable?: unknown;
}

interface RollOptionRESource extends RuleElementSource {
    domain: string;
    option: string;
    toggleable: boolean | "totm";
}
