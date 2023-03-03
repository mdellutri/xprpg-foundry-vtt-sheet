import { ItemSourceXPRPG } from "@item/data";
import { AELikeSource } from "@module/rules/rule-element/ae-like";
import { RuleElementSource } from "@module/rules";
import { MigrationBase } from "../base";

/**
 * Update rule elements on Bomber, Chirurgeon, Mutagenist, Toxicologist, Research Field, Field Discovery,
 * Greater Field Discovery, Perpetual Infusions, Perpetual Potency and Perpetual Perfection
 */
export class Migration816AlchemistResearchFields extends MigrationBase {
    static override version = 0.816;

    get #bomberSetFlags(): AELikeSource {
        return {
            key: "ActiveEffectLike",
            mode: "override",
            path: "flags.xprpg.alchemist",
            value: {
                fieldDiscovery: "Compendium.xprpg.classfeatures.8QAFgy9U8PxEa7Dw",
                greaterFieldDiscovery: "Compendium.xprpg.classfeatures.RGs4uR3CAvgbtBAA",
                perpetualInfusions: "Compendium.xprpg.classfeatures.DFQDtT1Van4fFEHi",
                perpetualPerfection: "Compendium.xprpg.classfeatures.xO90iBD8XNGyaCkz",
                perpetualPotency: "Compendium.xprpg.classfeatures.8rEVg03QJ71ic3PP",
            },
        };
    }

    get #chirurgeonSetFlags(): AELikeSource {
        return {
            key: "ActiveEffectLike",
            mode: "override",
            path: "flags.xprpg.alchemist",
            value: {
                fieldDiscovery: "Compendium.xprpg.classfeatures.qC0Iz6SlG2i9gv6g",
                greaterFieldDiscovery: "Compendium.xprpg.classfeatures.JJcaVijwRt9dsnac",
                perpetualInfusions: "Compendium.xprpg.classfeatures.fzvIe6FwwCuIdnjX",
                perpetualPerfection: "Compendium.xprpg.classfeatures.YByJ9O7oe8wxfbqs",
                perpetualPotency: "Compendium.xprpg.classfeatures.VS5vkqUQu4n7E28Y",
            },
        };
    }

    get #mutagenistSetFlags(): AELikeSource {
        return {
            key: "ActiveEffectLike",
            mode: "override",
            path: "flags.xprpg.alchemist",
            value: {
                fieldDiscovery: "Compendium.xprpg.classfeatures.V4Jt7eDnJBLv5bDj",
                greaterFieldDiscovery: "Compendium.xprpg.classfeatures.1BKdOJ0HNL6Eg3xw",
                perpetualInfusions: "Compendium.xprpg.classfeatures.Dug1oaVYejLmYEFt",
                perpetualPerfection: "Compendium.xprpg.classfeatures.CGetAmSbv06fW7GT",
                perpetualPotency: "Compendium.xprpg.classfeatures.mZFqRLYOQEqKA8ri",
            },
        };
    }

    get #toxicologistSetFlags(): AELikeSource {
        return {
            key: "ActiveEffectLike",
            mode: "override",
            path: "flags.xprpg.alchemist",
            value: {
                fieldDiscovery: "Compendium.xprpg.classfeatures.6zo2PJGYoig7nFpR",
                greaterFieldDiscovery: "Compendium.xprpg.classfeatures.tnqyQrhrZeDtDvcO",
                perpetualInfusions: "Compendium.xprpg.classfeatures.LlZ5R50z9j8jysZL",
                perpetualPerfection: "Compendium.xprpg.classfeatures.3R19zS7gERhEX87F",
                perpetualPotency: "Compendium.xprpg.classfeatures.JOdbVu14phvdjhaY",
            },
        };
    }

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        if (source.type !== "feat" || !source.system.slug) return;

        if (
            source.system.rules.some(
                (r: MaybeAELikeSource): r is MaybeAELikeSource =>
                    r.key === "ActiveEffectLike" && r.path === "flags.xprpg.alchemist"
            )
        ) {
            return;
        }

        switch (source.system.slug) {
            case "bomber": {
                source.system.rules.push(this.#bomberSetFlags);
                break;
            }
            case "chirurgeon": {
                source.system.rules.push(this.#chirurgeonSetFlags);
                break;
            }
            case "mutagenist": {
                source.system.rules.push(this.#mutagenistSetFlags);
                break;
            }
            case "toxicologist": {
                source.system.rules.push(this.#toxicologistSetFlags);
                break;
            }
        }
    }
}

interface MaybeAELikeSource extends RuleElementSource {
    path?: unknown;
}
