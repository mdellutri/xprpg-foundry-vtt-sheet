import { ActorXPRPG } from "@actor";
import { AbstractEffectXPRPG, EffectXPRPG } from "@item";
import { AfflictionXPRPG } from "@item/affliction";
import { EffectExpiryType } from "@item/effect/data";
import { TokenDocumentXPRPG } from "@scene";
import { htmlQuery, htmlQueryAll } from "@util";
import { FlattenedCondition } from "../system/conditions";

export class EffectsPanel extends Application {
    private get token(): TokenDocumentXPRPG | null {
        return canvas.tokens.controlled.at(0)?.document ?? null;
    }

    private get actor(): ActorXPRPG | null {
        return this.token?.actor ?? game.user?.character ?? null;
    }

    /**
     * Debounce and slightly delayed request to re-render this panel. Necessary for situations where it is not possible
     * to properly wait for promises to resolve before refreshing the UI.
     */
    refresh = foundry.utils.debounce(this.render, 100);

    static override get defaultOptions(): ApplicationOptions {
        return {
            ...super.defaultOptions,
            id: "xprpg-effects-panel",
            popOut: false,
            template: "systems/xprpg/templates/system/effects-panel.hbs",
        };
    }

    override async getData(options?: ApplicationOptions): Promise<EffectsPanelData> {
        const { actor } = this;
        if (!actor || !game.user.settings.showEffectPanel) {
            return { afflictions: [], conditions: [], effects: [], actor: null, user: { isGM: false } };
        }

        const effects =
            actor.itemTypes.effect.map((effect) => {
                const duration = effect.totalDuration;
                const { system } = effect;
                if (duration === Infinity) {
                    if (system.duration.unit === "encounter") {
                        system.remaining = system.expired
                            ? game.i18n.localize("XPRPG.EffectPanel.Expired")
                            : game.i18n.localize("XPRPG.EffectPanel.UntilEncounterEnds");
                    } else {
                        system.remaining = game.i18n.localize("XPRPG.EffectPanel.UnlimitedDuration");
                    }
                } else {
                    const duration = effect.remainingDuration;
                    system.remaining = system.expired
                        ? game.i18n.localize("XPRPG.EffectPanel.Expired")
                        : this.#getRemainingDurationLabel(
                              duration.remaining,
                              system.start.initiative ?? 0,
                              system.duration.expiry
                          );
                }
                return effect;
            }) ?? [];

        const conditions = game.xprpg.ConditionManager.getFlattenedConditions(actor.itemTypes.condition);

