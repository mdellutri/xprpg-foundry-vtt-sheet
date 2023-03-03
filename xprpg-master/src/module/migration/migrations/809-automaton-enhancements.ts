import { ItemSourceXPRPG } from "@item/data";
import { AELikeSource } from "@module/rules/rule-element/ae-like";
import { MigrationBase } from "../base";

/** Add base REs to Automaton anncestry to allow for automation of enhancements */
export class Migration809AutomatonEnhancements extends MigrationBase {
    static override version = 0.809;

    get #automatonEnhancements(): AELikeSource {
        return {
            key: "ActiveEffectLike",
            mode: "override",
            path: "flags.xprpg.automaton.enhancements",
            priority: 10,
            value: { greater: [], lesser: [] },
        };
    }

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        const isAutomaton = source.type === "ancestry" && source.system.slug === "automaton";
        const rules: Record<string, unknown>[] = source.system.rules;
        if (isAutomaton && !rules.some((r) => r.path === "flags.xprpg.automaton.enhancements")) {
            source.system.rules.push(this.#automatonEnhancements);
        }
    }
}
