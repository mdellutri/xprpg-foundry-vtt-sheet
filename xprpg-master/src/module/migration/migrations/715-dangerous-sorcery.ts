import { ItemSourceXPRPG } from "@item/data";
import { sluggify } from "@util";
import { MigrationBase } from "../base";

export class Migration715DangerousSorcery extends MigrationBase {
    static override version = 0.715;

    private dangerousSorcery = {
        key: "FlatModifier",
        phase: "afterDerived",
        predicate: {
            all: ["item:spell-slot", "item:duration:0", "damaging-effect"],
        },
        selector: "spell-damage",
        value: "@spell.level",
    };

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (source.type !== "feat") return;

        const slug = source.system.slug ?? sluggify(source.name);
        if (slug === "dangerous-sorcery" && !source.system.rules.length) {
            source.system.rules = [this.dangerousSorcery];
        }
    }
}