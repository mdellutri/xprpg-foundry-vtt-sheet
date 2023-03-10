import { ItemXPRPG } from "@item";

/** Check an item prior to its deletion for GrantItem on-delete actions */
async function processGrantDeletions(item: Embedded<ItemXPRPG>, pendingItems: Embedded<ItemXPRPG>[]): Promise<void> {
    const { actor } = item;

    const granter = actor.items.get(item.flags.xprpg.grantedBy?.id ?? "");
    const parentGrant = Object.values(granter?.flags.xprpg.itemGrants ?? {}).find((g) => g.id === item.id);
    const grants = Object.values(item.flags.xprpg.itemGrants);

    // Handle deletion restrictions, aborting early if found in either this item's granter or any of its grants
    if (granter && parentGrant?.onDelete === "restrict" && !pendingItems.includes(granter)) {
        ui.notifications.warn(
            game.i18n.format("XPRPG.Item.RemovalPrevented", { item: item.name, preventer: granter.name })
        );
        pendingItems.splice(pendingItems.indexOf(item), 1);
        return;
    }

    for (const grant of grants) {
        const grantee = actor.items.get(grant.id);
        if (grantee?.flags.xprpg.grantedBy?.id !== item.id) continue;

        if (grantee.flags.xprpg.grantedBy.onDelete === "restrict" && !pendingItems.includes(grantee)) {
            ui.notifications.warn(
                game.i18n.format("XPRPG.Item.RemovalPrevented", { item: item.name, preventer: grantee.name })
            );
            pendingItems.splice(pendingItems.indexOf(item), 1);
            return;
        }
    }

    // Handle deletion cascades, pushing additional items onto the `pendingItems` array
    if (granter && parentGrant?.onDelete === "cascade" && !pendingItems.includes(granter)) {
        pendingItems.push(granter);
        await processGrantDeletions(granter, pendingItems);
    }

    for (const grant of grants) {
        const grantee = actor.items.get(grant.id);
        if (grantee?.flags.xprpg.grantedBy?.id !== item.id) continue;

        if (grantee.flags.xprpg.grantedBy.onDelete === "cascade" && !pendingItems.includes(grantee)) {
            pendingItems.push(grantee);
            await processGrantDeletions(grantee, pendingItems);
        }
    }

    // Finally, handle detachments, removing the grant data from granters `itemGrants` object
    const [key] = Object.entries(granter?.flags.xprpg.itemGrants ?? {}).find(([, g]) => g === parentGrant) ?? [null];
    if (granter && key) {
        await granter.update({ [`flags.xprpg.itemGrants.-=${key}`]: null }, { render: false });
    }

    for (const grant of grants) {
        const grantee = actor.items.get(grant.id);
        if (grantee?.flags.xprpg.grantedBy?.id !== item.id || pendingItems.includes(grantee)) {
            continue;
        }

        // Unset the grant flag and leave the granted item on the actor
        if (grantee.flags.xprpg.grantedBy.onDelete === "detach") {
            await grantee.update({ "flags.xprpg.-=grantedBy": null }, { render: false });
        }
    }
}

export { processGrantDeletions };