        return {
            ...(await super.getData(options)),
            actor,
            effects,
            conditions,
            afflictions: actor.itemTypes.affliction,
            user: { isGM: game.user.isGM },
        };
    }

    override activateListeners($html: JQuery): void {
        super.activateListeners($html);
        const html = $html[0]!;

        for (const effectEl of htmlQueryAll(html, ".effect-item[data-item-id]")) {
            const itemId = effectEl.dataset.itemId;
            if (!itemId) continue;

            const iconElem = effectEl.querySelector(".icon");
            // Increase or render persistent-damage dialog on left click
            iconElem?.addEventListener("click", async () => {
                const { actor } = this;
                const effect = actor?.items.get(itemId);
                if (actor && effect?.isOfType("condition") && effect.slug === "persistent-damage") {
                    await effect.onEndTurn({ token: this.token });
                } else if (effect instanceof AbstractEffectXPRPG) {
                    await effect.increase();
                }
            });

            // Remove effect or decrease its badge value on right-click
            iconElem?.addEventListener("contextmenu", async () => {
                const { actor } = this;
                const effect = actor?.items.get(itemId);
                if (effect instanceof AbstractEffectXPRPG) {
                    await effect.decrease();
                } else {
                    // Failover in case of a stale effect
                    this.refresh();
                }
            });

            effectEl.querySelector("[data-action=recover-persistent-damage]")?.addEventListener("click", () => {
                const item = this.actor?.items.get(itemId);
                if (item?.isOfType("condition")) {
                    item.rollRecovery();
                }
            });

            // Uses a scale transform to fit the text within the box
            // Note that the value container cannot have padding or measuring will fail.
            // They cannot be inline elements pre-computation, but most be post-computation (for ellipses)
            const valueContainer = htmlQuery(iconElem, ".value");
            const textElement = htmlQuery(valueContainer, "strong");
            if (valueContainer && textElement) {
                const minScale = 0.75;
                const parentWidth = valueContainer.clientWidth;
                const scale = textElement.clientWidth
                    ? Math.clamped(parentWidth / textElement.clientWidth, minScale, 1)
                    : 1;
                if (scale < 1) {
                    valueContainer.style.transformOrigin = "left";
                    valueContainer.style.transform = `scaleX(${scale})`;

                    // Unfortunately, width is pre scaling, so we need to scale it back up
                    // +1 prevents certain scenarios where ellipses will show even above min scale.
                    valueContainer.style.width = `${(1 / scale) * 100 + 1}%`;
                }

                textElement.style.display = "inline";
            }
        }
    }

    #getRemainingDurationLabel(remaining: number, initiative: number, expiry: EffectExpiryType | null): string {
        if (remaining >= 63_072_000) {
            // two years
            return game.i18n.format("XPRPG.EffectPanel.RemainingDuration.MultipleYears", {
                years: Math.floor(remaining / 31_536_000),
            });
        } else if (remaining >= 31_536_000) {
            // one year
            return game.i18n.localize("XPRPG.EffectPanel.RemainingDuration.SingleYear");
        } else if (remaining >= 1_209_600) {
            // two weeks
            return game.i18n.format("XPRPG.EffectPanel.RemainingDuration.MultipleWeeks", {
                weeks: Math.floor(remaining / 604_800),
            });
        } else if (remaining > 604_800) {
            // one week
            return game.i18n.localize("XPRPG.EffectPanel.RemainingDuration.SingleWeek");
        } else if (remaining >= 172_800) {
            // two days
            return game.i18n.format("XPRPG.EffectPanel.RemainingDuration.MultipleDays", {
                days: Math.floor(remaining / 86_400),
            });
        } else if (remaining > 7_200) {
            // two hours
            return game.i18n.format("XPRPG.EffectPanel.RemainingDuration.MultipleHours", {
                hours: Math.floor(remaining / 3_600),
            });
        } else if (remaining > 120) {
            // two minutes
            return game.i18n.format("XPRPG.EffectPanel.RemainingDuration.MultipleMinutes", {
                minutes: Math.floor(remaining / 60),
            });
        } else if (remaining >= 12) {
            // two rounds
            return game.i18n.format("XPRPG.EffectPanel.RemainingDuration.MultipleRounds", {
                rounds: Math.floor(remaining / 6),
            });
        } else if (remaining >= 6) {
            // one round
            return game.i18n.localize("XPRPG.EffectPanel.RemainingDuration.SingleRound");
        } else if (remaining >= 2) {
            // two seconds
            return game.i18n.format("XPRPG.EffectPanel.RemainingDuration.MultipleSeconds", { seconds: remaining });
        } else if (remaining === 1) {
            // one second
            return game.i18n.localize("XPRPG.EffectPanel.RemainingDuration.SingleSecond");
        } else {
            // zero rounds
            const key =
                expiry === "turn-end"
                    ? "XPRPG.EffectPanel.RemainingDuration.ZeroRoundsExpireTurnEnd"
                    : "XPRPG.EffectPanel.RemainingDuration.ZeroRoundsExpireTurnStart";
            return game.i18n.format(key, { initiative });
        }
    }
}

interface EffectsPanelData {
    afflictions: AfflictionXPRPG[];
    conditions: FlattenedCondition[];
    effects: EffectXPRPG[];
    actor: ActorXPRPG | null;
    user: { isGM: boolean };
}
