/** Register Handlebars template partials */
export function registerTemplates(): void {
    const templatePaths = [
        // Dice
        "systems/xprpg/templates/chat/check/strike/attack-roll.hbs",
        "systems/xprpg/templates/chat/check/target-dc-result.hbs",
        "systems/xprpg/templates/chat/damage/damage-taken.hbs",
        "systems/xprpg/templates/dice/damage-roll.hbs",
        "systems/xprpg/templates/dice/damage-tooltip.hbs",

        // PC Sheet Tooltips
        "systems/xprpg/templates/actors/character/partials/modifiers-tooltip.hbs",
        "systems/xprpg/templates/actors/character/partials/traits.hbs",
        "systems/xprpg/templates/actors/character/partials/background.hbs",
        "systems/xprpg/templates/actors/character/partials/abilities.hbs",
        "systems/xprpg/templates/actors/character/partials/header.hbs",
        "systems/xprpg/templates/actors/character/partials/granted-feat.hbs",

        // PC Sheet Sidebar
        "systems/xprpg/templates/actors/character/sidebar/armor-class.hbs",
        "systems/xprpg/templates/actors/character/sidebar/class-dc.hbs",
        "systems/xprpg/templates/actors/character/sidebar/health.hbs",
        "systems/xprpg/templates/actors/character/sidebar/initiative.hbs",
        "systems/xprpg/templates/actors/character/sidebar/iwr.hbs",
        "systems/xprpg/templates/actors/character/sidebar/perception.hbs",
        "systems/xprpg/templates/actors/character/sidebar/saves.hbs",
        "systems/xprpg/templates/actors/character/sidebar/stamina.hbs",

        // PC Sheet Tabs
        "systems/xprpg/templates/actors/character/tabs/general.hbs",
        "systems/xprpg/templates/actors/character/tabs/actions.hbs",
        "systems/xprpg/templates/actors/character/tabs/biography.hbs",
        "systems/xprpg/templates/actors/character/tabs/effects.hbs",
        "systems/xprpg/templates/actors/character/tabs/feats.hbs",
        "systems/xprpg/templates/actors/character/tabs/inventory.hbs",
        "systems/xprpg/templates/actors/character/tabs/xps.hbs",
        "systems/xprpg/templates/actors/character/tabs/proficiencies.hbs",
        "systems/xprpg/templates/actors/character/tabs/spellcasting.hbs",
        "systems/xprpg/templates/actors/character/tabs/crafting.hbs",

        // Hazard Sheets Partials
        "systems/xprpg/templates/actors/hazard/partials/header.hbs",
        "systems/xprpg/templates/actors/hazard/partials/sidebar.hbs",

        // Shared Actor Sheet Partials
        "systems/xprpg/templates/actors/partials/coinage.hbs",
        "systems/xprpg/templates/actors/partials/inventory.hbs",
        "systems/xprpg/templates/actors/partials/item-line.hbs",
        "systems/xprpg/templates/actors/partials/carry-type.hbs",
        "systems/xprpg/templates/actors/partials/conditions.hbs",
        "systems/xprpg/templates/actors/partials/dying-pips.hbs",
        "systems/xprpg/templates/actors/crafting-entry-alchemical.hbs",
        "systems/xprpg/templates/actors/crafting-entry-list.hbs",
        "systems/xprpg/templates/actors/spellcasting-spell-list.hbs",
        "systems/xprpg/templates/actors/character/partials/proficiencylevels-dropdown.hbs",

        // SVG icons
        "systems/xprpg/templates/actors/character/icons/d20.hbs",
        "systems/xprpg/templates/actors/character/icons/xps.hbs",
        "systems/xprpg/templates/actors/character/icons/plus.hbs",

        // Actor Sheet Partials (SVG images)
        "systems/xprpg/templates/actors/partials/images/header_stroke.hbs",
        "systems/xprpg/templates/actors/partials/images/header_stroke_large.hbs",

        // NPC partials
        "systems/xprpg/templates/actors/npc/tabs/main.hbs",
        "systems/xprpg/templates/actors/npc/tabs/inventory.hbs",
        "systems/xprpg/templates/actors/npc/tabs/effects.hbs",
        "systems/xprpg/templates/actors/npc/tabs/spells.hbs",
        "systems/xprpg/templates/actors/npc/tabs/notes.hbs",
        "systems/xprpg/templates/actors/npc/partials/header.hbs",
        "systems/xprpg/templates/actors/npc/partials/sidebar.hbs",
        "systems/xprpg/templates/actors/npc/partials/action.hbs",
        "systems/xprpg/templates/actors/npc/partials/attack.hbs",

        // Item Sheet Partials
        "systems/xprpg/templates/items/rules-panel.hbs",
        "systems/xprpg/templates/items/action-details.hbs",
        "systems/xprpg/templates/items/affliction-details.hbs",
        "systems/xprpg/templates/items/affliction-sidebar.hbs",
        "systems/xprpg/templates/items/ancestry-details.hbs",
        "systems/xprpg/templates/items/ancestry-sidebar.hbs",
        "systems/xprpg/templates/items/armor-details.hbs",
        "systems/xprpg/templates/items/armor-sidebar.hbs",
        "systems/xprpg/templates/items/background-details.hbs",
        "systems/xprpg/templates/items/backpack-details.hbs",
        "systems/xprpg/templates/items/backpack-sidebar.hbs",
        "systems/xprpg/templates/items/book-details.hbs",
        "systems/xprpg/templates/items/book-sidebar.hbs",
        "systems/xprpg/templates/items/treasure-sidebar.hbs",
        "systems/xprpg/templates/items/class-details.hbs",
        "systems/xprpg/templates/items/consumable-details.hbs",
        "systems/xprpg/templates/items/consumable-sidebar.hbs",
        "systems/xprpg/templates/items/condition-details.hbs",
        "systems/xprpg/templates/items/condition-sidebar.hbs",
        "systems/xprpg/templates/items/deity-details.hbs",
        "systems/xprpg/templates/items/effect-sidebar.hbs",
        "systems/xprpg/templates/items/equipment-details.hbs",
        "systems/xprpg/templates/items/equipment-sidebar.hbs",
        "systems/xprpg/templates/items/feat-details.hbs",
        "systems/xprpg/templates/items/feat-sidebar.hbs",
        "systems/xprpg/templates/items/heritage-sidebar.hbs",
        "systems/xprpg/templates/items/kit-details.hbs",
        "systems/xprpg/templates/items/kit-sidebar.hbs",
        "systems/xprpg/templates/items/lore-details.hbs",
        "systems/xprpg/templates/items/lore-sidebar.hbs",
        "systems/xprpg/templates/items/mystify-panel.hbs",
        "systems/xprpg/templates/items/spell-details.hbs",
        "systems/xprpg/templates/items/spell-overlay.hbs",
        "systems/xprpg/templates/items/spell-sidebar.hbs",
        "systems/xprpg/templates/items/melee-details.hbs",
        "systems/xprpg/templates/items/weapon-details.hbs",
        "systems/xprpg/templates/items/weapon-sidebar.hbs",
        "systems/xprpg/templates/items/activation-panel.hbs",

        // Item Sheet Partials (sub-partials)
        "systems/xprpg/templates/items/partials/ability-activation.hbs",
        "systems/xprpg/templates/items/partials/duration.hbs",

        // Loot partials
        "systems/xprpg/templates/actors/loot/inventory.hbs",
        "systems/xprpg/templates/actors/loot/sidebar.hbs",

        // Vehicle partials
        "systems/xprpg/templates/actors/vehicle/vehicle-header.hbs",
        "systems/xprpg/templates/actors/vehicle/sidebar/vehicle-health.hbs",
        "systems/xprpg/templates/actors/vehicle/sidebar/vehicle-armorclass.hbs",
        "systems/xprpg/templates/actors/vehicle/sidebar/vehicle-saves.hbs",
        "systems/xprpg/templates/actors/vehicle/sidebar/iwr.hbs",
        "systems/xprpg/templates/actors/vehicle/tabs/vehicle-details.hbs",
        "systems/xprpg/templates/actors/vehicle/tabs/vehicle-actions.hbs",
        "systems/xprpg/templates/actors/vehicle/tabs/vehicle-inventory.hbs",
        "systems/xprpg/templates/actors/vehicle/tabs/vehicle-description.hbs",
        "systems/xprpg/templates/actors/vehicle/tabs/vehicle-effects.hbs",

        // Compendium Browser Partials
        "systems/xprpg/templates/compendium-browser/browser-settings.hbs",
        "systems/xprpg/templates/compendium-browser/filters.hbs",

        // Action Partial
        "systems/xprpg/templates/chat/action/header.hbs",
        "systems/xprpg/templates/system/actions/repair/chat-button-partial.hbs",
        "systems/xprpg/templates/system/actions/repair/repair-result-partial.hbs",
        "systems/xprpg/templates/system/actions/repair/item-heading-partial.hbs",

        // TokenConfig partials
        "systems/xprpg/templates/scene/token/partials/appearance.hbs",
        "systems/xprpg/templates/scene/token/partials/identity.hbs",
        "systems/xprpg/templates/scene/token/partials/lighting.hbs",
    ];

    loadTemplates(templatePaths);
}
