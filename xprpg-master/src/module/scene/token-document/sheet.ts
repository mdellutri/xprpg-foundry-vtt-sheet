import { VehicleXPRPG } from "@actor";
import { ErrorXPRPG, fontAwesomeIcon, htmlQuery } from "@util";
import { TokenDocumentXPRPG } from ".";

class TokenConfigXPRPG<TDocument extends TokenDocumentXPRPG> extends TokenConfig<TDocument> {
    override get template(): string {
        return "systems/xprpg/templates/scene/token/sheet.hbs";
    }

    /** Get this token's dimensions were they linked to its actor's size */
    get dimensionsFromActorSize(): number {
        const actorSize = this.actor?.size ?? "med";
        return {
            tiny: 0.5,
            sm: 1,
            med: 1,
            lg: 2,
            huge: 3,
            grg: 4,
        }[actorSize];
    }

    override async getData(options?: DocumentSheetOptions): Promise<TokenConfigDataXPRPG<TDocument>> {
        return {
            ...(await super.getData(options)),
            sizeLinkable: !!this.actor && !["hazard", "loot"].includes(this.actor.type),
            linkToSizeTitle: this.token.flags.xprpg.linkToActorSize ? "Unlink" : "Link",
            autoscaleTitle: this.token.flags.xprpg.autoscale ? "Unlink" : "Link",
        };
    }

    /** Hide token-sight settings when rules-based vision is enabled */
    override activateListeners($html: JQuery): void {
        super.activateListeners($html);

        const html = $html[0]!;

        this.#disableVisionInputs(html);

        if (this.token.flags.xprpg.autoscale) {
            this.#disableScale(html);
        }

        const linkToSizeButton = htmlQuery(html, "a[data-action=toggle-link-to-size]");
        linkToSizeButton?.addEventListener("click", async () => {
            await this.token.update({
                "flags.xprpg.linkToActorSize": !this.token.flags.xprpg.linkToActorSize,
            });
            this.#reestablishPrototype();
            await this.render();
        });

        const autoscaleButton = htmlQuery(html, "a[data-action=toggle-autoscale]");
        autoscaleButton?.addEventListener("click", async () => {
            await this.token.update({ "flags.xprpg.autoscale": !this.token.flags.xprpg.autoscale });
            this.#reestablishPrototype();
            await this.render();
        });
    }

    /** Disable the range input for token scale and style to indicate as much */
    #disableScale(html: HTMLElement): void {
        // If autoscaling is globally disabled, keep form input enabled
        if (!game.settings.get("xprpg", "tokens.autoscale")) return;

        const scale = html.querySelector(".form-group.scale");
        if (!scale) throw ErrorXPRPG("Scale form group missing");
        scale.classList.add("children-disabled");

        const constrainedScale = String(this.actor?.size === "sm" ? 0.8 : 1);
        const rangeInput = scale.querySelector<HTMLInputElement>("input[type=range]");
        if (rangeInput) {
            rangeInput.disabled = true;
            rangeInput.value = constrainedScale;
            const rangeDisplayValue = scale.querySelector(".range-value");
            if (rangeDisplayValue) rangeDisplayValue.innerHTML = constrainedScale;
        }
    }

    /**
     * A core bug present as of 10.291 will cause a `TokenConfig`'s `object`/`token` reference to become stale
     * following an update: reestablish it.
     */
    #reestablishPrototype(): void {
        if (this.isPrototype && this.actor) {
            const realPrototype = this.actor.prototypeToken as unknown as TDocument;
            this.object = this.token = realPrototype;
        }
    }

    #disableVisionInputs(html: HTMLElement): void {
        const actorIsPCOrFamiliar = ["character", "familiar"].includes(this.actor?.type ?? "");
        const rulesBasedVision =
            actorIsPCOrFamiliar &&
            (this.token.rulesBasedVision ||
                (this.isPrototype && game.settings.get("xprpg", "automation.rulesBasedVision")));
        if (!rulesBasedVision) return;

        const sightInputNames = ["angle", "brightness", "range", "saturation", "visionMode"].map((n) => `sight.${n}`);
        const sightInputs = Array.from(
            html.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
                sightInputNames.map((n) => `[name="${n}"]`).join(", ")
            )
        );

        const sightEnabledInput = html.querySelector<HTMLInputElement>('input[name="sight.enabled"]');
        if (!sightEnabledInput) throw ErrorXPRPG("sight.enabled input not found");
        sightEnabledInput.addEventListener("change", () => {
            for (const input of sightInputs) {
                input.disabled = !sightEnabledInput.checked;
                if (input.type === "range") {
                    if (!sightEnabledInput.checked) {
                        input.closest(".form-group")?.classList.add("children-disabled");
                    } else {
                        input.closest(".form-group")?.classList.remove("children-disabled");
                    }
                } else if (input.name === "sight.color") {
                    const colorInput = input.parentElement?.querySelector<HTMLInputElement>("input[type=color]");
                    if (colorInput) colorInput.disabled = !sightEnabledInput.checked;
                }
            }
        });

        // Indicate that vision settings are managed by rules-based vision
        for (const input of sightInputs) {
            input.disabled = true;
            if (input.type === "range") {
                input.closest(".form-group")?.classList.add("children-disabled");
            }
        }

        // Disable detection-mode tab link
        html.querySelector<HTMLAnchorElement>("a.item[data-tab=detection]")?.classList.add("disabled");

        const managedBy = document.createElement("a");
        managedBy.className = "managed-by-rbv";
        managedBy.append(fontAwesomeIcon("robot"));
        managedBy.title = game.i18n
            .localize("XPRPG.SETTINGS.Automation.RulesBasedVision.ManagedBy")
            .replace(/<\/?rbv>/g, "");
        for (const sightInput of sightInputs) {
            const anchor = managedBy.cloneNode(true);
            anchor.addEventListener("click", () => {
                const menu = game.settings.menus.get("xprpg.automation");
                if (!menu) throw ErrorXPRPG("Automation Settings application not found");
                const app = new menu.type();
                app.render(true);
            });

            const label = sightInput.closest(".form-group")?.querySelector("label");
            label?.append(anchor);
        }
    }

    /** Readd scale property to form data if input is disabled: necessary for mirroring checkboxes to function */
    protected override _getSubmitData(updateData: Record<string, unknown> | null = {}): Record<string, unknown> {
        const changes = updateData ?? {};
        if (this.form.querySelector<HTMLInputElement>("input[name=scale]")?.disabled) {
            changes["scale"] = Math.abs(this.token._source.texture.scaleX);
        }
        return super._getSubmitData(changes);
    }

    protected override async _updateObject(event: Event, formData: Record<string, unknown>) {
        if (formData["flags.xprpg.linkToActorSize"] === true) {
            if (this.actor instanceof VehicleXPRPG) {
                const { dimensions } = this.actor;
                const width = Math.max(Math.round(dimensions.width / 5), 1);
                const length = Math.max(Math.round(dimensions.length / 5), 1);
                formData["width"] = width;
                formData["height"] = length;
            } else {
                formData["width"] = formData["height"] = this.dimensionsFromActorSize;
            }
        }
        return super._updateObject(event, formData);
    }
}

interface TokenConfigDataXPRPG<TDocument extends TokenDocumentXPRPG> extends TokenConfigData<TDocument> {
    /** Whether the token can be linked to its actor's size */
    sizeLinkable: boolean;
    linkToSizeTitle: string;
    autoscaleTitle: string;
}

export { TokenConfigXPRPG };
