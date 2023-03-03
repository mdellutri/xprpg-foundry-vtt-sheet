import { ItemTrait } from "@item/data/base";
import { TokenXPRPG } from "@module/canvas";
import { TokenDocumentXPRPG } from "..";

interface TokenAuraData {
    /** The radius of the aura, measured in feet from the boundary of a token's space */
    radius: number;

    /** The token from which this aura is emanating */
    token: TokenXPRPG | TokenDocumentXPRPG;

    /** The rectangle defining this aura's space */
    bounds: PIXI.Rectangle;

    /** The pixel-coordinate pair of this aura's (and token's) center */
    get center(): Point;

    /** The pixel-coordinate radius of this aura, measured from the center */
    radiusPixels: number;

    /** Traits (especially "visual" and "auditory") associated with this aura */
    traits: Set<ItemTrait>;
}

export { TokenAuraData };
