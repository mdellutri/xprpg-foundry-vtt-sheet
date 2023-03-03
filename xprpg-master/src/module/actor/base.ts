import {
    ActorAlliance,
    ActorDimensions,
    ApplyDamageParams,
    AttackItem,
    AttackRollContext,
    AuraData,
    SaveType,
    StrikeRollContext,
    StrikeRollContextParams,
    UnaffectedType,
} from "@actor/types";
import { AbstractEffectXPRPG, ArmorXPRPG, ContainerXPRPG, ItemXPRPG, ItemProxyXPRPG, PhysicalItemXPRPG } from "@item";
import { ActionTrait } from "@item/action/data";
import { AfflictionSource } from "@item/affliction";
import { ConditionKey, ConditionSlug, ConditionSource, type ConditionXPRPG } from "@item/condition";
import { isCycle } from "@item/container/helpers";
import { ItemSourceXPRPG, ItemType, PhysicalItemSource } from "@item/data";
import { ActionCost, ActionType } from "@item/data/base";
import { hasInvestedProperty } from "@item/data/helpers";
import { EffectFlags, EffectSource } from "@item/effect/data";
import type { ActiveEffectXPRPG } from "@module/active-effect";
import { ChatMessageXPRPG } from "@module/chat-message";
import { OneToThree, Size } from "@module/data";
import { preImportJSON } from "@module/doc-helpers";
import { RuleElementSynthetics } from "@module/rules";
import { extractEphemeralEffects, processPreUpdateActorHooks } from "@module/rules/helpers";
import { RuleElementXPRPG } from "@module/rules/rule-element/base";
import { RollOptionRuleElement } from "@module/rules/rule-element/roll-option";
import { LocalizeXPRPG } from "@module/system/localize";
import { UserXPRPG } from "@module/user";
import { TokenDocumentXPRPG } from "@scene";
import { DiceXPRPG } from "@scripts/dice";
import { DamageType } from "@system/damage";
import { applyIWR, IWRApplicationData, maxPersistentAfterIWR } from "@system/damage/iwr";
import { Statistic } from "@system/statistic";
import { TextEditorXPRPG } from "@system/text-editor";
import {
    ErrorXPRPG,
    getActionGlyph,
    getActionIcon,
    isObject,
    objectHasKey,
    setHasElement,
    traitSlugToObject,
    tupleHasValue,
} from "@util";
import type { CreatureXPRPG } from "./creature";
import { VisionLevel, VisionLevels } from "./creature/data";
import { GetReachParameters, ModeOfBeing } from "./creature/types";
import { ActorDataXPRPG, ActorSourceXPRPG, ActorType } from "./data";
import {
    ActorFlagsXPRPG,
    ActorSystemData,
    ActorTraitsData,
    PrototypeTokenXPRPG,
    RollOptionFlags,
    StrikeData,
} from "./data/base";
import { ImmunityData, ResistanceData, WeaknessData } from "./data/iwr";
import { ActorSizeXPRPG } from "./data/size";
import { calculateRangePenalty, checkAreaEffects, getRangeIncrement, isReallyPC, migrateActorSource } from "./helpers";
import { ActorInventory } from "./inventory";
import { ItemTransfer } from "./item-transfer";
import { ActorSheetXPRPG } from "./sheet/base";
import { ActorSpellcasting } from "./spellcasting";
import { TokenEffect } from "./token-effect";
import { CREATURE_ACTOR_TYPES, UNAFFECTED_TYPES } from "./values";
import { UUIDUtils } from "@util/uuid-utils";

/**
 * Extend the base Actor class to implement additional logic specialized for XPRPG.
 * @category Actor
 */
class ActorXPRPG extends Actor<TokenDocumentXPRPG, ItemTypeMap> {
    /** Has this actor gone through at least one cycle of data preparation? */
    private initialized = true;

    /** A separate collection of owned physical items for convenient access */
    inventory!: ActorInventory;

    /** A separate collection of owned spellcasting entries for convenience */
    spellcasting!: ActorSpellcasting;

    /** Rule elements drawn from owned items */
    rules!: RuleElementXPRPG[];

    synthetics!: RuleElementSynthetics;

    /** Saving throw statistics */
    saves?: { [K in SaveType]?: Statistic };

    /** Data from rule elements for auras this actor may be emanating */
    auras!: Map<string, AuraData>;

    /** Conditions this actor has */
    conditions!: Map<ConditionSlug, ConditionXPRPG>;

    /** A cached copy of `Actor#itemTypes`, lazily regenerated every data preparation cycle */
    private _itemTypes?: { [K in keyof ItemTypeMap]: Embedded<ItemTypeMap[K]>[] } | null;

    constructor(data: PreCreate<ActorSourceXPRPG>, context: DocumentConstructionContext<TokenDocumentXPRPG | null> = {}) {
        super(data, context);

        // Add debounced checkAreaEffects method
        Object.defineProperty(this, "checkAreaEffects", {
            configurable: false,
            enumerable: false,
            writable: false,
            value: foundry.utils.debounce(checkAreaEffects, 50),
        });
    }

    /** Cache the return data before passing it to the caller */
    override get itemTypes(): { [K in keyof ItemTypeMap]: Embedded<ItemTypeMap[K]>[] } {
        return (this._itemTypes ??= super.itemTypes);
    }

    get allowedItemTypes(): (ItemType | "physical")[] {
        return ["condition", "effect"];
    }

    /** The compendium source ID of the actor **/
    get sourceId(): ActorUUID | null {
        return this.flags.core?.sourceId ?? null;
    }

    /** The recorded schema version of this actor, updated after each data migration */
    get schemaVersion(): number | null {
        return Number(this.system.schema?.version) || null;
    }

    /** Get an active GM or, failing that, a player who can update this actor */
    get primaryUpdater(): UserXPRPG | null {
        const activeUsers = game.users.filter((u) => u.active);

        // 1. The first active GM, sorted by ID
        const firstGM = activeUsers
            .filter((u) => u.isGM)
            .sort((a, b) => (a.id > b.id ? 1 : -1))
            .shift();
        if (firstGM) return firstGM;

        // 2. The user with this actor assigned
        const primaryPlayer = this.isToken ? null : activeUsers.find((u) => u.character?.id === this.id);
        if (primaryPlayer) return primaryPlayer;

        // 3. Anyone who can update the actor
        const firstUpdater = game.users
            .filter((u) => this.canUserModify(u, "update"))
            .sort((a, b) => (a.id > b.id ? 1 : -1))
            .shift();
        return firstUpdater ?? null;
    }

    /** Shortcut to system-data attributes */
    get attributes(): this["system"]["attributes"] {
        return this.system.attributes;
    }

    get hitPoints(): HitPointsSummary | null {
        const { hp } = this.system.attributes;
        if (!hp) return null;

        return {
            value: hp.value,
            max: hp.max,
            temp: hp.temp,
            negativeHealing: hp.negativeHealing,
        };
    }

    get traits(): Set<string> {
        return new Set(this.system.traits?.value ?? []);
    }

    get level(): number {
        return this.system.details.level.value;
    }

    get size(): Size {
        return this.system.traits?.size.value ?? "med";
    }

    /**
     * With the exception of vehicles, actor heights aren't specified. For the purpose of three-dimensional
     * token-distance measurement, however, the system will generally treat actors as cubes.
     */
    get dimensions(): ActorDimensions {
        const size = this.system.traits?.size ?? new ActorSizeXPRPG({ value: "med" });
        return {
            length: size.length,
            width: size.width,
            height: Math.min(size.length, size.width),
        };
    }

    /**
     * Whether the actor can see, given its token placement in the current scene.
     * A meaningful implementation is found in `CreatureXPRPG`.
     */
    get canSee(): boolean {
        return true;
    }

