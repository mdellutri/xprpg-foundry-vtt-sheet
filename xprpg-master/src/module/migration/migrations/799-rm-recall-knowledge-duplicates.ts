import { ItemSourceXPRPG } from "@item/data";
import { MigrationBase } from "../base";

/** Remove duplicate Recall Knowledge action items */
export class Migration799RMRecallKnowledgeDuplicates extends MigrationBase {
    static override version = 0.799;

    #oldIdsPattern = new RegExp(
        "xprpg\\.actionsxprpg\\.(?:"
            .concat(
                [
                    "KygTSeDvsFoSO6HW",
                    "B0Eu3EfwIa9kyDEA",
                    "SeUolRoPzorFUAaI",
                    "eT1jXYvz2YH70Ovp",
                    "B2BpIZFHoF9Kjzpx",
                    "LZgjpWd0pL3vK9Q1",
                    "KUfLlXDWTcAWhl8l",
                ].join("|")
            )
            .concat(")"),
        "g"
    );

    override async updateItem(source: ItemSourceXPRPG): Promise<void> {
        source.system.description.value ??= ""; // In case of uncorrected `null` value due to upstream bug from V9
        source.system.description.value = source.system.description.value.replace(
            this.#oldIdsPattern,
            "xprpg.actionsxprpg.1OagaWtBpVXExToo"
        );
    }
}
