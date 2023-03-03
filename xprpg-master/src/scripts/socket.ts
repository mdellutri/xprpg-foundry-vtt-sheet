import { ItemTransfer, ItemTransferData } from "@actor/item-transfer";
import { ErrorXPRPG } from "@util";

interface TransferCallbackMessage {
    request: "itemTransfer";
    data: ItemTransferData;
}

interface RefreshControlsMessage {
    request: "refreshSceneControls";
    data: { layer?: string };
}

export type SocketEventCallback = [
    message: TransferCallbackMessage | RefreshControlsMessage | { request?: never },
    userId: string
];

export function activateSocketListener() {
    game.socket.on("system.xprpg", async (...[message, userId]: SocketEventCallback) => {
        const sender = game.users.get(userId, { strict: true });
        switch (message.request) {
            case "itemTransfer":
                if (game.user.isGM) {
                    console.debug(`XPRPG System | Received item-transfer request from ${sender.name}`);
                    const { data } = message;
                    const transfer = new ItemTransfer(data.source, data.target, data.quantity, data.containerId);
                    transfer.enact(sender);
                }
                break;
            case "refreshSceneControls":
                if (!game.user.isGM && message.data.layer === ui.controls.control?.layer) {
                    console.debug("XPRPG System | Refreshing Scene Controls");
                    ui.controls.initialize({ layer: message.data.layer });
                }
                break;
            default:
                throw ErrorXPRPG(`Received unrecognized socket emission: ${message.request}`);
        }
    });
}