    /** Whether this actor can execute actions: meaningful implementations are found in `CreatureXPRPG`. */
    get canAct(): boolean {
        return true;
    }

    /** Whether this actor can attack: meaningful implementations are found in `CreatureXPRPG` and `HazardXPRPG`. */
    get canAttack(): boolean {
        return false;
    }

    get isDead(): boolean {
        const deathIcon = game.settings.get("xprpg", "deathIcon");
        if (this.token) return this.token.overlayEffect === deathIcon;
        const tokens = this.getActiveTokens(true, true);
        return tokens.length > 0 && tokens.every((t) => t.overlayEffect === deathIcon);
    }

    get modeOfBeing(): ModeOfBeing {
        const { traits } = this;

        const isPC = isReallyPC(this);

        return traits.has("undead") && !traits.has("eidolon") // Undead eidolons aren't undead
            ? "undead"
            : traits.has("construct") && !isPC && !traits.has("eidolon") // Construct eidolons aren't constructs
            ? "construct"
            : "living";
    }

    get visionLevel(): VisionLevel {
        return VisionLevels.NORMAL;
    }

    /** Does this creature emit sound? False unless a subclass overrides it */
    get emitsSound(): boolean {
        return false;
    }

    get rollOptions(): RollOptionFlags {
        return this.flags.xprpg.rollOptions;
    }

    /** Get the actor's held shield. Meaningful implementation in `CreatureXPRPG`'s override. */
    get heldShield(): Embedded<ArmorXPRPG> | null {
        return null;
    }

    /** Most actor types can host rule elements */
    get canHostRuleElements(): boolean {
        return true;
    }

    get alliance(): ActorAlliance {
        return this.system.details.alliance;
    }

    /** Add effect icons from effect items and rule elements */
    override get temporaryEffects(): TemporaryEffect[] {
        const conditionTokenIcons = this.itemTypes.condition.map((condition) => condition.img);
        const conditionTokenEffects = Array.from(new Set(conditionTokenIcons)).map((icon) => new TokenEffect(icon));

        const effectTokenEffects = this.itemTypes.effect
            .filter((effect) => effect.system.tokenIcon?.show)
            .filter((effect) => !effect.unidentified || game.user.isGM)
            .map((effect) => new TokenEffect(effect.img));

        return super.temporaryEffects
            .concat(this.system.tokenEffects)
            .concat(conditionTokenEffects)
            .concat(effectTokenEffects);
    }

    /** A means of checking this actor's type without risk of circular import references */
    isOfType(type: "creature"): this is CreatureXPRPG;
    isOfType<T extends ActorType>(
        ...types: T[]
    ): this is InstanceType<ConfigXPRPG["XPRPG"]["Actor"]["documentClasses"][T]>;
    isOfType<T extends "creature" | ActorType>(
        ...types: T[]
    ): this is CreatureXPRPG | InstanceType<ConfigXPRPG["XPRPG"]["Actor"]["documentClasses"][Exclude<T, "creature">]>;
    isOfType(...types: string[]): boolean {
        return types.some((t) => (t === "creature" ? tupleHasValue(CREATURE_ACTOR_TYPES, this.type) : this.type === t));
    }

    /** Whether this actor is an ally of the provided actor */
    isAllyOf(actor: ActorXPRPG): boolean {
        return this.alliance !== null && this !== actor && this.alliance === actor.alliance;
    }

    /** Whether this actor is an enemy of the provided actor */
    isEnemyOf(actor: ActorXPRPG): boolean {
        return this.alliance !== null && actor.alliance !== null && this.alliance !== actor.alliance;
    }

    /** Whether this actor is immune to an effect of a certain type */
    isImmuneTo(effect: AbstractEffectXPRPG | ConditionSource | EffectSource): boolean {
        const item = "parent" in effect ? effect : new ItemProxyXPRPG(effect);
        const statements = new Set(item.getRollOptions("item"));
        return this.attributes.immunities.some((i) => i.test(statements));
    }

    /** Whether this actor is affected by damage of a certain type despite lack of explicit immunity */
    isAffectedBy(damage: DamageType | ConditionXPRPG): boolean {
        const damageType = objectHasKey(CONFIG.XPRPG.damageTypes, damage)
            ? damage
            : damage.isOfType("condition")
            ? damage.system.persistent?.damageType ?? null
            : null;

        if (!setHasElement(UNAFFECTED_TYPES, damageType)) return true;

        const { traits } = this;
        const damageIsApplicable: Record<UnaffectedType, boolean> = {
            good: traits.has("evil"),
            evil: traits.has("good"),
            lawful: traits.has("chaotic"),
            chaotic: traits.has("lawful"),
            positive: !!this.attributes.hp?.negativeHealing,
            negative: !(this.modeOfBeing === "construct" || this.attributes.hp?.negativeHealing),
            bleed: this.modeOfBeing === "living",
        };

        return damageIsApplicable[damageType];
    }

    /** Get roll options from this actor's effects, traits, and other properties */
    getSelfRollOptions(prefix: "self" | "target" | "origin" = "self"): string[] {
        const { rollOptions } = this;
        return Object.keys(rollOptions.all).flatMap((o) =>
            o.startsWith("self:") && rollOptions.all[o] ? o.replace(/^self/, prefix) : []
        );
    }

    /** The actor's reach: a meaningful implementation is found in `CreatureXPRPG` and `HazardXPRPG`. */
    getReach(_options: GetReachParameters): number {
        return 0;
    }

    /** Create a clone of this actor to recalculate its statistics with ephemeral effects and roll options included */
    getContextualClone(rollOptions: string[], ephemeralEffects: (ConditionSource | EffectSource)[] = []): this {
        const rollOptionsAll = rollOptions.reduce(
            (options: Record<string, boolean>, option) => ({ ...options, [option]: true }),
            {}
        );
        const applicableEffects = ephemeralEffects.filter((e) => !this.isImmuneTo(e));

        return this.clone(
            {
                items: [deepClone(this._source.items), applicableEffects].flat(),
                flags: { xprpg: { rollOptions: { all: rollOptionsAll } } },
            },
            { keepId: true }
        );
    }

    /** Apply effects from an aura: will later be expanded to handle effects from measured templates */
    async applyAreaEffects(aura: AuraData, origin: { actor: ActorXPRPG; token: TokenDocumentXPRPG }): Promise<void> {
        if (game.user !== this.primaryUpdater) return;

        const toCreate: (AfflictionSource | EffectSource)[] = [];
        const rollOptions = aura.effects.some((e) => e.predicate.length > 0)
            ? new Set([...origin.actor.getRollOptions(), ...this.getSelfRollOptions("target")])
            : new Set([]);

        for (const data of aura.effects.filter((e) => e.predicate.test(rollOptions))) {
            if (this.itemTypes.effect.some((e) => e.sourceId === data.uuid)) {
                continue;
            }

            const affectsSelf =
                (data.includesSelf && this === origin.actor) ||
                (data.affects === "allies" && this.isAllyOf(origin.actor)) ||
                (data.affects === "enemies" && this.isEnemyOf(origin.actor)) ||
                (data.affects === "all" && this !== origin.actor);

            if (affectsSelf) {
                const effect = await UUIDUtils.fromUuid(data.uuid);
                if (!(effect instanceof ItemXPRPG && effect.isOfType("affliction", "effect"))) {
                    console.warn(`Effect from ${data.uuid} not found`);
                    continue;
                }

                const flags: DeepPartial<EffectFlags> = {
                    core: { sourceId: effect.uuid },
                    xprpg: {
                        aura: {
                            slug: aura.slug,
                            origin: origin.actor.uuid,
                            removeOnExit: data.removeOnExit,
                        },
                    },
                };

                const source = mergeObject(effect.toObject(), { flags });
                source.system.level.value = data.level ?? source.system.level.value;
                source.system.duration.unit = "unlimited";
                source.system.duration.expiry = null;
                // Only transfer traits from the aura if the effect lacks its own
                if (source.system.traits.value.length === 0) {
                    source.system.traits.value.push(...aura.traits);
                }

                source.system.context = {
                    target: null,
                    origin: {
                        actor: origin.actor.uuid,
                        token: origin.token.uuid,
                        item: null,
                    },
                    roll: null,
                };

                toCreate.push(source);
            }
        }

        if (toCreate.length > 0) {
            await this.createEmbeddedDocuments("Item", toCreate);
        }
    }

