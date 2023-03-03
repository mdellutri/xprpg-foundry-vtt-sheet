import { SettingsMenuXPRPG } from "./menu";

const MetagameSettingsConfig = {
    showDC: {
        name: "XPRPG.SETTINGS.Metagame.ShowDC.Name",
        hint: "XPRPG.SETTINGS.Metagame.ShowDC.Hint",
        default: false,
        type: Boolean,
    },
    showResults: {
        name: "XPRPG.SETTINGS.Metagame.ShowResults.Name",
        hint: "XPRPG.SETTINGS.Metagame.ShowResults.Hint",
        default: true,
        type: Boolean,
    },
    tokenSetsNameVisibility: {
        name: "XPRPG.SETTINGS.Metagame.TokenSetsNameVisibility.Name",
        hint: "XPRPG.SETTINGS.Metagame.TokenSetsNameVisibility.Hint",
        default: false,
        type: Boolean,
        onChange: async () => {
            await ui.combat.render();
            const renderedMessages = document.querySelectorAll<HTMLLIElement>("#chat-log > li");
            for (const rendered of Array.from(renderedMessages)) {
                const message = game.messages.get(rendered?.dataset.messageId ?? "");
                if (!message) continue;
                await ui.chat.updateMessage(message);
            }
        },
    },
    secretDamage: {
        name: "XPRPG.SETTINGS.Metagame.SecretDamage.Name",
        hint: "XPRPG.SETTINGS.Metagame.SecretDamage.Hint",
        default: false,
        type: Boolean,
    },
    secretCondition: {
        name: "XPRPG.SETTINGS.Metagame.SecretCondition.Name",
        hint: "XPRPG.SETTINGS.Metagame.SecretCondition.Hint",
        default: false,
        type: Boolean,
    },
    partyVision: {
        name: "XPRPG.SETTINGS.Metagame.PartyVision.Name",
        hint: "XPRPG.SETTINGS.Metagame.PartyVision.Hint",
        default: false,
        type: Boolean,
        onChange: () => {
            if (canvas.ready && canvas.scene) {
                canvas.perception.update({ initializeVision: true, refreshLighting: true }, true);
            }
        },
    },
};

class MetagameSettings extends SettingsMenuXPRPG {
    static override namespace = "metagame";

    static override get settings(): typeof MetagameSettingsConfig {
        return MetagameSettingsConfig;
    }

    static override get SETTINGS(): string[] {
        return Object.keys(this.settings);
    }

    static override get prefix() {
        return `${this.namespace}_`;
    }
}

export { MetagameSettings };
