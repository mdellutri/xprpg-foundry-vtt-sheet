import { ErrorXPRPG } from "@util";
import MainTranslations from "static/lang/en.json";
import RETranslations from "static/lang/re-en.json";

type TranslationsXPRPG = Record<string, TranslationDictionaryValue> & typeof MainTranslations & typeof RETranslations;

export class LocalizeXPRPG {
    static ready = false;

    private static _translations: TranslationsXPRPG;

    static get translations(): TranslationsXPRPG {
        if (!this.ready) {
            throw ErrorXPRPG("LocalizeXPRPG instantiated too early");
        }
        if (this._translations === undefined) {
            this._translations = mergeObject(game.i18n._fallback, game.i18n.translations, {
                enforceTypes: true,
            }) as TranslationsXPRPG;
        }
        return this._translations;
    }
}