    /** Don't allow the user to create in development actor types. */
    static override async createDialog(
        data: { folder?: string | undefined } = {},
        options: Partial<FormApplicationOptions> = {}
    ): Promise<ClientDocument<foundry.documents.BaseActor> | undefined> {
        const original = game.system.documentTypes.Actor;
        game.system.documentTypes.Actor = original.filter(
            (actorType: string) => actorType !== "party" || BUILD_MODE !== "production"
        );
        const newActor = super.createDialog(data, options) as Promise<ActorXPRPG | undefined>;
        game.system.documentTypes.Actor = original;
        return newActor;
    }

    /**
     * As of Foundry 0.8: All subclasses of ActorXPRPG need to use this factory method rather than having their own
     * overrides, since Foundry itself will call `ActorXPRPG.create` when a new actor is created from the sidebar.
     */
    static override async createDocuments<T extends foundry.abstract.Document>(
        this: ConstructorOf<T>,
        data?: (T | PreCreate<T["_source"]>)[],
        context?: DocumentModificationContext<T>
    ): Promise<T[]>;
    static override async createDocuments(
        data: (ActorXPRPG | PreCreate<ActorSourceXPRPG>)[] = [],
        context: DocumentModificationContext<ActorXPRPG> = {}
    ): Promise<Actor[]> {
        // Convert all `ActorXPRPG`s to source objects
        const sources = data.map((d) => (d instanceof ActorXPRPG ? d.toObject() : d));

        // Set additional defaults, some according to actor type
        for (const source of [...sources]) {
            const linkToActorSize = ["hazard", "loot"].includes(source.type)
                ? false
                : source.prototypeToken?.flags?.xprpg?.linkToActorSize ?? true;
            const autoscale = ["hazard", "loot"].includes(source.type)
                ? false
                : source.prototypeToken?.flags?.xprpg?.autoscale ??
                  (linkToActorSize && game.settings.get("xprpg", "tokens.autoscale"));
            const merged = mergeObject(source, {
                ownership: source.ownership ?? { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE },
                prototypeToken: {
                    flags: {
                        // Sync token dimensions with actor size?
                        xprpg: { linkToActorSize, autoscale },
                    },
                },
            });

            // Set default token dimensions for familiars and vehicles
            const dimensionMap: { [K in ActorType]?: number } = { familiar: 0.5, vehicle: 2 };
            merged.prototypeToken.height ??= dimensionMap[source.type] ?? 1;
            merged.prototypeToken.width ??= merged.prototypeToken.height;

            switch (merged.type) {
                case "character":
                case "familiar":
                    merged.ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
                    // Default characters and their minions to having tokens with vision and an actor link
                    merged.prototypeToken.actorLink = true;
                    merged.prototypeToken.vision = true;
                    break;
                case "loot":
                    // Make loot actors linked and interactable
                    merged.prototypeToken.actorLink = true;
                    merged.ownership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED;
                    break;
            }

            const migrated = await migrateActorSource(source);
            sources.splice(sources.indexOf(source), 1, migrated);
        }

        return super.createDocuments(sources, context);
    }

    static override updateDocuments<T extends foundry.abstract.Document>(
        this: ConstructorOf<T>,
        updates?: DocumentUpdateData<T>[],
        context?: DocumentModificationContext
    ): Promise<T[]>;
    static override async updateDocuments(
        updates: DocumentUpdateData<ActorXPRPG>[] = [],
        context: DocumentModificationContext = {}
    ): Promise<Actor[]> {
        // Process rule element hooks for each actor update
        for (const changed of updates) {
            await processPreUpdateActorHooks(changed, { pack: context.pack ?? null });
        }

        return super.updateDocuments(updates, context);
    }

    protected override _initialize(): void {
        this.rules = [];
        this.conditions = new Map();
        this.auras = new Map();

        const preparationWarnings: Set<string> = new Set();
        this.synthetics = {
            criticalSpecalizations: { standard: [], alternate: [] },
            damageDice: { damage: [] },
            degreeOfSuccessAdjustments: {},
            dexterityModifierCaps: [],
            modifierAdjustments: { all: [], damage: [] },
            movementTypes: {},
            multipleAttackPenalties: {},
            ephemeralEffects: {},
            rollNotes: {},
            rollSubstitutions: {},
            rollTwice: {},
            senses: [],
            statisticsModifiers: { all: [], damage: [] },
            strikeAdjustments: [],
            strikes: new Map(),
            striking: {},
            targetMarks: new Map(),
            tokenOverrides: {},
            weaponPotency: {},
            preparationWarnings: {
                add: (warning: string) => preparationWarnings.add(warning),
                flush: foundry.utils.debounce(() => {
                    for (const warning of preparationWarnings) {
                        console.warn(warning);
                    }
                    preparationWarnings.clear();
                }, 10), // 10ms also handles separate module executions
            },
        };

        super._initialize();

        if (game._documentsReady) {
            this.synthetics.preparationWarnings.flush();
        }
    }

    /** Set module art if available */
    protected override _initializeSource(
        source: Record<string, unknown>,
        options?: DocumentConstructionContext<this>
    ): this["_source"] {
        const initialized = super._initializeSource(source, options);

        if (options?.pack && initialized._id) {
            const uuid: CompendiumUUID = `Compendium.${options.pack}.${initialized._id}`;
            const art = game.xprpg.system.moduleArt.map.get(uuid) ?? {};
            return mergeObject(initialized, art);
        }

        return initialized;
    }

    /** Prepare token data derived from this actor, refresh Effects Panel */
    override prepareData(): void {
        delete this._itemTypes;

        super.prepareData();

        // Call post-derived-preparation `RuleElement` hooks
        for (const rule of this.rules) {
            rule.afterPrepareData?.();
        }

        this.preparePrototypeToken();
        if (this.initialized && canvas.ready) {
            // Work around `t.actor` potentially being a lazy getter for a synthetic actor (viz. this one)
            const thisTokenIsControlled = canvas.tokens.controlled.some(
                (t) => t.document === this.parent || (t.document.actorLink && t.actor === this)
            );
            if (game.user.character === this || thisTokenIsControlled) {
                game.xprpg.effectPanel.refresh();
            }
        }
    }

    /** Prepare baseline ephemeral data applicable to all actor types */
    override prepareBaseData(): void {
        super.prepareBaseData();

        this.system.tokenEffects = [];
        this.system.autoChanges = {};
        this.system.attributes.flanking = { canFlank: false, canGangUp: [], flankable: false, flatFootable: false };
        this.system.toggles = [];

        const { attributes } = this.system;
        attributes.immunities = attributes.immunities?.map((i) => new ImmunityData(i)) ?? [];
        attributes.weaknesses = attributes.weaknesses?.map((w) => new WeaknessData(w)) ?? [];
        attributes.resistances = attributes.resistances?.map((r) => new ResistanceData(r)) ?? [];

        const traits: ActorTraitsData<string> | undefined = this.system.traits;
        if (traits?.size) traits.size = new ActorSizeXPRPG(traits.size);

        // Setup the basic structure of xprpg flags with roll options
        this.flags.xprpg = mergeObject(this.flags.xprpg ?? {}, {
            rollOptions: {
                all: { [`self:type:${this.type}`]: true },
            },
        });

        this.setEncounterRollOptions();
    }

