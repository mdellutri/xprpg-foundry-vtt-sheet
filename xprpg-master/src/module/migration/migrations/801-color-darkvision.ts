import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Add color darkvision flags to fetchlings and the Resonant Reflection of Life */
export class Migration801ColorDarkvision extends MigrationBase {
    static override version = 0.801;

    get #colorDarkvision() {
        return { key: "ActiveEffectLike", path: "flags.xprpg.colorDarkvision", mode: "override", value: true };
    }

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (!source.system.slug) return;
        const isFetchling = source.type === "ancestry" && source.system.slug === "fetchling";
        const isResonantLight =
            source.type === "feat" && source.system.slug === "resonant-reflection-reflection-of-light";
        const getsColorDarkvision = isFetchling || isResonantLight;
        const rules: Record<string, unknown>[] = source.system.rules;
        if (getsColorDarkvision && !rules.some((r) => r.path === "flags.xprpg.colorDarkvision")) {
            source.system.rules.push(this.#colorDarkvision);
        }
    }
}
