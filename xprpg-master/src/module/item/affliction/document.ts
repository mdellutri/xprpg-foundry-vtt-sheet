import { AbstractEffectXPRPG, EffectBadge } from "@item/abstract-effect";
import { UserXPRPG } from "@module/user";
import { AfflictionData } from "./data";

class AfflictionXPRPG extends AbstractEffectXPRPG {
    override get badge(): EffectBadge {
        const label = game.i18n.format("XPRPG.Item.Affliction.Stage", { stage: this.stage });
        return { type: "counter", value: this.stage, label };
    }

    get stage() {
        return this.system.stage;
    }

    override async increase(): Promise<void> {
        const maxStage = Object.values(this.system.stages).length;
        if (this.stage === maxStage) return;

        const stage = Math.min(maxStage, this.system.stage + 1);
        await this.update({ system: { stage } });
    }

    override async decrease(): Promise<void> {
        const stage = this.system.stage - 1;
        if (stage === 0) {
            await this.delete();
            return;
        }

        await this.update({ system: { stage } });
    }

    override prepareBaseData(): void {
        super.prepareBaseData();
        const maxStage = Object.values(this.system.stages).length || 1;
        this.system.stage = Math.clamped(this.system.stage, 1, maxStage);
    }

    protected override async _preUpdate(
        changed: DeepPartial<this["_source"]>,
        options: DocumentModificationContext<this>,
        user: UserXPRPG
    ): Promise<void> {
        const duration = changed.system?.duration;
        if (typeof duration?.unit === "string" && !["unlimited", "encounter"].includes(duration.unit)) {
            if (duration.value === -1) duration.value = 1;
        }

        return super._preUpdate(changed, options, user);
    }
}

interface AfflictionXPRPG extends AbstractEffectXPRPG {
    readonly data: AfflictionData;
}

export { AfflictionXPRPG };