    /** Prepare the physical-item collection on this actor, item-sibling data, and rule elements */
    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments();
        const physicalItems: Embedded<PhysicalItemXPRPG>[] = this.items.filter(
            (item) => item instanceof PhysicalItemXPRPG
        );
        this.inventory = new ActorInventory(this, physicalItems);

        const spellcastingEntries = this.itemTypes.spellcastingEntry;
        this.spellcasting = new ActorSpellcasting(this, spellcastingEntries);

        // Track all effects on this actor
        for (const effect of this.itemTypes.effect) {
            game.xprpg.effectTracker.register(effect);
        }

        this.prepareDataFromItems();
    }

    /** Prepare data among owned items as well as actor-data preparation performed by items */
    protected prepareDataFromItems(): void {
        for (const item of this.items) {
            item.prepareSiblingData?.();
            item.prepareActorData?.();
        }

        this.rules = this.prepareRuleElements();
    }

    protected prepareRuleElements(): RuleElementXPRPG[] {
        return this.items.contents
            .flatMap((item) => item.prepareRuleElements())
            .filter((rule) => !rule.ignored)
            .sort((elementA, elementB) => elementA.priority - elementB.priority);
    }

    /** Collect all rule element output */
    protected prepareSynthetics(): void {
        // Rule elements
        for (const rule of this.rules.filter((r) => !r.ignored)) {
            try {
                rule.beforePrepareData?.();
            } catch (error) {
                // Ensure that a failing rule element does not block actor initialization
                console.error(`XPRPG | Failed to execute onBeforePrepareData on rule element ${rule}.`, error);
            }
        }
    }

    /** Set traits as roll options */
    override prepareDerivedData(): void {
        const { rollOptions } = this;
        for (const trait of this.traits) {
            rollOptions.all[`self:trait:${trait}`] = true;
        }
    }

    /** Set defaults for this actor's prototype token */
    private preparePrototypeToken(): void {
        this.prototypeToken.flags = mergeObject(
            { xprpg: { linkToActorSize: !["hazard", "loot"].includes(this.type) } },
            this.prototypeToken.flags
        );
        TokenDocumentXPRPG.prepareSize(this.prototypeToken, this);
    }

    /** If there is an active encounter, set roll options for it and this actor's participant */
    setEncounterRollOptions(): void {
        const encounter = game.ready ? game.combat : null;
        if (!encounter?.started) return;

        const participants = encounter.combatants.contents;
        const participant = this.token?.combatant ?? participants.find((c) => c.actor === this);
        if (typeof participant?.initiative !== "number") return;

        const rollOptionsAll = this.rollOptions.all;
        rollOptionsAll["encounter"] = true;
        rollOptionsAll[`encounter:round:${encounter.round}`] = true;
        rollOptionsAll[`encounter:turn:${encounter.turn + 1}`] = true;
        rollOptionsAll["self:participant:own-turn"] = encounter.combatant?.actor === this;

        const initiativeRoll = Math.trunc(participant.initiative);
        rollOptionsAll[`self:participant:initiative:roll:${initiativeRoll}`] = true;
        const rank = [...participants].reverse().indexOf(participant) + 1;
        rollOptionsAll[`self:participant:initiative:rank:${rank}`] = true;
    }

    /* -------------------------------------------- */
    /*  Rolls                                       */
    /* -------------------------------------------- */

    async getStrikeRollContext<I extends AttackItem>(
        params: StrikeRollContextParams<I>
    ): Promise<StrikeRollContext<this, I>> {
        const [selfToken, targetToken] =
            canvas.ready && !params.viewOnly
                ? [
                      canvas.tokens.controlled.find((t) => t.actor === this) ?? this.getActiveTokens().shift() ?? null,
                      Array.from(game.user.targets).find((t) => !!t.actor) ?? null,
                  ]
                : [null, null];

        const reach = params.item.isOfType("melee")
            ? params.item.reach
            : params.item.isOfType("weapon")
            ? this.getReach({ action: "attack", weapon: params.item })
            : null;

        const selfOptions = this.getRollOptions(params.domains ?? []);
        if (targetToken && typeof reach === "number" && selfToken?.isFlanking(targetToken, { reach })) {
            selfOptions.push("self:flanking");
        }

        // Get ephemeral effects from the target that affect this actor while attacking
        const originEphemeralEffects = await extractEphemeralEffects({
            affects: "origin",
            origin: this,
            target: targetToken?.actor ?? null,
            item: params.item,
            domains: params.domains,
            options: [...params.options, ...params.item.getRollOptions("item")],
        });

        const selfActor =
            params.viewOnly || !targetToken?.actor
                ? this
                : this.getContextualClone(
                      [...selfOptions, ...targetToken.actor.getSelfRollOptions("target")],
                      originEphemeralEffects
                  );
        const actions: StrikeData[] = selfActor.system.actions?.flatMap((a) => [a, a.altUsages ?? []].flat()) ?? [];

        const selfItem: AttackItem =
            params.viewOnly || params.item.isOfType("spell")
                ? params.item
                : actions
                      .map((a): AttackItem => a.item)
                      .find((weapon) => {
                          // Find the matching weapon or melee item
                          if (!(params.item.id === weapon.id && weapon.name === params.item.name)) return false;
                          if (params.item.isOfType("melee") && weapon.isOfType("melee")) return true;

                          // Discriminate between melee/thrown usages by checking that both are either melee or ranged
                          return (
                              params.item.isOfType("weapon") &&
                              weapon.isOfType("weapon") &&
                              params.item.isMelee === weapon.isMelee
                          );
                      }) ?? params.item;
        const itemOptions = selfItem.getRollOptions("item");

        const traitSlugs: ActionTrait[] = [
            "attack" as const,
            // CRB p. 544: "Due to the complexity involved in preparing bombs, Strikes to throw alchemical bombs gain
            // the manipulate trait."
            selfItem.isOfType("weapon") && selfItem.baseType === "alchemical-bomb" ? ("manipulate" as const) : [],
        ].flat();
        for (const adjustment of this.synthetics.strikeAdjustments) {
            if (selfItem.isOfType("weapon", "melee")) {
                adjustment.adjustTraits?.(selfItem, traitSlugs);
            }
        }

        const traits = traitSlugs.map((t) => traitSlugToObject(t, CONFIG.XPRPG.actionTraits));
        // Calculate distance and range increment, set as a roll option
        const distance = selfToken && targetToken ? selfToken.distanceTo(targetToken) : null;
        const [originDistance, targetDistance] =
            typeof distance === "number"
                ? [`origin:distance:${distance}`, `target:distance:${distance}`]
                : [null, null];

        // Get ephemeral effects from this actor that affect the target while being attacked
        const targetEphemeralEffects = await extractEphemeralEffects({
            affects: "target",
            origin: selfActor,
            target: targetToken?.actor ?? null,
            item: params.item,
            domains: params.domains,
            options: [...params.options, ...itemOptions],
        });

        // Clone the actor to recalculate its AC with contextual roll options
        const targetActor = params.viewOnly
            ? null
            : targetToken?.actor?.getContextualClone(
                  [
                      ...selfActor.getSelfRollOptions("origin"),
                      ...itemOptions,
                      ...(originDistance ? [originDistance] : []),
                  ],
                  targetEphemeralEffects
              ) ?? null;

        // Target roll options
        const targetOptions = targetActor?.getSelfRollOptions("target") ?? [];
        if (targetToken && targetOptions.length > 0) {
            targetOptions.push("target"); // An indicator that there is a target of any kind
            const mark = this.synthetics.targetMarks.get(targetToken.document.uuid);
            if (mark) targetOptions.push(`target:mark:${mark}`);
        }

        const rollOptions = new Set([
            ...params.options,
            ...selfOptions,
            ...targetOptions,
            ...itemOptions,
            // Backward compatibility for predication looking for an "attack" trait by its lonesome
            "attack",
        ]);

        if (targetDistance) rollOptions.add(targetDistance);
        const rangeIncrement = getRangeIncrement(selfItem, distance);
        if (rangeIncrement) rollOptions.add(`target:range-increment:${rangeIncrement}`);

        const self = {
            actor: selfActor,
            token: selfToken?.document ?? null,
            item: selfItem as I,
            modifiers: [],
        };

        const target =
            targetActor && targetToken && distance !== null
                ? { actor: targetActor, token: targetToken.document, distance, rangeIncrement }
                : null;

        return {
            options: rollOptions,
            self,
            target,
            traits,
        };
    }

    /**
     * Calculates attack roll target data including the target's DC.
     * All attack rolls have the "all" and "attack-roll" domains and the "attack" trait,
     * but more can be added via the options.
     */
    async getAttackRollContext<I extends AttackItem>(
        params: StrikeRollContextParams<I>
    ): Promise<AttackRollContext<this, I>> {
        const context = await this.getStrikeRollContext(params);
        const targetActor = context.target?.actor;
        const rangeIncrement = context.target?.rangeIncrement ?? null;

        const rangePenalty = calculateRangePenalty(this, rangeIncrement, params.domains, context.options);
        if (rangePenalty) context.self.modifiers.push(rangePenalty);

        return {
            ...context,
            dc: targetActor?.attributes.ac
                ? {
                      scope: "attack",
                      slug: "ac",
                      value: targetActor.attributes.ac.value,
                  }
                : null,
        };
    }

    /**
     * Roll a Attribute Check
     * Prompt the user for input regarding Advantage/Disadvantage and any Situational Bonus
     */
    rollAttribute(event: JQuery.Event, attributeName: string): void {
        if (!objectHasKey(this.system.attributes, attributeName)) {
            throw ErrorXPRPG(`Unrecognized attribute "${attributeName}"`);
        }

        const attribute = this.attributes[attributeName];
        if (!(isObject(attribute) && "value" in attribute)) return;

        const parts = ["@mod", "@itemBonus"];
        const configAttributes = CONFIG.XPRPG.attributes;
        if (isObject(attribute) && objectHasKey(configAttributes, attributeName)) {
            const flavor = `${game.i18n.localize(configAttributes[attributeName])} Check`;
            // Call the roll helper utility
            DiceXPRPG.d20Roll({
                event,
                parts,
                data: { mod: attribute.value },
                title: flavor,
                speaker: ChatMessage.getSpeaker({ actor: this }),
            });
        }
    }

    /** Toggle the provided roll option (swapping it from true to false or vice versa). */
    async toggleRollOption(domain: string, option: string, value?: boolean): Promise<boolean | null>;
    async toggleRollOption(
        domain: string,
        option: string,
        itemId?: string | null,
        value?: boolean
    ): Promise<boolean | null>;
    async toggleRollOption(
        domain: string,
        option: string,
        itemId: string | boolean | null = null,
        value?: boolean
    ): Promise<boolean | null> {
        // Backward compatibility
        value = typeof itemId === "boolean" ? itemId : value ?? !this.rollOptions[domain]?.[option];

        if (typeof itemId === "string") {
            // An item ID is provided: find the rule on the item
            const item = this.items.get(itemId, { strict: true });
            const rule = item.rules.find(
                (r): r is RollOptionRuleElement =>
                    r instanceof RollOptionRuleElement && r.domain === domain && r.option === option
            );
            return rule?.toggle(value) ?? null;
        } else {
            // Less precise: no item ID is provided, so find the rule on the actor
            const rule = this.rules.find(
                (r): r is RollOptionRuleElement =>
                    r instanceof RollOptionRuleElement && r.domain === domain && r.option === option
            );
            return rule?.toggle(value) ?? null;
        }
    }

    /**
     * Handle how changes to a Token attribute bar are applied to the Actor.
     *
     * If the attribute bar is for hp and the change is in delta form, defer to the applyDamage method. Otherwise, do
     * nothing special.
     * @param attribute The attribute path
     * @param value     The target attribute value
     * @param isDelta   Whether the number represents a relative change (true) or an absolute change (false)
     * @param isBar     Whether the new value is part of an attribute bar, or just a direct value
     */
    override async modifyTokenAttribute(
        attribute: string,
        value: number,
        isDelta = false,
        isBar = true
    ): Promise<this> {
        const token = this.getActiveTokens(false, true).shift();
        const isDamage = isDelta || (value === 0 && !!token?.combatant);
        if (token && attribute === "attributes.hp" && isDamage) {
            const damage = value === 0 ? this.hitPoints?.value ?? 0 : -value;
            return this.applyDamage({ damage, token });
        }
        return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
    }

    /**
     * Apply rolled dice damage to the token or tokens which are currently controlled.
     * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
     * @param finalDamage The amount of damage inflicted
     * @param token The applicable token for this actor
     * @param shieldBlockRequest Whether the user has toggled the Shield Block button
     */
    async applyDamage({
        damage,
        token,
        rollOptions = new Set(),
        skipIWR = false,
        shieldBlockRequest = false,
    }: ApplyDamageParams): Promise<this> {
        const { hitPoints } = this;
        if (!hitPoints) return this;

        // Round damage and healing (negative values) toward zero
        const result: IWRApplicationData =
            typeof damage === "number"
                ? { finalDamage: Math.trunc(damage), applications: [], persistent: [] }
                : skipIWR
                ? { finalDamage: damage.total, applications: [], persistent: [] }
                : applyIWR(this, damage, rollOptions);

        const { finalDamage } = result;

        // Calculate damage to hit points and shield
        const translations = LocalizeXPRPG.translations.XPRPG.Actor.ApplyDamage;
        const actorShield = this.isOfType("character", "npc") ? this.attributes.shield : null;
        const shieldBlock =
            actorShield && shieldBlockRequest
                ? ((): boolean => {
                      const warnings = LocalizeXPRPG.translations.XPRPG.Actions.RaiseAShield;
                      if (actorShield.broken) {
                          ui.notifications.warn(
                              game.i18n.format(warnings.ShieldIsBroken, { actor: token.name, shield: actorShield.name })
                          );
                          return false;
                      } else if (actorShield.destroyed) {
                          ui.notifications.warn(
                              game.i18n.format(warnings.ShieldIsDestroyed, {
                                  actor: token.name,
                                  shield: actorShield.name,
                              })
                          );
                          return false;
                      } else if (!actorShield.raised) {
                          ui.notifications.warn(game.i18n.format(translations.ShieldNotRaised, { actor: token.name }));
                          return false;
                      } else {
                          return true;
                      }
                  })()
                : false;

        const shieldHardness = shieldBlock ? actorShield?.hardness ?? 0 : 0;
        const absorbedDamage = Math.min(shieldHardness, Math.abs(finalDamage));
        const shieldDamage = shieldBlock
            ? Math.min(actorShield?.hp.value ?? 0, Math.abs(finalDamage) - absorbedDamage)
            : 0;

        const hpUpdate = this.calculateHealthDelta({
            hp: hitPoints,
            sp: this.isOfType("character") ? this.attributes.sp : undefined,
            delta: finalDamage - absorbedDamage,
        });
        const hpDamage = hpUpdate.totalApplied;

        // Make updates
        if (shieldDamage > 0) {
            const shield = (() => {
                const item = this.items.get(actorShield?.itemId ?? "");
                return item?.isOfType("armor") ? item : null;
            })();
            await shield?.update(
                { "system.hp.value": shield.hitPoints.value - shieldDamage },
                { render: hpDamage === 0 }
            );
        }
        if (hpDamage !== 0) {
            const updated = await this.update(hpUpdate.updates);
            const deadAtZero = ["npcsOnly", "both"].includes(game.settings.get("xprpg", "automation.actorsDeadAtZero"));
            const toggleDefeated =
                updated.isDead &&
                ((hpDamage >= 0 && !token.combatant?.isDefeated) || (hpDamage < 0 && !!token.combatant?.isDefeated));

            if (updated.isOfType("npc") && deadAtZero && toggleDefeated) {
                token.combatant?.toggleDefeated();
            }
        }

        // Send chat message
        const hpStatement = ((): string => {
            // This would be a nested ternary, except prettier thoroughly mangles it
            if (finalDamage === 0) return translations.TakesNoDamage;
            if (finalDamage > 0) {
                return absorbedDamage > 0
                    ? hpDamage > 0
                        ? translations.DamagedForNShield
                        : translations.ShieldAbsorbsAll
                    : translations.DamagedForN;
            }
            return hpDamage < 0 ? translations.HealedForN : translations.AtFullHealth;
        })();

        const updatedShield = this.isOfType("character", "npc") ? this.attributes.shield : null;
        const shieldStatement =
            updatedShield && shieldDamage > 0
                ? updatedShield.broken
                    ? translations.ShieldDamagedForNBroken
                    : updatedShield.destroyed
                    ? translations.ShieldDamagedForNDestroyed
                    : translations.ShieldDamagedForN
                : null;

        const statements = ((): string => {
            const concatenated = [hpStatement, shieldStatement]
                .filter((s): s is string => !!s)
                .map((s) =>
                    game.i18n.format(s, {
                        actor: token.name.replace(/[<>]/g, ""),
                        hpDamage: Math.abs(hpDamage),
                        absorbedDamage,
                        shieldDamage,
                    })
                )
                .join(" ");

            // In case "tokenSetsNameVisibility" is enabled, replace <actor> XML nodes with span elements indicating
            // where the damage recipient's name is in the message so that it may be obscured to players.
            const tempElem = document.createElement("div");
            tempElem.innerHTML = concatenated;
            TextEditorXPRPG.convertXMLNode(tempElem, "actor", { whose: null, classes: ["target-name"] });

            return tempElem.innerHTML;
        })();

        const deparenthesize = (formula: string) => formula.replace(/^\(([^)]+)\)$/, "$1");

        // Apply persistent damage as conditions
        const persistentDamage = result.persistent.map((instance) => {
            const condition = game.xprpg.ConditionManager.getCondition("persistent-damage").toObject();
            condition.system.persistent = {
                // Remove enclosing parentheses if present since it's no longer part of the original expression
                formula: deparenthesize(instance.head.expression),
                damageType: instance.type,
                dc: 15,
            };
            return condition;
        });

        for (const source of [...persistentDamage]) {
            const maxDamage = await maxPersistentAfterIWR(this, deepClone(source), rollOptions);
            if (maxDamage === 0) persistentDamage.splice(persistentDamage.indexOf(source), 1);
        }

        const persistentCreated = (
            persistentDamage.length > 0 ? await this.createEmbeddedDocuments("Item", persistentDamage) : []
        ) as ConditionXPRPG[];

        const content = await renderTemplate("systems/xprpg/templates/chat/damage/damage-taken.hbs", {
            statements,
            persistent: persistentCreated.map((p) => p.system.persistent!.damage.formula),
            iwr: {
                applications: result.applications,
                visibility: this.hasPlayerOwner ? "all" : "gm",
            },
        });

        await ChatMessageXPRPG.create({
            speaker: ChatMessageXPRPG.getSpeaker({ token }),
            content,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
            whisper:
                game.settings.get("xprpg", "metagame_secretDamage") && !token.actor?.hasPlayerOwner
                    ? ChatMessageXPRPG.getWhisperRecipients("GM").map((u) => u.id)
                    : [],
        });

        return this;
    }

    isLootableBy(user: UserXPRPG) {
        return this.canUserModify(user, "update");
    }

    /**
     * Moves an item to another actor's inventory.
     * @param targetActor Instance of actor to be receiving the item.
     * @param item        Instance of the item being transferred.
     * @param quantity    Number of items to move.
     * @param containerId Id of the container that will contain the item.
     * @return The target item, if the transfer is successful, or otherwise `null`.
     */
    async transferItemToActor(
        targetActor: ActorXPRPG,
        item: Embedded<ItemXPRPG>,
        quantity: number,
        containerId?: string,
        newStack = false
    ): Promise<Embedded<PhysicalItemXPRPG> | null> {
        if (!(item instanceof PhysicalItemXPRPG)) {
            throw ErrorXPRPG("Only physical items (with quantities) can be transfered between actors");
        }
        const container = targetActor.inventory.get(containerId ?? "");
        if (!(!container || container instanceof ContainerXPRPG)) {
            throw ErrorXPRPG("containerId refers to a non-container");
        }

        // Loot transfers can be performed by non-owners when a GM is online */
        const gmMustTransfer = (source: ActorXPRPG, target: ActorXPRPG): boolean => {
            const bothAreOwned = source.isOwner && target.isOwner;
            const sourceIsOwnedOrLoot = source.isLootableBy(game.user);
            const targetIsOwnedOrLoot = target.isLootableBy(game.user);
            return !bothAreOwned && sourceIsOwnedOrLoot && targetIsOwnedOrLoot;
        };
        if (gmMustTransfer(this, targetActor)) {
            const source = { tokenId: this.token?.id, actorId: this.id, itemId: item.id };
            const target = { tokenId: targetActor.token?.id, actorId: targetActor.id };
            await new ItemTransfer(source, target, quantity, container?.id).request();
            return null;
        }

        if (!this.canUserModify(game.user, "update")) {
            ui.notifications.error(game.i18n.localize("XPRPG.ErrorMessage.CantMoveItemSource"));
            return null;
        }
        if (!targetActor.canUserModify(game.user, "update")) {
            ui.notifications.error(game.i18n.localize("XPRPG.ErrorMessage.CantMoveItemDestination"));
            return null;
        }

        // Limit the amount of items transfered to how many are actually available.
        quantity = Math.min(quantity, item.quantity);

        // Remove the item from the source if we are transferring all of it; otherwise, subtract the appropriate number.
        const newQuantity = item.quantity - quantity;
        const removeFromSource = newQuantity < 1;

        if (removeFromSource) {
            await item.delete();
        } else {
            await item.update({ "system.quantity": newQuantity });
        }

        const newItemData = item.toObject();
        newItemData.system.quantity = quantity;
        newItemData.system.equipped.carryType = "worn";
        if (hasInvestedProperty(newItemData)) {
            newItemData.system.equipped.invested = item.traits.has("invested") ? false : null;
        }

        return targetActor.addToInventory(newItemData, container, newStack);
    }

    async addToInventory(
        itemSource: PhysicalItemSource,
        container?: Embedded<ContainerXPRPG>,
        newStack?: boolean
    ): Promise<Embedded<PhysicalItemXPRPG> | null> {
        // Stack with an existing item if possible
        const stackItem = this.findStackableItem(this, itemSource);
        if (!newStack && stackItem && stackItem.type !== "backpack") {
            const stackQuantity = stackItem.quantity + itemSource.system.quantity;
            await stackItem.update({ "system.quantity": stackQuantity });
            return stackItem;
        }

        // Otherwise create a new item
        const result = await ItemXPRPG.create(itemSource, { parent: this });
        if (!result) {
            return null;
        }
        const movedItem = this.inventory.get(result.id);
        if (!movedItem) return null;
        await this.stowOrUnstow(movedItem, container);

        return movedItem;
    }

    /** Find an item already owned by the actor that can stack with the to-be-transferred item */
    findStackableItem(actor: ActorXPRPG, itemSource: ItemSourceXPRPG): Embedded<PhysicalItemXPRPG> | null {
        // Prevent upstream from mutating property descriptors
        const testItem = new ItemProxyXPRPG(deepClone(itemSource));
        const stackCandidates = actor.inventory.filter(
            (stackCandidate) =>
                !stackCandidate.isInContainer &&
                testItem instanceof PhysicalItemXPRPG &&
                stackCandidate.isStackableWith(testItem)
        );

        if (stackCandidates.length === 0) {
            return null;
        } else if (stackCandidates.length > 1) {
            // Prefer stacking with unequipped items
            const notEquipped = stackCandidates.filter((item) => !item.isEquipped);
            return notEquipped.length > 0 ? notEquipped[0] : stackCandidates[0];
        } else {
            return stackCandidates[0];
        }
    }

    /** Move an item into the inventory into or out of a container */
    async stowOrUnstow(item: Embedded<PhysicalItemXPRPG>, container?: Embedded<ContainerXPRPG>): Promise<void> {
        if (!container) {
            await item.update({
                "system.containerId": null,
                "system.equipped.carryType": "worn",
                "system.equipped.handsHeld": 0,
                "system.equipped.inSlot": false,
            });
        } else if (!isCycle(item, container)) {
            const carryType = container.stowsItems ? "stowed" : "worn";
            await item.update({
                "system.containerId": container.id,
                "system.equipped.carryType": carryType,
                "system.equipped.handsHeld": 0,
                "system.equipped.inSlot": false,
            });
        }
    }

    /** Determine actor updates for applying damage/healing across temporary hit points, stamina, and then hit points */
    private calculateHealthDelta(args: {
        hp: { max: number; value: number; temp: number };
        sp?: { max: number; value: number };
        delta: number;
    }) {
        const updates: Record<string, number> = {};
        const { hp, sp, delta } = args;
        const appliedToTemp = ((): number => {
            if (!hp.temp || delta <= 0) return 0;
            const applied = Math.min(hp.temp, delta);
            updates["system.attributes.hp.temp"] = Math.max(hp.temp - applied, 0);

            return applied;
        })();

        const appliedToSP = ((): number => {
            const staminaEnabled = !!sp && game.settings.get("xprpg", "staminaVariant");
            if (!staminaEnabled || delta <= 0) return 0;
            const remaining = delta - appliedToTemp;
            const applied = Math.min(sp.value, remaining);
            updates["system.attributes.sp.value"] = Math.max(sp.value - applied, 0);

            return applied;
        })();

        const appliedToHP = ((): number => {
            const remaining = delta - appliedToTemp - appliedToSP;
            const applied = remaining > 0 ? Math.min(hp.value, remaining) : Math.max(hp.value - hp.max, remaining);
            updates["system.attributes.hp.value"] = Math.max(hp.value - applied, 0);

            return applied;
        })();
        const totalApplied = appliedToTemp + appliedToSP + appliedToHP;

        return { updates, totalApplied };
    }

    static getActionGraphics(
        type: ActionType,
        actionCount?: OneToThree
    ): { imageUrl: ImageFilePath; actionGlyph: string } {
        console.warn(
            "XPRPG System | ActorXPRPG#getActionGraphics() is deprecated. If you rely on this function, please inform the Xenos Paragon2e dev team"
        );

        const actionCost: ActionCost | null = type === "passive" ? null : { type, value: actionCount ?? 1 };

        return {
            imageUrl: getActionIcon(actionCost),
            actionGlyph: getActionGlyph(actionCost),
        };
    }

    /**
     * Retrieve all roll option from the requested domains. Micro-optimized in an excessively verbose for-loop.
     * @param domains The domains of discourse from which to pull options. Always includes the "all" domain.
     */
    getRollOptions(domains: string[] = []): string[] {
        const withAll = Array.from(new Set(["all", ...domains]));
        const { rollOptions } = this;
        const toReturn: Set<string> = new Set();

        for (const domain of withAll) {
            for (const [option, value] of Object.entries(rollOptions[domain] ?? {})) {
                if (value) toReturn.add(option);
            }
        }

        return Array.from(toReturn).sort();
    }

    /** This allows @actor.level and such to work for roll macros */
    override getRollData(): Record<string, unknown> {
        return { ...duplicate(super.getRollData()), actor: this };
    }

    /* -------------------------------------------- */
    /* Conditions                                   */
    /* -------------------------------------------- */

    /**
     * Get a condition on this actor, returning:
     *   - the highest-valued if there are multiple of a valued condition
     *   - the longest-lasting if there are multiple of a condition with a duration
     *   - the last applied if any are present and are neither valued nor with duration
     *   - otherwise `null`
     * @param slug the slug of a core condition (subject to change when user-created conditions are introduced)
     * @param [options.all=false] return all conditions of the requested type in the order described above
     */
    getCondition(
        slug: ConditionKey,
        { all }: { all: boolean } = { all: false }
    ): Embedded<ConditionXPRPG>[] | Embedded<ConditionXPRPG> | null {
        const conditions = this.itemTypes.condition
            .filter((condition) => condition.key === slug || condition.slug === slug)
            .sort((conditionA, conditionB) => {
                const [valueA, valueB] = [conditionA.value ?? 0, conditionB.value ?? 0] as const;
                return valueA > valueB ? 1 : valueB < valueB ? -1 : 0;
            });

        return all ? conditions : conditions[0] ?? null;
    }

    /**
     * Does this actor have any of the provided condition?
     * @param slugs Slug(s) of the queried condition(s)
     */
    hasCondition(...slugs: ConditionSlug[]): boolean {
        return slugs.some((s) => this.conditions.has(s));
    }

    /** Decrease the value of condition or remove it entirely */
    async decreaseCondition(
        conditionSlug: ConditionKey | Embedded<ConditionXPRPG>,
        { forceRemove }: { forceRemove: boolean } = { forceRemove: false }
    ): Promise<void> {
        // Find a valid matching condition if a slug was passed
        const condition = typeof conditionSlug === "string" ? this.getCondition(conditionSlug) : conditionSlug;
        if (!condition) return;

        // If this is persistent damage, remove all matching types, heal from all at once
        if (condition.slug === "persistent-damage") {
            const matching = this.itemTypes.condition.filter((c) => c.key === condition.key).map((c) => c.id);
            await this.deleteEmbeddedDocuments("Item", matching);
            return;
        }

        const value = typeof condition.value === "number" ? Math.max(condition.value - 1, 0) : null;
        if (value !== null && !forceRemove) {
            await game.xprpg.ConditionManager.updateConditionValue(condition.id, this, value);
        } else {
            await this.deleteEmbeddedDocuments("Item", [condition.id]);
        }
    }

    /** Increase a valued condition, or create a new one if not present */
    async increaseCondition(
        conditionSlug: ConditionSlug | Embedded<ConditionXPRPG>,
        { min, max = Number.MAX_SAFE_INTEGER }: { min?: number | null; max?: number | null } = {}
    ): Promise<ConditionXPRPG | null> {
        const existing = typeof conditionSlug === "string" ? this.getCondition(conditionSlug) : conditionSlug;
        if (existing) {
            const conditionValue = (() => {
                if (existing.value === null) return null;
                if (min && max && min > max) throw ErrorXPRPG(`min (${min}) > max (${max})`);
                return min && max
                    ? Math.clamped(existing.value + 1, min, max)
                    : max
                    ? Math.min(existing.value + 1, max)
                    : existing.value + 1;
            })();
            if (conditionValue === null || conditionValue > (max ?? 0)) return null;
            await game.xprpg.ConditionManager.updateConditionValue(existing.id, this, conditionValue);
            return existing;
        } else if (typeof conditionSlug === "string") {
            const conditionSource = game.xprpg.ConditionManager.getCondition(conditionSlug).toObject();
            const conditionValue =
                typeof conditionSource?.system.value.value === "number" && min && max
                    ? Math.clamped(conditionSource.system.value.value, min, max)
                    : null;
            conditionSource.system.value.value = conditionValue;
            const items = (await this.createEmbeddedDocuments("Item", [conditionSource])) as ConditionXPRPG[];

            return items.shift() ?? null;
        }
        return null;
    }

    /** Toggle a condition as present or absent. If a valued condition is toggled on, it will be set to a value of 1. */
    async toggleCondition(conditionSlug: ConditionSlug): Promise<void> {
        if (this.hasCondition(conditionSlug)) {
            await this.decreaseCondition(conditionSlug, { forceRemove: true });
        } else {
            await this.increaseCondition(conditionSlug);
        }
    }

    /** Assess and pre-process this JSON data, ensuring it's importable and fully migrated */
    override async importFromJSON(json: string): Promise<this> {
        const processed = await preImportJSON(this, json);
        return processed ? super.importFromJSON(processed) : this;
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    protected override async _preCreate(
        data: PreDocumentId<this["_source"]>,
        options: DocumentModificationContext<this>,
        user: UserXPRPG
    ): Promise<void> {
        // Set default portrait and token images
        this._source.prototypeToken = mergeObject(this._source.prototypeToken ?? {}, { texture: {} });
        if (this._source.img === ActorXPRPG.DEFAULT_ICON) {
            this._source.img =
                this._source.prototypeToken.texture.src = `systems/xprpg/icons/default-icons/${data.type}.svg`;
        }

        return super._preCreate(data, options, user);
    }

    protected override async _preUpdate(
        changed: DeepPartial<this["_source"]>,
        options: ActorUpdateContext<this>,
        user: UserXPRPG
    ): Promise<void> {
        // Show floaty text when applying damage or healing
        const changedHP = changed.system?.attributes?.hp;
        const currentHP = this.hitPoints;
        if (typeof changedHP?.value === "number" && currentHP) {
            const hpChange = changedHP.value - currentHP.value;
            const levelChanged = !!changed.system?.details && "level" in changed.system.details;
            if (hpChange !== 0 && !levelChanged) options.damageTaken = hpChange;
        }

        await super._preUpdate(changed, options, user);
    }

    protected override _onUpdate(
        changed: DeepPartial<this["_source"]>,
        options: ActorUpdateContext<this>,
        userId: string
    ): void {
        super._onUpdate(changed, options, userId);
        const hideFromUser =
            !this.hasPlayerOwner && !game.user.isGM && game.settings.get("xprpg", "metagame_secretDamage");
        if (options.damageTaken && !hideFromUser) {
            const tokens = super.getActiveTokens();
            for (const token of tokens) {
                token.showFloatyText(options.damageTaken);
            }
        }

        // If alliance has changed, reprepare token data to update the color of bounding boxes
        if (canvas.ready && changed.system?.details && "alliance" in changed.system.details) {
            for (const token of this.getActiveTokens(true, true)) {
                token.reset();
            }
        }
    }

    /** Unregister all effects possessed by this actor */
    protected override _onDelete(options: DocumentModificationContext<this>, userId: string): void {
        for (const effect of this.itemTypes.effect) {
            game.xprpg.effectTracker.unregister(effect);
        }
        super._onDelete(options, userId);
    }

    protected override _onEmbeddedDocumentChange(embeddedName: "Item" | "ActiveEffect"): void {
        // Send any accrued warnings to the console
        this.synthetics.preparationWarnings.flush();

        if (this.isToken) {
            return super._onEmbeddedDocumentChange(embeddedName);
        } else if (game.combat?.getCombatantByActor(this.id)) {
            // Needs to be done since `super._onEmbeddedDocumentChange` isn't called
            ui.combat.render();
        }

        // For linked tokens, replace parent method with alternative workflow to control canvas re-rendering
        const tokenDocs = this.getActiveTokens(true, true);
        for (const tokenDoc of tokenDocs) {
            tokenDoc.onActorEmbeddedItemChange();
        }
    }
}

