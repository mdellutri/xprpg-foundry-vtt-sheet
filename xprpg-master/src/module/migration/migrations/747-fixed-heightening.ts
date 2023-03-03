import { SpellXPRPG } from "@item";
import { ItemSourceXPRPG, SpellSource } from "@item/data";
import { sluggify } from "@util";
import { UUIDUtils } from "@util/uuid-utils";
import { MigrationBase } from "../base";

/** Handle spells gaining fixed level heightening */
export class Migration747FixedHeightening extends MigrationBase {
    static override version = 0.747;

    override async updateItem(item: ItemSourceXPRPG): Promise<void> {
        if (item.type !== "spell") return;

        const isAcidSplash = (item.system.slug ?? sluggify(item.name)) === "acid-splash";
        if (item.system.heightening?.type === "fixed" && !isAcidSplash) return;

        const sourceId = item.flags.core?.sourceId;
        if (sourceId && this.fixedHeightenSpells.has(sourceId)) {
            const spells = await this.loadSpells();
            const spell = spells[sourceId];
            if (spell && spell.system.heightening?.type === "fixed") {
                item.system.heightening = spell.system.heightening;
                this.overwriteDamage(item, spell);
            }
        }
    }

    protected overwriteDamage(spell: SpellSource, newSpell: SpellXPRPG) {
        const newDamage = newSpell.system.damage;
        const newKeys = new Set(Object.keys(newDamage.value));
        const diff = Object.keys(spell.system.damage.value).filter((key) => !newKeys.has(key));
        const damage: { value: Record<string, unknown> } = spell.system.damage;
        damage.value = newDamage.value;
        for (const deleteKey of diff) {
            damage.value[`-=${deleteKey}`] = null;
        }
    }

    #loadedSpells?: Record<string, SpellXPRPG | undefined>;

    // Ensure compendium is only hit if the migration runs, and only once
    protected async loadSpells() {
        if (this.#loadedSpells) {
            return this.#loadedSpells;
        }

        const spells = await UUIDUtils.fromUUIDs([...this.fixedHeightenSpells]);
        this.#loadedSpells = spells.reduce((record, spell) => ({ ...record, [spell.uuid]: spell }), {});
        return this.#loadedSpells;
    }

