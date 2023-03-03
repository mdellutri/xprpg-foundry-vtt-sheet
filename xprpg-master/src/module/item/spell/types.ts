import { MAGIC_SCHOOLS, MAGIC_TRADITIONS, SPELL_COMPONENTS } from "./values";

type MagicSchool = SetElement<typeof MAGIC_SCHOOLS>;
type MagicTradition = SetElement<typeof MAGIC_TRADITIONS>;
type SpellComponent = (typeof SPELL_COMPONENTS)[number];
type SpellTrait = keyof ConfigXPRPG["XPRPG"]["spellTraits"] | MagicSchool | MagicTradition;

type EffectAreaSize = keyof ConfigXPRPG["XPRPG"]["areaSizes"];
type EffectAreaType = keyof ConfigXPRPG["XPRPG"]["areaTypes"];

export { EffectAreaSize, EffectAreaType, MagicSchool, MagicTradition, SpellComponent, SpellTrait };