interface ActorXPRPG extends Actor<TokenDocumentXPRPG, ItemTypeMap> {
    readonly data: ActorDataXPRPG;

    readonly items: foundry.abstract.EmbeddedCollection<ItemXPRPG>;

    readonly effects: foundry.abstract.EmbeddedCollection<ActiveEffectXPRPG>;

    readonly system: ActorSystemData;

    prototypeToken: PrototypeTokenXPRPG;

    flags: ActorFlagsXPRPG;

    _sheet: ActorSheetXPRPG<this> | ActorSheet<this, ItemXPRPG> | null;

    get sheet(): ActorSheetXPRPG<this>;

    /** See implementation in class */
    createEmbeddedDocuments(
        embeddedName: "ActiveEffect",
        data: PreCreate<foundry.data.ActiveEffectSource>[],
        context?: DocumentModificationContext
    ): Promise<ActiveEffectXPRPG[]>;
    createEmbeddedDocuments(
        embeddedName: "Item",
        data: PreCreate<ItemSourceXPRPG>[],
        context?: DocumentModificationContext
    ): Promise<ItemXPRPG[]>;
    createEmbeddedDocuments(
        embeddedName: "ActiveEffect" | "Item",
        data: PreCreate<foundry.data.ActiveEffectSource>[] | PreCreate<ItemSourceXPRPG>[],
        context?: DocumentModificationContext
    ): Promise<ActiveEffectXPRPG[] | ItemXPRPG[]>;