    fixedHeightenSpells = new Set<DocumentUUID>([
        "Compendium.xprpg.spells-srd.0fKHBh5goe2eiFYL",
        "Compendium.xprpg.spells-srd.10VcmSYNBrvBphu1",
        "Compendium.xprpg.spells-srd.2gQYrCPwBmwau26O",
        "Compendium.xprpg.spells-srd.2iQKhCQBijhj5Rf3",
        "Compendium.xprpg.spells-srd.4koZzrnMXhhosn0D",
        "Compendium.xprpg.spells-srd.5WM3WjshXgrkVCg6",
        "Compendium.xprpg.spells-srd.7CUgqHunmHfW2lC5",
        "Compendium.xprpg.spells-srd.7OFKYR1VY6EXDuiR",
        "Compendium.xprpg.spells-srd.9s5tqqXNzcoKamWx",
        "Compendium.xprpg.spells-srd.BCuHKrDeJ4eq53M6",
        "Compendium.xprpg.spells-srd.CxpFy4HJHf4ACbxF",
        "Compendium.xprpg.spells-srd.D2nPKbIS67m9199U",
        "Compendium.xprpg.spells-srd.DCQHaLrYXMI37dvW",
        "Compendium.xprpg.spells-srd.DgcSiOCR1uDXGaEA",
        "Compendium.xprpg.spells-srd.EfFMLVbmkBWmzoLF",
        "Compendium.xprpg.spells-srd.Et8RSCLx8w7uOLvo",
        "Compendium.xprpg.spells-srd.F23T5tHPo3WsFiHW",
        "Compendium.xprpg.spells-srd.FhOaQDTSnsY7tiam",
        "Compendium.xprpg.spells-srd.Fr58LDSrbndgld9n",
        "Compendium.xprpg.spells-srd.GaRQlC9Yw1BGKHfN",
        "Compendium.xprpg.spells-srd.HGmBY8KjgLV97nUp",
        "Compendium.xprpg.spells-srd.HHGUBGle4OjoxvNR",
        "Compendium.xprpg.spells-srd.HTou8cG05yuSkesj",
        "Compendium.xprpg.spells-srd.HWrNMQENi9WSGbnF",
        "Compendium.xprpg.spells-srd.HcIAQZjNXHemoXSU",
        "Compendium.xprpg.spells-srd.Ifc2b6bNVdjKV7Si",
        "Compendium.xprpg.spells-srd.JHntYF0SbaWKq7wR",
        "Compendium.xprpg.spells-srd.LQzlKbYjZSMFQawP",
        "Compendium.xprpg.spells-srd.LiGbewa9pO0yjbsY",
        "Compendium.xprpg.spells-srd.Llx0xKvtu8S4z6TI",
        "Compendium.xprpg.spells-srd.Mkbq9xlAUxHUHyR2",
        "Compendium.xprpg.spells-srd.OAt2ZEns1gIOCgrn",
        "Compendium.xprpg.spells-srd.OhD2Z6rIGGD5ocZA",
        "Compendium.xprpg.spells-srd.PRrZ7anETWPm90YY",
        "Compendium.xprpg.spells-srd.PjhUmyKnq6K5uDby",
        "Compendium.xprpg.spells-srd.Popa5umI3H33levx",
        "Compendium.xprpg.spells-srd.Pwq6T7xpfAJXV5aj",
        "Compendium.xprpg.spells-srd.Q7QQ91vQtyi1Ux36",
        "Compendium.xprpg.spells-srd.Seaah9amXg70RKw2",
        "Compendium.xprpg.spells-srd.U58aQWJ47VrI36yP",
        "Compendium.xprpg.spells-srd.UmXhuKrYZR3W16mQ",
        "Compendium.xprpg.spells-srd.VTb0yI6P1bLkzuRr",
        "Compendium.xprpg.spells-srd.VlNcjmYyu95vOUe8",
        "Compendium.xprpg.spells-srd.W02bHXylIpoXbO4e",
        "Compendium.xprpg.spells-srd.WsUwpfmhKrKwoIe3",
        "Compendium.xprpg.spells-srd.Wt94cw03L77sbud7",
        "Compendium.xprpg.spells-srd.XhgMx9WC6NfXd9RP",
        "Compendium.xprpg.spells-srd.ZAX0OOcKtYMQlquR",
        "Compendium.xprpg.spells-srd.ZqmP9gijBmK7y8Xy",
        "Compendium.xprpg.spells-srd.aIHY2DArKFweIrpf",
        "Compendium.xprpg.spells-srd.atlgGNI1E1Ox3O3a",
        "Compendium.xprpg.spells-srd.bay4AfSu2iIozNNW",
        "Compendium.xprpg.spells-srd.czO0wbT1i320gcu9",
        "Compendium.xprpg.spells-srd.dINQzhqGmIsqGMUY",
        "Compendium.xprpg.spells-srd.drmvQJETA3WZzXyw",
        "Compendium.xprpg.spells-srd.e36Z2t6tLdW3RUzZ",
        "Compendium.xprpg.spells-srd.fprqWKUc0jnMIyGU",
        "Compendium.xprpg.spells-srd.gISYsBFby1TiXfBt",
        "Compendium.xprpg.spells-srd.ivKnEtI1z4UqEKIA",
        "Compendium.xprpg.spells-srd.kuoYff1csM5eAcAP",
        "Compendium.xprpg.spells-srd.lbrWMnS2pecKaSVB",
        "Compendium.xprpg.spells-srd.lsR3RLEdBG4rcSzd",
        "Compendium.xprpg.spells-srd.nXmC2Xx9WmS5NsAo",
        "Compendium.xprpg.spells-srd.o6YCGx4lycsYpww4",
        "Compendium.xprpg.spells-srd.pZTqGY1MLRjgKasV",
        "Compendium.xprpg.spells-srd.pt3gEnzA159uHcJC",
        "Compendium.xprpg.spells-srd.pwzdSlJgYqN7bs2w",
        "Compendium.xprpg.spells-srd.q5qmNn144ZJGxnvJ",
        "Compendium.xprpg.spells-srd.qTr2oCgIXl703Whb",
        "Compendium.xprpg.spells-srd.qwlh6aDgi86U3Q7H",
        "Compendium.xprpg.spells-srd.r4HLQcYwB62bTayl",
        "Compendium.xprpg.spells-srd.sFwoKj0TsacsmoWj",
        "Compendium.xprpg.spells-srd.vLA0q0WOK2YPuJs6",
        "Compendium.xprpg.spells-srd.vLzFcIaSXs7YTIqJ",
        "Compendium.xprpg.spells-srd.vTQvfYu2llKQedmY",
        "Compendium.xprpg.spells-srd.vctIUOOgSmxAF0KG",
        "Compendium.xprpg.spells-srd.wzctak6BxOW8xvFV",
        "Compendium.xprpg.spells-srd.x5rGOmhDRDVQPrnW",
        "Compendium.xprpg.spells-srd.x7SPrsRxGb2Vy2nu",
        "Compendium.xprpg.spells-srd.x9RIFhquazom4p02",
        "Compendium.xprpg.spells-srd.xRgU9rrhmGAgG4Rc",
        "Compendium.xprpg.spells-srd.yH13KXUK2x093NUv",
        "Compendium.xprpg.spells-srd.yM3KTTSAIHhyuP14",
        "Compendium.xprpg.spells-srd.zlnXpME1T2uvn8Lr",
        "Compendium.xprpg.spells-srd.zul5cBTfr7NXHBZf",
    ]);
}
