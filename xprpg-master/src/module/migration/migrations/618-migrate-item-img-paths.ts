import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

export class Migration618MigrateItemImagePaths extends MigrationBase {
    static override version = 0.618;

    readonly IMAGE_PATHS: Record<string, ImageFilePath> = {
        "systems/xprpg/icons/equipment/weapons/blowgun.png": "systems/xprpg/icons/equipment/weapons/blowgun.jpg",
        "systems/xprpg/icons/equipment/weapons/trident.png": "systems/xprpg/icons/equipment/weapons/trident.jpg",
        "systems/xprpg/icons/equipment/weapons/longsword.png": "systems/xprpg/icons/equipment/weapons/longsword.jpg",
        "systems/xprpg/icons/equipment/weapons/composite-longbow.png":
            "systems/xprpg/icons/equipment/weapons/composite-longbow.jpg",
        "systems/xprpg/icons/equipment/weapons/composite-shortbow.png":
            "systems/xprpg/icons/equipment/weapons/composite-shortbow.jpg",
        "systems/xprpg/icons/equipment/weapons/dagger.png": "systems/xprpg/icons/equipment/weapons/dagger.jpg",
        "systems/xprpg/icons/equipment/weapons/katar.png": "systems/xprpg/icons/equipment/weapons/katar.jpg",
        "systems/xprpg/icons/equipment/weapons/kukri.png": "systems/xprpg/icons/equipment/weapons/kukri.jpg",
        "systems/xprpg/icons/equipment/weapons/shortbow.png": "systems/xprpg/icons/equipment/weapons/shortbow.jpg",
        "systems/xprpg/icons/equipment/weapons/scimitar.png": "systems/xprpg/icons/equipment/weapons/scimitar.jpg",
        "systems/xprpg/icons/equipment/weapons/hatchet.png": "systems/xprpg/icons/equipment/weapons/hatchet.jpg",
        "systems/xprpg/icons/equipment/weapons/halfling-sling-staff.png":
            "systems/xprpg/icons/equipment/weapons/halfling-sling-staff.jpg",
        "systems/xprpg/icons/equipment/weapons/halberd.png": "systems/xprpg/icons/equipment/weapons/halberd.jpg",
        "systems/xprpg/icons/equipment/weapons/shield-spikes.png":
            "systems/xprpg/icons/equipment/weapons/shield-spikes.jpg",
        "systems/xprpg/icons/equipment/weapons/light-mace.jpg": "systems/xprpg/icons/equipment/weapons/light-mace.jpg",
        "systems/xprpg/icons/equipment/weapons/morningstar.png": "systems/xprpg/icons/equipment/weapons/morningstar.jpg",
        "systems/xprpg/icons/equipment/weapons/sling.png": "systems/xprpg/icons/equipment/weapons/sling.jpg",
        "systems/xprpg/icons/equipment/weapons/main-gauche.png": "systems/xprpg/icons/equipment/weapons/main-gauche.jpg",
        "systems/xprpg/icons/equipment/weapons/bastard-sword.png":
            "systems/xprpg/icons/equipment/weapons/bastard-sword.jpg",
        "systems/xprpg/icons/equipment/weapons/spear.png": "systems/xprpg/icons/equipment/weapons/spear.jpg",
        "systems/xprpg/icons/equipment/weapons/staff.png": "systems/xprpg/icons/equipment/weapons/staff.jpg",
        "systems/xprpg/icons/equipment/weapons/katana.png": "systems/xprpg/icons/equipment/weapons/katana.jpg",
        "systems/xprpg/icons/equipment/weapons/elven-curve-blade.png":
            "systems/xprpg/icons/equipment/weapons/elven-curve-blade.jpg",
        "systems/xprpg/icons/equipment/weapons/bo-staff.png": "systems/xprpg/icons/equipment/weapons/bo-staff.jpg",
        "systems/xprpg/icons/equipment/weapons/clan-dagger.png": "systems/xprpg/icons/equipment/weapons/clan-dagger.jpg",
        "systems/xprpg/icons/equipment/weapons/dogslicer.png": "systems/xprpg/icons/equipment/weapons/dogslicer.jpg",
        "systems/xprpg/icons/equipment/weapons/falchion.png": "systems/xprpg/icons/equipment/weapons/falchion.jpg",
        "systems/xprpg/icons/equipment/weapons/fist.png": "systems/xprpg/icons/equipment/weapons/fist.jpg",
        "systems/xprpg/icons/equipment/weapons/gauntlet.png": "systems/xprpg/icons/equipment/weapons/gauntlet.jpg",
        "systems/xprpg/icons/equipment/weapons/gnome-hooked-hammer.png":
            "systems/xprpg/icons/equipment/weapons/gnome-hooked-hammer.jpg",
        "systems/xprpg/icons/equipment/weapons/greatpick.png": "systems/xprpg/icons/equipment/weapons/greatpick.jpg",
        "systems/xprpg/icons/equipment/weapons/guisarme.png": "systems/xprpg/icons/equipment/weapons/guisarme.jpg",
        "systems/xprpg/icons/equipment/weapons/horsechopper.png":
            "systems/xprpg/icons/equipment/weapons/horsechopper.jpg",
        "systems/xprpg/icons/equipment/weapons/lance.png": "systems/xprpg/icons/equipment/weapons/lance.jpg",
        "systems/xprpg/icons/equipment/weapons/maul.png": "systems/xprpg/icons/equipment/weapons/maul.jpg",
        "systems/xprpg/icons/equipment/weapons/pick.png": "systems/xprpg/icons/equipment/weapons/pick.jpg",
        "systems/xprpg/icons/equipment/weapons/ranseur.png": "systems/xprpg/icons/equipment/weapons/ranseur.jpg",
        "systems/xprpg/icons/equipment/weapons/sai.png": "systems/xprpg/icons/equipment/weapons/sai.jpg",
        "systems/xprpg/icons/equipment/weapons/sawtooth-saber.png":
            "systems/xprpg/icons/equipment/weapons/sawtooth-saber.jpg",
        "systems/xprpg/icons/equipment/weapons/shield-bash.png": "systems/xprpg/icons/equipment/weapons/shield-bash.jpg",
        "systems/xprpg/icons/equipment/weapons/shield-boss.png": "systems/xprpg/icons/equipment/weapons/shield-boss.jpg",
        "systems/xprpg/icons/equipment/weapons/shuriken.png": "systems/xprpg/icons/equipment/weapons/shuriken.jpg",
        "systems/xprpg/icons/equipment/weapons/spiked-gauntlet.png":
            "systems/xprpg/icons/equipment/weapons/spiked-gauntlet.jpg",
        "systems/xprpg/icons/equipment/weapons/broom.png": "systems/xprpg/icons/equipment/held-items/broom-of-flying.jpg",
        "systems/xprpg/icons/equipment/weapons/cutlass.png": "systems/xprpg/icons/equipment/weapons/scimitar.jpg",
        "systems/xprpg/icons/equipment/weapons/scalpel.png": "systems/xprpg/icons/equipment/weapons/war-razor.jpg",
        "systems/xprpg/icons/equipment/weapons/cane.png": "systems/xprpg/icons/equipment/weapons/cane.jpg",
    };

    override async updateItem(itemData: ItemSourceXPRPG) {
        itemData.img = this.IMAGE_PATHS[itemData.img] ?? itemData.img;
    }
}