    /** See implementation in class */
    updateEmbeddedDocuments(
        embeddedName: "ActiveEffect",
        updateData: EmbeddedDocumentUpdateData<ActiveEffectXPRPG>[],
        options?: DocumentModificationContext
    ): Promise<ActiveEffectXPRPG[]>;
    updateEmbeddedDocuments(
        embeddedName: "Item",
        updateData: EmbeddedDocumentUpdateData<ItemXPRPG>[],
        options?: DocumentModificationContext
    ): Promise<ItemXPRPG[]>;
    updateEmbeddedDocuments(
        embeddedName: "ActiveEffect" | "Item",
        updateData: EmbeddedDocumentUpdateData<ActiveEffectXPRPG | ItemXPRPG>[],
        options?: DocumentModificationContext
    ): Promise<ActiveEffectXPRPG[] | ItemXPRPG[]>;

    getCondition(conditionType: ConditionKey, { all }: { all: true }): Embedded<ConditionXPRPG>[];
    getCondition(conditionType: ConditionKey, { all }: { all: false }): Embedded<ConditionXPRPG> | null;
    getCondition(conditionType: ConditionKey): Embedded<ConditionXPRPG> | null;
    getCondition(
        conditionType: ConditionKey,
        { all }: { all: boolean }
    ): Embedded<ConditionXPRPG>[] | Embedded<ConditionXPRPG> | null;

    /** Added as debounced method */
    checkAreaEffects(): void;
}

type ItemTypeMap = {
    [K in ItemType]: InstanceType<ConfigXPRPG["XPRPG"]["Item"]["documentClasses"][K]>;
};

interface HitPointsSummary {
    value: number;
    max: number;
    temp: number;
    negativeHealing: boolean;
}

interface ActorUpdateContext<T extends ActorXPRPG> extends DocumentUpdateContext<T> {
    damageTaken?: number;
}

/** A `Proxy` to to get Foundry to construct `ActorXPRPG` subclasses */
const ActorProxyXPRPG = new Proxy(ActorXPRPG, {
    construct(
        _target,
        args: [source: PreCreate<ActorSourceXPRPG>, context: DocumentConstructionContext<ActorXPRPG["parent"]>]
    ) {
        return new CONFIG.XPRPG.Actor.documentClasses[args[0].type](...args);
    },
});

export { ActorXPRPG, ActorProxyXPRPG, ActorUpdateContext, HitPointsSummary };