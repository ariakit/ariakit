import { createStore, setup, unstable_setStoreState } from "@ariakit/store";
import type { Store } from "@ariakit/store";
import {
  applyState,
  canUseDOM,
  disabledFromElement,
  fireClickEvent,
  isElement,
} from "@ariakit/utils";
import type { BooleanOrCallback, SetState } from "@ariakit/utils";
import {
  formatShortcutKeys,
  getDefaultShortcutGlyphs,
  getDefaultShortcutKeyNames,
  getShortcutEventKeys,
  getShortcutPlatform,
  parseShortcutKeys,
  parseShortcutKeysSilently,
} from "./__shortcut-keys.ts";
import type {
  ShortcutFormatOptions,
  ShortcutGlyphs,
  ShortcutKeyNames,
  ShortcutKeyTokens,
  ShortcutPlatform,
} from "./__shortcut-keys.ts";

export type {
  ShortcutFormatOptions,
  ShortcutGlyphs,
  ShortcutKeyNames,
  ShortcutPlatform,
} from "./__shortcut-keys.ts";

/** Properties shared by all shortcut activation sources. */
export interface ShortcutEventProps {
  /** The logical command name, when the registration is named. */
  command?: string;
  /** The canonical shortcut associated with this activation. */
  keys: string;
  /** The event origin resolved through the composed path. */
  target: Element | null;
}

/** An activation produced by the document keyboard dispatcher. */
export interface ShortcutKeyboardEvent extends ShortcutEventProps {
  source: "keyboard";
  originalEvent: KeyboardEvent;
}

/** An activation bridged from a command reference's click. */
export interface ShortcutClickEvent extends ShortcutEventProps {
  source: "click";
  originalEvent: MouseEvent;
}

/** An activation produced by [`trigger`](#trigger). */
export interface ShortcutProgrammaticEvent extends ShortcutEventProps {
  source: "programmatic";
  originalEvent?: undefined;
  target: null;
}

/** The source-aware event passed to a shortcut command handler. */
export type ShortcutEvent =
  | ShortcutKeyboardEvent
  | ShortcutClickEvent
  | ShortcutProgrammaticEvent;

/** A structural element ref that does not depend on React. */
export interface ShortcutElementRef {
  readonly current: Element | null;
}

/** An element or live element ref used as a shortcut focus region. */
export type ShortcutScopeRef = Element | ShortcutElementRef;

/**
 * An opaque scope identity shared between the React scope context and the core
 * registry.
 * @private
 */
export type UnstableShortcutScope = object;

/** Derived state for one rendered command registration. @private */
export interface UnstableShortcutCommandState {
  command?: string;
  keys: string[];
  enabled: boolean;
  inScope: boolean;
  ariaKeyShortcuts?: string;
}

/** Options accepted by [`registerCommand`](#registercommand). */
export interface ShortcutCommandOptions {
  /**
   * The logical command name. Registrations with the same name merge only
   * along the current store ancestry.
   */
  command?: string;
  /**
   * Space-separated shortcut alternatives. `null` explicitly unbinds a named
   * command.
   */
  keys?: string | null;
  /** Runs when the command is activated. Return `false` to decline. */
  onTrigger?: (event: ShortcutEvent) => unknown;
  /** Whether an accepted command prevents the browser default. @default true */
  preventDefault?: BooleanOrCallback<ShortcutEvent>;
  /**
   * The focus regions in which the command is active. `null` makes the command
   * global; an unresolved ref keeps it out of scope.
   */
  scope?: ShortcutScopeRef | ShortcutScopeRef[] | null;
  /** Whether this registration participates in activation. @default true */
  enabled?: boolean;
  /**
   * Whether the command can run from a textbox. By default, printable
   * shortcuts without a command modifier are disabled in textboxes.
   */
  enabledInTextbox?: BooleanOrCallback<ShortcutEvent>;
  /** The store used by framework hooks. The store method itself ignores it. */
  store?: ShortcutStore;
  /** Stable identity assigned by the React registration hook. @private */
  unstable_id?: object;
  /** Returns the current rendered reference element. @private */
  unstable_getElement?: () => Element | null;
  /** Resolved scope identities inherited through React context. @private */
  unstable_scope?: UnstableShortcutScope | UnstableShortcutScope[] | null;
}

/** Options accepted by [`registerScope`](#registerscope). */
export interface ShortcutScopeOptions {
  /** The store used by framework hooks. The store method itself ignores it. */
  store?: ShortcutStore;
  /** Stable identity assigned by the React scope. @private */
  unstable_id?: UnstableShortcutScope;
  /** Returns the current element that starts this region. @private */
  unstable_getElement?: () => Element | null;
  /** The parent scope from React context, including across portals. @private */
  unstable_parent?: UnstableShortcutScope | null;
}

/** State exposed by a shortcut store. */
export interface ShortcutStoreState {
  /**
   * Whether this store and every ancestor level participate in dispatch.
   * @default true
   */
  enabled: boolean;
  /** The platform used to resolve and display shortcuts. */
  platform: ShortcutPlatform;
  /** Display text for shortcut tokens. */
  glyphs: ShortcutGlyphs;
  /** Readable or spoken names for shortcut tokens. */
  keyNames: ShortcutKeyNames;
  /** Per-command key overrides. `null` unbinds a command. */
  keys: Record<string, string | null>;
}

/** Options for [`createShortcutStore`](#createshortcutstore). */
export interface ShortcutStoreOptions {
  /**
   * Whether this store level participates in dispatch.
   * @default true
   */
  enabled?: boolean;
  /**
   * Platform used to resolve and display shortcuts. The browser platform is
   * detected when DOM globals are available; otherwise, it defaults to
   * `"other"`.
   * @default current platform
   */
  platform?: ShortcutPlatform;
  /**
   * Display text for shortcut tokens. Defaults to Apple symbols on Apple
   * platforms and readable modifier names elsewhere.
   * @default platform glyphs
   */
  glyphs?: ShortcutGlyphs;
  /**
   * Readable or spoken names for shortcut tokens.
   * @default platform names
   */
  keyNames?: ShortcutKeyNames;
  /**
   * Initial per-command key overrides.
   * @default {}
   */
  keys?: Record<string, string | null>;
  /**
   * Parent level used for inheritance and dispatch priority.
   * @private
   * @default undefined
   */
  unstable_parent?: ShortcutStore;
  /**
   * Defers a nested store's live registration until store initialization.
   * @private
   * @default false
   */
  unstable_deferActivation?: boolean;
}

/** Props for [`createShortcutStore`](#createshortcutstore). */
export interface ShortcutStoreProps extends ShortcutStoreOptions {
  /** An existing shortcut store to reuse. */
  store?: ShortcutStore | null;
}

/** Functions exposed by a shortcut store. */
export interface ShortcutStoreFunctions {
  /** Registers a command and returns an idempotent unregister function. */
  registerCommand(options: ShortcutCommandOptions): () => void;
  /** Registers a React-composed focus region. */
  registerScope(options: ShortcutScopeOptions): () => void;
  /** Sets whether this store level participates in dispatch. */
  setEnabled: SetState<ShortcutStoreState["enabled"]>;
  /**
   * Remaps a command. `null` unbinds it; `undefined` clears the override and
   * restores its declaration.
   */
  setKeys(command: string, keys: string | null | undefined): void;
  /** Runs a named command without applying its focus scope. */
  trigger(command: string): boolean;
  /** Returns a named command's current canonical shortcut alternatives. */
  getKeys(command: string): string[];
  /** Adds another document, such as a same-origin iframe, to dispatch. */
  attach(document: Document): () => void;
  /** Formats one or more declared shortcuts as display text. */
  formatKeys(keys: string, options?: ShortcutFormatOptions): string;
  /** Parent level used for inheritance and dispatch priority. @private */
  readonly unstable_parent?: ShortcutStore;
  /** Whether `platform` was supplied rather than detected. @private */
  readonly unstable_hasExplicitPlatform: boolean;
  /** Returns the opaque registry and focus revision. @private */
  unstable_getRegistryVersion(): number;
  /** Subscribes to registry, configuration, and focus revisions. @private */
  unstable_subscribeRegistry(listener: () => void): () => void;
  /** Returns derived state for a rendered registration. @private */
  unstable_getCommandState(
    id: object,
    origin?: Element | null,
  ): UnstableShortcutCommandState | undefined;
  /** Returns derived state for a command name without registering it. @private */
  unstable_getNamedCommandState(
    command: string,
    origin?: Element | null,
  ): UnstableShortcutCommandState | undefined;
  /** Resolves a named declaration before its registration commits. @private */
  unstable_getCommandKeys(
    command: string,
    keys: string | null | undefined,
  ): string[];
  /** Tests whether one or more focus regions are currently active. @private */
  unstable_isScopeActive(
    scope:
      | ShortcutScopeRef
      | ShortcutScopeRef[]
      | UnstableShortcutScope
      | UnstableShortcutScope[]
      | null,
    origin?: Element | null,
  ): boolean;
  /** Bridges a rendered command reference's real click. @private */
  unstable_triggerCommand(id: object, event: MouseEvent): boolean;
  /** Identifies a click synthesized by keyboard dispatch. @private */
  unstable_isSyntheticClick(event: Event): boolean;
  /** Returns structured tokens for the React display component. @private */
  unstable_getKeyTokens(
    keys: string,
    options?: ShortcutFormatOptions,
  ): ShortcutKeyTokens[];
  /** Canonicalizes a recordable keydown with the dispatcher normalizer. @private */
  unstable_getEventKeys(event: KeyboardEvent): string | null;
  /** Returns the canonical store behind a framework wrapper copy. @private */
  unstable_getStore(): ShortcutStore;
  /** Releases this nested store from its parent's live registry. @private */
  unstable_dispose(): void;
  /** Marks a logical React scope as focused in a document. @private */
  unstable_setActiveScope(
    scope: UnstableShortcutScope,
    document: Document,
  ): void;
  /** Clears a logical React scope from a document. @private */
  unstable_clearActiveScope(
    scope: UnstableShortcutScope,
    document: Document,
  ): void;
}

/** Shortcut store. */
export interface ShortcutStore
  extends ShortcutStoreFunctions, Store<ShortcutStoreState> {}

type DeclarationField =
  | "keys"
  | "onTrigger"
  | "scope"
  | "preventDefault"
  | "enabledInTextbox";

interface GlobalScopeDeclaration {
  type: "global";
}

interface RefScopeDeclaration {
  type: "refs";
  refs: readonly ShortcutScopeRef[];
}

interface HandleScopeDeclaration {
  type: "handles";
  handles: readonly UnstableShortcutScope[];
}

type ScopeDeclaration =
  | GlobalScopeDeclaration
  | RefScopeDeclaration
  | HandleScopeDeclaration;

interface ShortcutCommandRegistration {
  id: symbol;
  externalId: object;
  runtime: ShortcutStoreRuntime;
  order: number;
  command?: string;
  keys?: string | null;
  parsedKeys?: ParsedShortcutValues;
  hasKeys: boolean;
  onTrigger?: (event: ShortcutEvent) => unknown;
  hasOnTrigger: boolean;
  preventDefault?: BooleanOrCallback<ShortcutEvent>;
  hasPreventDefault: boolean;
  scope: ScopeDeclaration;
  hasScope: boolean;
  enabled?: boolean;
  enabledInTextbox?: BooleanOrCallback<ShortcutEvent>;
  hasEnabledInTextbox: boolean;
  getElement?: () => Element | null;
}

interface ShortcutScopeRegistration {
  id: symbol;
  externalId: UnstableShortcutScope;
  runtime: ShortcutStoreRuntime;
  order: number;
  getElement: () => Element | null;
  parent: UnstableShortcutScope | null;
}

interface ExplicitState {
  platform: boolean;
  glyphs: boolean;
  keyNames: boolean;
}

interface ShortcutStoreRuntime {
  store: ShortcutStore;
  baseStore: Store<ShortcutStoreState>;
  publicStore: Store<ShortcutStoreState>;
  parent?: ShortcutStoreRuntime;
  root?: ShortcutStoreRuntime;
  family: Set<ShortcutStoreRuntime>;
  active: boolean;
  depth: number;
  commands: Set<ShortcutCommandRegistration>;
  commandRegistrations: Map<string, Set<ShortcutCommandRegistration>>;
  registrationsByKey: ShortcutKeyIndex<ShortcutCommandRegistration>;
  overridesByKey: ShortcutKeyIndex<string>;
  scopes: Set<ShortcutScopeRegistration>;
  listeners: Set<() => void>;
  revision: number;
  liveRegistrations: number;
  releaseDefaultDocument?: () => void;
  explicitState: ExplicitState;
  parsedOverrides: Map<string, ParsedShortcutValues | null>;
  cachedState?: ShortcutStoreState;
  cachedStateRevision?: number;
  cachedParentState?: ShortcutStoreState;
}

type ParsedShortcutValues = Record<ShortcutPlatform, string[]>;

type ShortcutKeyIndex<Value> = Record<
  ShortcutPlatform,
  Map<string, Set<Value>>
>;

interface NamedCommandGroup {
  command: string;
  runtime: ShortcutStoreRuntime;
  registrations: ShortcutCommandRegistration[];
  keys: string[];
  order: number;
  scope: ScopeDeclaration;
  onTrigger?: ShortcutCommandRegistration;
  preventDefault?: ShortcutCommandRegistration;
  enabledInTextbox?: ShortcutCommandRegistration;
  references: ShortcutCommandRegistration[];
}

interface CommandAction {
  type: "handler" | "element";
  registration: ShortcutCommandRegistration;
  element?: Element;
}

interface DispatchCandidate {
  action: CommandAction;
  command?: string;
  keys: string;
  order: number;
  scopeMatch: ScopeMatch;
  storeDepth: number;
  runtime: ShortcutStoreRuntime;
  preventDefault?: ShortcutCommandRegistration;
  enabledInTextbox?: ShortcutCommandRegistration;
}

interface ScopeMatch {
  scoped: boolean;
  element: Element | null;
  distance: number | null;
  treeDepth: number;
  order: number;
}

interface DocumentDispatcher {
  document: Document;
  roots: Map<ShortcutStoreRuntime, number>;
  handledEvents: WeakSet<Event>;
  handledSignatures: Set<string>;
  activeScopes: Set<UnstableShortcutScope>;
  focusedElement: Element | null;
  focusEpoch: number;
  clearSignaturesTimer?: ReturnType<typeof setTimeout>;
  observer?: MutationObserver;
  dispose(): void;
}

const runtimes = new WeakMap<ShortcutStore, ShortcutStoreRuntime>();
const dispatchers = new WeakMap<Document, DocumentDispatcher>();
const activeScopesByDocument = new WeakMap<
  Document,
  Set<UnstableShortcutScope>
>();
const syntheticClickElements: Element[] = [];
const bridgedClickEvents = new WeakSet<Event>();

let registrationOrder = 0;

function warn(message: string) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(message);
}

function getRuntime(store?: ShortcutStore | null) {
  if (!store) return;
  const runtime = runtimes.get(store);
  if (runtime) return runtime;
  const source = store.unstable_getStore?.();
  if (!source || source === store) return;
  return runtimes.get(source);
}

function getRootRuntime(runtime: ShortcutStoreRuntime) {
  return runtime.root ?? runtime;
}

function activateRuntime(runtime: ShortcutStoreRuntime) {
  const root = getRootRuntime(runtime);
  if (runtime === root || runtime.active) return;
  warnAboutActiveRuntimeConflicts(runtime);
  runtime.active = true;
  root.family.add(runtime);
  notifyFamily(root);
}

function deactivateRuntime(runtime: ShortcutStoreRuntime) {
  const root = getRootRuntime(runtime);
  if (runtime === root || !runtime.active) return;
  runtime.active = false;
  if (!root.family.delete(runtime)) return;
  notifyFamily(root);
}

function getRuntimeState(runtime: ShortcutStoreRuntime): ShortcutStoreState {
  const parentState = runtime.parent?.store.getState();
  if (
    runtime.cachedStateRevision === runtime.revision &&
    runtime.cachedParentState === parentState
  ) {
    return runtime.cachedState ?? runtime.baseStore.getState();
  }
  const state = runtime.baseStore.getState();
  const enabled = state.enabled && (parentState?.enabled ?? true);
  const platform = runtime.explicitState.platform
    ? state.platform
    : (parentState?.platform ?? state.platform);
  const getInheritedMap = (
    field: "glyphs" | "keyNames",
    getDefault: (platform: ShortcutPlatform) => ShortcutGlyphs,
  ) => {
    if (runtime.explicitState[field]) return state[field];
    if (!runtime.explicitState.platform) {
      return parentState?.[field] ?? getDefault(platform);
    }
    let current = runtime.parent;
    while (current) {
      if (current.explicitState[field]) {
        return current.baseStore.getState()[field];
      }
      current = current.parent;
    }
    return getDefault(platform);
  };
  const glyphs = getInheritedMap("glyphs", getDefaultShortcutGlyphs);
  const keyNames = getInheritedMap("keyNames", getDefaultShortcutKeyNames);
  runtime.cachedState = { ...state, enabled, platform, glyphs, keyNames };
  runtime.cachedStateRevision = runtime.revision;
  runtime.cachedParentState = parentState;
  return runtime.cachedState;
}

function getExplicitFormatMap(
  runtime: ShortcutStoreRuntime,
  field: "glyphs" | "keyNames",
) {
  let current: ShortcutStoreRuntime | undefined = runtime;
  while (current) {
    if (current.explicitState[field]) {
      return current.baseStore.getState()[field];
    }
    current = current.parent;
  }
  return undefined;
}

function mergeFormatMaps(
  ...maps: Array<ShortcutGlyphs | ShortcutKeyNames | undefined>
) {
  const descriptors = Object.create(null) as PropertyDescriptorMap;
  for (const map of maps) {
    if (!map) continue;
    Object.assign(descriptors, Object.getOwnPropertyDescriptors(map));
  }
  return Object.defineProperties({}, descriptors) as ShortcutGlyphs;
}

function getFormatOptions(
  runtime: ShortcutStoreRuntime,
  options?: ShortcutFormatOptions,
): ShortcutFormatOptions {
  const state = runtime.store.getState();
  const platform = options?.platform ?? state.platform;
  const platformChanged =
    options?.platform !== undefined && options.platform !== state.platform;
  const glyphs = platformChanged
    ? mergeFormatMaps(
        getDefaultShortcutGlyphs(platform),
        getExplicitFormatMap(runtime, "glyphs"),
        options?.glyphs,
      )
    : mergeFormatMaps(state.glyphs, options?.glyphs);
  const keyNames = platformChanged
    ? mergeFormatMaps(
        getDefaultShortcutKeyNames(platform),
        getExplicitFormatMap(runtime, "keyNames"),
        options?.keyNames,
      )
    : mergeFormatMaps(state.keyNames, options?.keyNames);
  return { platform, glyphs, keyNames, joiner: options?.joiner };
}

function getNotifiedRuntimes(runtime: ShortcutStoreRuntime) {
  const members = [...getRootRuntime(runtime).family];
  if (!members.includes(runtime)) {
    members.push(runtime);
  }
  return members.sort((first, second) => first.depth - second.depth);
}

function invalidateFamily(runtime: ShortcutStoreRuntime) {
  for (const member of getNotifiedRuntimes(runtime)) {
    member.revision += 1;
    member.cachedState = undefined;
    member.cachedStateRevision = undefined;
    member.cachedParentState = undefined;
  }
}

function emitFamily(runtime: ShortcutStoreRuntime) {
  for (const member of getNotifiedRuntimes(runtime)) {
    for (const listener of [...member.listeners]) {
      listener();
    }
  }
}

function syncPublicState(runtime: ShortcutStoreRuntime) {
  unstable_setStoreState(runtime.publicStore, runtime.store.getState());
}

function syncPublicStates(runtime: ShortcutStoreRuntime) {
  for (const member of getNotifiedRuntimes(runtime)) {
    syncPublicState(member);
  }
}

function notifyFamily(runtime: ShortcutStoreRuntime) {
  invalidateFamily(runtime);
  syncPublicStates(runtime);
  emitFamily(runtime);
}

function getRuntimeChain(runtime: ShortcutStoreRuntime) {
  const chain: ShortcutStoreRuntime[] = [];
  let current: ShortcutStoreRuntime | undefined = runtime;
  while (current) {
    chain.unshift(current);
    current = current.parent;
  }
  return chain;
}

function isRuntimeAncestor(
  ancestor: ShortcutStoreRuntime,
  descendant: ShortcutStoreRuntime,
) {
  let current: ShortcutStoreRuntime | undefined = descendant;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

function areRuntimesRelated(
  first: ShortcutStoreRuntime,
  second: ShortcutStoreRuntime,
) {
  return isRuntimeAncestor(first, second) || isRuntimeAncestor(second, first);
}

function getCommandRegistrations(
  runtime: ShortcutStoreRuntime,
  command: string,
) {
  const registrations: ShortcutCommandRegistration[] = [];
  for (const member of getRuntimeChain(runtime)) {
    for (const registration of member.commandRegistrations.get(command) ?? []) {
      registrations.push(registration);
    }
  }
  registrations.sort((first, second) => first.order - second.order);
  return registrations;
}

const shortcutPlatforms: ShortcutPlatform[] = ["apple", "windows", "other"];

function createShortcutKeyIndex<Value>(): ShortcutKeyIndex<Value> {
  return {
    apple: new Map(),
    windows: new Map(),
    other: new Map(),
  };
}

function addShortcutValuesToIndex<Value>(
  index: ShortcutKeyIndex<Value>,
  values: ParsedShortcutValues,
  value: Value,
) {
  for (const platform of shortcutPlatforms) {
    for (const keys of values[platform]) {
      let matches = index[platform].get(keys);
      if (!matches) {
        matches = new Set();
        index[platform].set(keys, matches);
      }
      matches.add(value);
    }
  }
}

function removeShortcutValuesFromIndex<Value>(
  index: ShortcutKeyIndex<Value>,
  values: ParsedShortcutValues,
  value: Value,
) {
  for (const platform of shortcutPlatforms) {
    for (const keys of values[platform]) {
      const matches = index[platform].get(keys);
      if (!matches?.delete(value)) continue;
      if (matches.size) continue;
      index[platform].delete(keys);
    }
  }
}

function parseShortcutValues(
  input: string,
  currentPlatform: ShortcutPlatform,
  warnOnInvalid = true,
): ParsedShortcutValues {
  const values: ParsedShortcutValues = {
    apple: [],
    windows: [],
    other: [],
  };
  for (const platform of shortcutPlatforms) {
    const parsed =
      warnOnInvalid && platform === currentPlatform
        ? parseShortcutKeys(input, platform)
        : parseShortcutKeysSilently(input, platform);
    values[platform] = parsed.map((shortcut) => shortcut.value);
  }
  return values;
}

function parseShortcutOverrides(
  keys: Record<string, string | null>,
  currentPlatform: ShortcutPlatform,
) {
  const overrides = new Map<string, ParsedShortcutValues | null>();
  for (const command of Object.keys(keys)) {
    const value = keys[command];
    overrides.set(
      command,
      typeof value === "string"
        ? parseShortcutValues(value, currentPlatform)
        : null,
    );
  }
  return overrides;
}

function createShortcutOverrideIndex(
  overrides: ReadonlyMap<string, ParsedShortcutValues | null>,
) {
  const index = createShortcutKeyIndex<string>();
  for (const [command, values] of overrides) {
    if (!values) continue;
    addShortcutValuesToIndex(index, values, command);
  }
  return index;
}

function setParsedOverride(
  runtime: ShortcutStoreRuntime,
  command: string,
  values: ParsedShortcutValues | null | undefined,
) {
  const previousValues = runtime.parsedOverrides.get(command);
  if (previousValues) {
    removeShortcutValuesFromIndex(
      runtime.overridesByKey,
      previousValues,
      command,
    );
  }
  if (values === undefined) {
    runtime.parsedOverrides.delete(command);
    return;
  }
  runtime.parsedOverrides.set(command, values);
  if (values) {
    addShortcutValuesToIndex(runtime.overridesByKey, values, command);
  }
}

function addCommandRegistration(
  runtime: ShortcutStoreRuntime,
  registration: ShortcutCommandRegistration,
) {
  runtime.commands.add(registration);
  if (registration.command) {
    let registrations = runtime.commandRegistrations.get(registration.command);
    if (!registrations) {
      registrations = new Set();
      runtime.commandRegistrations.set(registration.command, registrations);
    }
    registrations.add(registration);
  }
  if (registration.parsedKeys) {
    addShortcutValuesToIndex(
      runtime.registrationsByKey,
      registration.parsedKeys,
      registration,
    );
  }
}

function removeCommandRegistration(
  runtime: ShortcutStoreRuntime,
  registration: ShortcutCommandRegistration,
) {
  if (!runtime.commands.delete(registration)) return false;
  if (registration.command) {
    const registrations = runtime.commandRegistrations.get(
      registration.command,
    );
    registrations?.delete(registration);
    if (!registrations?.size) {
      runtime.commandRegistrations.delete(registration.command);
    }
  }
  if (registration.parsedKeys) {
    removeShortcutValuesFromIndex(
      runtime.registrationsByKey,
      registration.parsedKeys,
      registration,
    );
  }
  return true;
}

function getLastDeclaration(
  registrations: readonly ShortcutCommandRegistration[],
  field: DeclarationField,
) {
  for (let index = registrations.length - 1; index >= 0; index -= 1) {
    const registration = registrations[index];
    if (!registration) continue;
    if (field === "keys" && registration.hasKeys) return registration;
    if (field === "onTrigger" && registration.hasOnTrigger) {
      return registration;
    }
    if (field === "scope" && registration.hasScope) return registration;
    if (field === "preventDefault" && registration.hasPreventDefault) {
      return registration;
    }
    if (field === "enabledInTextbox" && registration.hasEnabledInTextbox) {
      return registration;
    }
  }
  return undefined;
}

function getOverride(runtime: ShortcutStoreRuntime, command: string) {
  let current: ShortcutStoreRuntime | undefined = runtime;
  while (current) {
    const keys = current.baseStore.getState().keys;
    if (Object.hasOwn(keys, command)) {
      const value = keys[command];
      if (value == null) {
        return { found: true, parsed: null } as const;
      }
      let parsed = current.parsedOverrides.get(command);
      if (!parsed) {
        parsed = parseShortcutValues(
          value,
          current.store.getState().platform,
          false,
        );
        setParsedOverride(current, command, parsed);
      }
      return { found: true, parsed } as const;
    }
    current = current.parent;
  }
  return { found: false, parsed: undefined } as const;
}

function getNamedKeys(
  runtime: ShortcutStoreRuntime,
  command: string,
  registrations: readonly ShortcutCommandRegistration[],
) {
  const override = getOverride(runtime, command);
  const declaration = getLastDeclaration(registrations, "keys");
  const platform = runtime.store.getState().platform;
  if (override.found) {
    return override.parsed?.[platform] ?? [];
  }
  return declaration?.parsedKeys?.[platform] ?? [];
}

function getCommandKeys(
  runtime: ShortcutStoreRuntime,
  command: string,
  keys: string | null | undefined,
) {
  if (keys === undefined) {
    return getNamedCommandGroup(runtime, command)?.keys ?? [];
  }
  const override = getOverride(runtime, command);
  const platform = runtime.store.getState().platform;
  if (override.found) {
    return override.parsed?.[platform] ?? [];
  }
  if (keys === null) return [];
  return parseShortcutValues(keys, platform)[platform];
}

function getNamedCommandGroup(
  runtime: ShortcutStoreRuntime,
  command: string,
): NamedCommandGroup | undefined {
  const registrations = getCommandRegistrations(runtime, command);
  if (!registrations.length) return;
  const scope = getLastDeclaration(registrations, "scope")?.scope ?? {
    type: "global",
  };
  const onTrigger = getLastDeclaration(registrations, "onTrigger");
  const preventDefault = getLastDeclaration(registrations, "preventDefault");
  const enabledInTextbox = getLastDeclaration(
    registrations,
    "enabledInTextbox",
  );
  const references = registrations.filter(
    (registration) => !!registration.getElement,
  );
  const lastRegistration = registrations.at(-1);
  return {
    command,
    runtime,
    registrations,
    keys: getNamedKeys(runtime, command, registrations),
    order: lastRegistration?.order ?? 0,
    scope,
    onTrigger,
    preventDefault,
    enabledInTextbox,
    references,
  };
}

function isElementConnected(element: Element) {
  if (!("isConnected" in element)) return true;
  return element.isConnected;
}

function isElementDisabled(element: Element) {
  if (!isElementConnected(element)) return true;
  if (
    getComposedAncestors(element).some((ancestor) =>
      ancestor.hasAttribute("inert"),
    )
  ) {
    return true;
  }
  if (disabledFromElement(element)) return true;
  if (
    element.matches("button, input, select, textarea") &&
    isDisabledByFieldset(element)
  ) {
    return true;
  }
  try {
    return element.matches(":disabled");
  } catch (_error) {
    return false;
  }
}

function isDisabledByFieldset(element: Element) {
  let current = element.parentElement;
  while (current) {
    if (current.localName === "fieldset" && current.hasAttribute("disabled")) {
      const firstLegend = [...current.children].find(
        (child) => child.localName === "legend",
      );
      if (!firstLegend?.contains(element)) return true;
    }
    current = current.parentElement;
  }
  return false;
}

function getRegistrationElement(registration: ShortcutCommandRegistration) {
  const element = registration.getElement?.();
  if (!element) return;
  if (isElementDisabled(element)) return;
  return element;
}

function isRegistrationEnabled(registration: ShortcutCommandRegistration) {
  if (registration.enabled === false) return false;
  if (!registration.getElement) return true;
  return !!getRegistrationElement(registration);
}

function isStoreEnabled(runtime: ShortcutStoreRuntime) {
  return runtime.store.getState().enabled;
}

function getNamedAction(group: NamedCommandGroup): CommandAction | undefined {
  if (group.onTrigger) {
    if (isRegistrationEnabled(group.onTrigger)) {
      return { type: "handler", registration: group.onTrigger };
    }
  }
  const references = [...group.references].sort((first, second) => {
    if (first.runtime.depth !== second.runtime.depth) {
      return second.runtime.depth - first.runtime.depth;
    }
    return second.order - first.order;
  });
  for (const registration of references) {
    if (registration.enabled === false) continue;
    const element = getRegistrationElement(registration);
    if (!element) continue;
    return { type: "element", registration, element };
  }
  return undefined;
}

function getUnnamedAction(
  registration: ShortcutCommandRegistration,
): CommandAction | undefined {
  if (!isRegistrationEnabled(registration)) return;
  if (registration.onTrigger) {
    return { type: "handler", registration };
  }
  const element = getRegistrationElement(registration);
  if (!element) return;
  return { type: "element", registration, element };
}

function getPhysicalEventOrigin(event: Event) {
  const path = event.composedPath?.() ?? [];
  let origin = path.find(isElement);
  if (!origin && isElement(event.target)) {
    origin = event.target;
  }
  return origin ?? null;
}

function getEventOrigin(event: Event) {
  return getActiveDescendant(getPhysicalEventOrigin(event));
}

function getActiveDescendant(origin: Element | null) {
  if (!origin) return null;
  const activeDescendant = origin.getAttribute("aria-activedescendant");
  if (!activeDescendant) return origin;
  const root = origin.getRootNode();
  if (!("getElementById" in root)) return origin;
  if (typeof root.getElementById !== "function") return origin;
  return root.getElementById(activeDescendant) ?? origin;
}

function getDeepActiveElement(document: Document) {
  let activeElement = document.activeElement;
  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
}

function getComposedAncestors(origin: Element) {
  const ancestors: Element[] = [];
  let current: Element | null = origin;
  while (current) {
    ancestors.push(current);
    if (current.assignedSlot) {
      current = current.assignedSlot;
      continue;
    }
    if (current.parentElement) {
      current = current.parentElement;
      continue;
    }
    const root = current.getRootNode();
    if (!("host" in root)) break;
    const host = root.host as EventTarget | null;
    current = isElement(host) ? host : null;
  }
  return ancestors;
}

function getScopeRecords(runtime: ShortcutStoreRuntime) {
  const scopes: ShortcutScopeRegistration[] = [];
  for (const member of getRootRuntime(runtime).family) {
    scopes.push(...member.scopes);
  }
  return scopes;
}

function getScopeRecord(
  runtime: ShortcutStoreRuntime,
  id: UnstableShortcutScope,
) {
  const records = getScopeRecords(runtime)
    .filter((record) => record.externalId === id)
    .sort((first, second) => second.order - first.order);
  return records[0];
}

function getScopeTreeDepth(
  runtime: ShortcutStoreRuntime,
  id: UnstableShortcutScope,
) {
  let depth = 1;
  let current = getScopeRecord(runtime, id);
  const seen = new Set<UnstableShortcutScope>();
  while (current?.parent) {
    if (seen.has(current.parent)) break;
    seen.add(current.parent);
    current = getScopeRecord(runtime, current.parent);
    if (!current) break;
    depth += 1;
  }
  return depth;
}

function elementContainsOrigin(
  element: Element,
  origin: Element,
  ancestors: readonly Element[],
) {
  return ancestors.includes(element) || element.contains(origin);
}

function isScopeDescendant(
  runtime: ShortcutStoreRuntime,
  descendant: UnstableShortcutScope,
  ancestor: UnstableShortcutScope,
) {
  let current = getScopeRecord(runtime, descendant);
  const seen = new Set<UnstableShortcutScope>();
  while (current) {
    if (current.externalId === ancestor) return true;
    if (!current.parent) return false;
    if (seen.has(current.parent)) return false;
    seen.add(current.parent);
    current = getScopeRecord(runtime, current.parent);
  }
  return false;
}

function getScopeRecordMatch(
  runtime: ShortcutStoreRuntime,
  record: ShortcutScopeRegistration,
  ancestors: readonly Element[],
  treeDepth = getScopeTreeDepth(runtime, record.externalId),
  order = record.order,
): ScopeMatch {
  const element = record.getElement();
  const index = element ? ancestors.indexOf(element) : -1;
  return {
    scoped: true,
    element,
    distance: index >= 0 ? index : null,
    treeDepth,
    order,
  };
}

function compareScopeMatches(first: ScopeMatch, second: ScopeMatch) {
  if (first.scoped !== second.scoped) {
    return first.scoped ? -1 : 1;
  }
  if (!first.scoped) return 0;
  const firstElement = first.element;
  const secondElement = second.element;
  if (firstElement && secondElement && firstElement !== secondElement) {
    if (elementContainsOrigin(firstElement, secondElement, [])) return 1;
    if (elementContainsOrigin(secondElement, firstElement, [])) return -1;
  }
  if (first.distance != null && second.distance != null) {
    if (first.distance !== second.distance) {
      return first.distance - second.distance;
    }
  } else if (first.distance != null) {
    return -1;
  } else if (second.distance != null) {
    return 1;
  }
  if (first.treeDepth !== second.treeDepth) {
    return second.treeDepth - first.treeDepth;
  }
  return second.order - first.order;
}

function getBestScopeMatch(matches: readonly ScopeMatch[]) {
  return [...matches].sort(compareScopeMatches)[0] ?? null;
}

function getScopeHandleMatch(
  runtime: ShortcutStoreRuntime,
  handle: UnstableShortcutScope,
  origin: Element,
  ancestors: readonly Element[],
) {
  const matches: ScopeMatch[] = [];
  const matchedScopes = new Set<UnstableShortcutScope>();
  const declaration = getScopeRecord(runtime, handle);
  const treeDepth = getScopeTreeDepth(runtime, handle);
  const order = declaration?.order ?? 0;
  const dispatcher = dispatchers.get(origin.ownerDocument);
  for (const activeScope of dispatcher?.activeScopes ?? []) {
    if (!isScopeDescendant(runtime, activeScope, handle)) continue;
    const record = getScopeRecord(runtime, activeScope);
    if (!record) continue;
    matchedScopes.add(record.externalId);
    matches.push(
      getScopeRecordMatch(runtime, record, ancestors, treeDepth, order),
    );
  }
  const scopes = getScopeRecords(runtime);
  for (const scope of scopes) {
    if (matchedScopes.has(scope.externalId)) continue;
    const element = scope.getElement();
    if (!element) continue;
    if (!elementContainsOrigin(element, origin, ancestors)) continue;
    if (!isScopeDescendant(runtime, scope.externalId, handle)) continue;
    matches.push(
      getScopeRecordMatch(runtime, scope, ancestors, treeDepth, order),
    );
  }
  return getBestScopeMatch(matches);
}

function isElementRef(value: object): value is ShortcutElementRef {
  return "current" in value;
}

function isScopeElement(ref: ShortcutScopeRef): ref is Element {
  return isElement(ref as Element);
}

function resolveScopeRef(ref: ShortcutScopeRef) {
  if (isScopeElement(ref)) return ref;
  return ref.current;
}

function getScopeRefMatch(
  runtime: ShortcutStoreRuntime,
  ref: ShortcutScopeRef,
  origin: Element,
  ancestors: readonly Element[],
) {
  const element = resolveScopeRef(ref);
  if (!element) return null;
  const registered = getScopeRecords(runtime)
    .filter((scope) => scope.getElement() === element)
    .sort((first, second) => second.order - first.order)[0];
  if (registered) {
    return getScopeHandleMatch(
      runtime,
      registered.externalId,
      origin,
      ancestors,
    );
  }
  if (!elementContainsOrigin(element, origin, ancestors)) return null;
  const index = ancestors.indexOf(element);
  return {
    scoped: true,
    element,
    distance: index >= 0 ? index : null,
    treeDepth: 0,
    order: 0,
  };
}

function getScopeMatch(
  runtime: ShortcutStoreRuntime,
  scope: ScopeDeclaration,
  origin: Element | null,
) {
  if (scope.type === "global") {
    return {
      scoped: false,
      element: null,
      distance: null,
      treeDepth: 0,
      order: 0,
    };
  }
  if (!origin) return null;
  if (origin === origin.ownerDocument.body) return null;
  const ancestors = getComposedAncestors(origin);
  const matches: ScopeMatch[] = [];
  if (scope.type === "handles") {
    for (const handle of scope.handles) {
      const match = getScopeHandleMatch(runtime, handle, origin, ancestors);
      if (match) matches.push(match);
    }
    return getBestScopeMatch(matches);
  }
  for (const ref of scope.refs) {
    const match = getScopeRefMatch(runtime, ref, origin, ancestors);
    if (match) matches.push(match);
  }
  return getBestScopeMatch(matches);
}

const textEntryInputTypes = new Set([
  "email",
  "number",
  "password",
  "search",
  "tel",
  "text",
  "url",
]);

function isTextbox(element: Element) {
  if (element.localName === "textarea") return true;
  if (element.localName === "input") {
    const input = element as HTMLInputElement;
    if (textEntryInputTypes.has(input.type.toLowerCase())) return true;
  }
  if (!("isContentEditable" in element)) return false;
  return element.isContentEditable === true;
}

function isPrintableKey(keys: string) {
  const key = keys.split("+").at(-1);
  if (!key) return false;
  if (key === "Space" || key === "Plus") return true;
  return Array.from(key).length === 1;
}

function isEnabledInTextboxByDefault(keys: string, platform: ShortcutPlatform) {
  if (!isPrintableKey(keys)) return true;
  if (keys.includes("Control+")) return true;
  if (keys.includes("Meta+")) return true;
  if (platform !== "apple" && keys.includes("Alt+")) return true;
  return false;
}

function evaluateBoolean(
  value: BooleanOrCallback<ShortcutEvent> | undefined,
  event: ShortcutEvent,
  defaultValue: boolean,
) {
  if (typeof value === "function") return value(event);
  return value ?? defaultValue;
}

function getCommandEvent(
  candidate: DispatchCandidate,
  originalEvent: KeyboardEvent,
  target: Element | null,
): ShortcutKeyboardEvent {
  return {
    source: "keyboard",
    command: candidate.command,
    keys: candidate.keys,
    target,
    originalEvent,
  };
}

function compareCandidates(
  first: DispatchCandidate,
  second: DispatchCandidate,
) {
  const scopeOrder = compareScopeMatches(first.scopeMatch, second.scopeMatch);
  if (scopeOrder) return scopeOrder;
  if (first.storeDepth !== second.storeDepth) {
    return second.storeDepth - first.storeDepth;
  }
  return second.order - first.order;
}

function runtimeClaimsCommand(runtime: ShortcutStoreRuntime, command: string) {
  if (runtime.commandRegistrations.has(command)) return true;
  return Object.hasOwn(runtime.baseStore.getState().keys, command);
}

function getMatchingCommands(runtime: ShortcutStoreRuntime, lookup: string) {
  const commands = new Set<string>();
  const platform = runtime.store.getState().platform;
  // Raw declarations stay indexed. Group resolution filters a match when a
  // later declaration or override wins for the same command.
  for (const member of getRuntimeChain(runtime)) {
    const registrations = member.registrationsByKey[platform].get(lookup);
    for (const registration of registrations ?? []) {
      if (registration.command) {
        commands.add(registration.command);
      }
    }
    const overrides = member.overridesByKey[platform].get(lookup);
    for (const command of overrides ?? []) {
      commands.add(command);
    }
  }
  return commands;
}

function collectNamedCandidates(
  runtime: ShortcutStoreRuntime,
  lookup: string,
  origin: Element | null,
) {
  const candidates: DispatchCandidate[] = [];
  for (const command of getMatchingCommands(runtime, lookup)) {
    if (!runtimeClaimsCommand(runtime, command)) continue;
    const group = getNamedCommandGroup(runtime, command);
    if (!group) continue;
    if (!group.keys.includes(lookup)) continue;
    if (!isStoreEnabled(runtime)) continue;
    const scopeMatch = getScopeMatch(runtime, group.scope, origin);
    if (!scopeMatch) continue;
    const action = getNamedAction(group);
    if (!action) continue;
    let shadowed = false;
    for (const descendant of getRootRuntime(runtime).family) {
      if (descendant === runtime) continue;
      if (!isRuntimeAncestor(runtime, descendant)) continue;
      if (!runtimeClaimsCommand(descendant, command)) continue;
      if (!isStoreEnabled(descendant)) continue;
      const descendantGroup = getNamedCommandGroup(descendant, command);
      if (!descendantGroup) continue;
      const descendantScopeMatch = getScopeMatch(
        descendant,
        descendantGroup.scope,
        origin,
      );
      if (!descendantScopeMatch) continue;
      if (!getNamedAction(descendantGroup)) continue;
      shadowed = true;
      break;
    }
    if (shadowed) continue;
    candidates.push({
      action,
      command,
      keys: lookup,
      order: Math.max(group.order, action.registration.order),
      scopeMatch,
      storeDepth: runtime.depth,
      runtime,
      preventDefault: group.preventDefault,
      enabledInTextbox: group.enabledInTextbox,
    });
  }
  return candidates;
}

function collectUnnamedCandidates(
  runtime: ShortcutStoreRuntime,
  lookup: string,
  origin: Element | null,
) {
  const candidates: DispatchCandidate[] = [];
  const platform = runtime.store.getState().platform;
  const registrations = runtime.registrationsByKey[platform].get(lookup);
  for (const registration of registrations ?? []) {
    if (registration.command) continue;
    if (!registration.hasKeys) continue;
    if (registration.keys == null) continue;
    if (!isStoreEnabled(runtime)) continue;
    const scopeMatch = getScopeMatch(runtime, registration.scope, origin);
    if (!scopeMatch) continue;
    const action = getUnnamedAction(registration);
    if (!action) continue;
    candidates.push({
      action,
      keys: lookup,
      order: registration.order,
      scopeMatch,
      storeDepth: runtime.depth,
      runtime,
      preventDefault: registration.hasPreventDefault ? registration : undefined,
      enabledInTextbox: registration.hasEnabledInTextbox
        ? registration
        : undefined,
    });
  }
  return candidates;
}

function getDispatcherRuntimes(dispatcher: DocumentDispatcher) {
  const runtimes = new Set<ShortcutStoreRuntime>();
  for (const root of dispatcher.roots.keys()) {
    for (const runtime of root.family) {
      runtimes.add(runtime);
    }
  }
  return runtimes;
}

function collectCandidates(
  dispatcher: DocumentDispatcher,
  lookup: string,
  origin: Element | null,
) {
  const candidates: DispatchCandidate[] = [];
  for (const runtime of getDispatcherRuntimes(dispatcher)) {
    candidates.push(...collectNamedCandidates(runtime, lookup, origin));
    candidates.push(...collectUnnamedCandidates(runtime, lookup, origin));
  }
  return candidates.sort(compareCandidates);
}

function getEventSignature(event: KeyboardEvent, lookups: readonly string[]) {
  return [
    event.type,
    event.code,
    event.key,
    event.ctrlKey ? "1" : "0",
    event.altKey ? "1" : "0",
    event.shiftKey ? "1" : "0",
    event.metaKey ? "1" : "0",
    lookups.join("|"),
  ].join(":");
}

function clearDispatcherSignatures(dispatcher: DocumentDispatcher) {
  if (dispatcher.clearSignaturesTimer != null) return;
  dispatcher.clearSignaturesTimer = setTimeout(() => {
    dispatcher.handledSignatures.clear();
    dispatcher.clearSignaturesTimer = undefined;
  }, 0);
}

function fireShortcutClick(element: Element) {
  syntheticClickElements.push(element);
  try {
    fireClickEvent(element, { bubbles: true, cancelable: true });
  } finally {
    syntheticClickElements.pop();
  }
}

function runCandidate(
  candidate: DispatchCandidate,
  event: ShortcutKeyboardEvent,
) {
  if (candidate.action.type === "handler") {
    return candidate.action.registration.onTrigger?.(event) !== false;
  }
  const element = candidate.action.element;
  if (!element) return false;
  fireShortcutClick(element);
  return true;
}

function dispatchKeyboardEvent(
  dispatcher: DocumentDispatcher,
  originalEvent: KeyboardEvent,
) {
  if (dispatcher.handledEvents.has(originalEvent)) return;
  const lookups = getShortcutEventKeys(originalEvent);
  if (!lookups.length) return;
  const signature = getEventSignature(originalEvent, lookups);
  if (dispatcher.handledSignatures.has(signature)) return;
  const physicalOrigin = getPhysicalEventOrigin(originalEvent);
  const origin = getActiveDescendant(physicalOrigin);
  const path = originalEvent.composedPath?.() ?? [];
  const recording = path.some(
    (item) => isElement(item) && item.hasAttribute("data-shortcut-recording"),
  );
  if (recording) return;
  const attemptedActions = new Set<ShortcutCommandRegistration>();
  for (const lookup of lookups) {
    const candidates = collectCandidates(dispatcher, lookup, origin);
    for (const candidate of candidates) {
      const registration = candidate.action.registration;
      if (attemptedActions.has(registration)) continue;
      const event = getCommandEvent(candidate, originalEvent, origin);
      if (physicalOrigin && isTextbox(physicalOrigin)) {
        const configured = candidate.enabledInTextbox;
        const enabled = evaluateBoolean(
          configured?.enabledInTextbox,
          event,
          isEnabledInTextboxByDefault(
            lookup,
            candidate.runtime.store.getState().platform,
          ),
        );
        if (!enabled) continue;
      }
      attemptedActions.add(registration);
      if (!runCandidate(candidate, event)) continue;
      dispatcher.handledEvents.add(originalEvent);
      dispatcher.handledSignatures.add(signature);
      clearDispatcherSignatures(dispatcher);
      const shouldPreventDefault = evaluateBoolean(
        candidate.preventDefault?.preventDefault,
        event,
        true,
      );
      if (shouldPreventDefault) {
        originalEvent.preventDefault();
      }
      return;
    }
  }
}

function notifyDispatcherRoots(dispatcher: DocumentDispatcher) {
  for (const root of dispatcher.roots.keys()) {
    notifyFamily(root);
  }
}

function observeFocusedElement(dispatcher: DocumentDispatcher) {
  const observer = dispatcher.observer;
  if (!observer) return;
  observer.disconnect();
  const element = dispatcher.focusedElement;
  if (!element) return;
  observer.observe(element, {
    attributes: true,
    attributeFilter: ["aria-activedescendant"],
  });
}

function createDocumentDispatcher(document: Document): DocumentDispatcher {
  const dispatcher: DocumentDispatcher = {
    document,
    roots: new Map(),
    handledEvents: new WeakSet(),
    handledSignatures: new Set(),
    activeScopes: new Set(activeScopesByDocument.get(document) ?? []),
    focusedElement: getDeepActiveElement(document),
    focusEpoch: 0,
    dispose: () => {},
  };
  const onKeyDown = (event: KeyboardEvent) => {
    dispatchKeyboardEvent(dispatcher, event);
  };
  const onFocusIn = (event: FocusEvent) => {
    dispatcher.focusEpoch += 1;
    dispatcher.focusedElement = getPhysicalEventOrigin(event);
    observeFocusedElement(dispatcher);
    notifyDispatcherRoots(dispatcher);
  };
  const onFocusOut = () => {
    const epoch = ++dispatcher.focusEpoch;
    queueMicrotask(() => {
      if (epoch !== dispatcher.focusEpoch) return;
      dispatcher.focusedElement = getDeepActiveElement(document);
      observeFocusedElement(dispatcher);
      notifyDispatcherRoots(dispatcher);
    });
  };
  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("focusin", onFocusIn, true);
  document.addEventListener("focusout", onFocusOut, true);
  const MutationObserverConstructor = document.defaultView?.MutationObserver;
  if (MutationObserverConstructor) {
    dispatcher.observer = new MutationObserverConstructor(() => {
      notifyDispatcherRoots(dispatcher);
    });
    observeFocusedElement(dispatcher);
  }
  dispatcher.dispose = () => {
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("focusin", onFocusIn, true);
    document.removeEventListener("focusout", onFocusOut, true);
    dispatcher.observer?.disconnect();
    if (dispatcher.clearSignaturesTimer != null) {
      clearTimeout(dispatcher.clearSignaturesTimer);
    }
  };
  return dispatcher;
}

function retainDocument(runtime: ShortcutStoreRuntime, document: Document) {
  let dispatcher = dispatchers.get(document);
  if (!dispatcher) {
    dispatcher = createDocumentDispatcher(document);
    dispatchers.set(document, dispatcher);
  }
  const root = getRootRuntime(runtime);
  dispatcher.roots.set(root, (dispatcher.roots.get(root) ?? 0) + 1);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    const count = dispatcher?.roots.get(root) ?? 0;
    if (count > 1) {
      dispatcher?.roots.set(root, count - 1);
      return;
    }
    dispatcher?.roots.delete(root);
    if (dispatcher?.roots.size) return;
    dispatcher?.dispose();
    dispatchers.delete(document);
  };
}

function retainDefaultDocument(runtime: ShortcutStoreRuntime) {
  runtime.liveRegistrations += 1;
  if (runtime.releaseDefaultDocument) return;
  if (!canUseDOM) return;
  runtime.releaseDefaultDocument = retainDocument(runtime, document);
}

function releaseDefaultDocument(runtime: ShortcutStoreRuntime) {
  runtime.liveRegistrations -= 1;
  if (runtime.liveRegistrations > 0) return;
  runtime.liveRegistrations = 0;
  runtime.releaseDefaultDocument?.();
  runtime.releaseDefaultDocument = undefined;
}

function getScopeDeclaration(options: ShortcutCommandOptions) {
  if (options.unstable_scope !== undefined) {
    const value = options.unstable_scope;
    if (value === null) {
      return { hasScope: true, scope: { type: "global" } } as const;
    }
    const handles = [...new Set(Array.isArray(value) ? value : [value])];
    return {
      hasScope: true,
      scope: { type: "handles", handles } as HandleScopeDeclaration,
    } as const;
  }
  if (options.scope === undefined) {
    return { hasScope: false, scope: { type: "global" } } as const;
  }
  if (options.scope === null) {
    return { hasScope: true, scope: { type: "global" } } as const;
  }
  const refs = [
    ...new Set(Array.isArray(options.scope) ? options.scope : [options.scope]),
  ];
  return {
    hasScope: true,
    scope: { type: "refs", refs } as RefScopeDeclaration,
  } as const;
}

function getDeclarationValue(
  registration: ShortcutCommandRegistration,
  field: DeclarationField,
) {
  if (field === "keys") return registration.keys;
  if (field === "onTrigger") return registration.onTrigger;
  if (field === "scope") return registration.scope;
  if (field === "preventDefault") return registration.preventDefault;
  return registration.enabledInTextbox;
}

function hasDeclaration(
  registration: ShortcutCommandRegistration,
  field: DeclarationField,
) {
  if (field === "keys") return registration.hasKeys;
  if (field === "onTrigger") return registration.hasOnTrigger;
  if (field === "scope") return registration.hasScope;
  if (field === "preventDefault") return registration.hasPreventDefault;
  return registration.hasEnabledInTextbox;
}

function areArraysEqual(first: readonly unknown[], second: readonly unknown[]) {
  if (first.length !== second.length) return false;
  return first.every((value, index) => Object.is(value, second[index]));
}

function areIdentitySetsEqual(
  first: readonly unknown[],
  second: readonly unknown[],
) {
  const firstSet = new Set(first);
  const secondSet = new Set(second);
  if (firstSet.size !== secondSet.size) return false;
  for (const value of firstSet) {
    if (!secondSet.has(value)) return false;
  }
  return true;
}

function areScopeDeclarationsEqual(
  first: ScopeDeclaration,
  second: ScopeDeclaration,
) {
  if (first.type !== second.type) return false;
  if (first.type === "global" || second.type === "global") return true;
  if (first.type === "handles" && second.type === "handles") {
    return areIdentitySetsEqual(first.handles, second.handles);
  }
  if (first.type === "refs" && second.type === "refs") {
    return areIdentitySetsEqual(first.refs, second.refs);
  }
  return false;
}

function areDeclarationsEqual(
  field: DeclarationField,
  first: ShortcutCommandRegistration,
  second: ShortcutCommandRegistration,
) {
  if (field === "scope") {
    return areScopeDeclarationsEqual(first.scope, second.scope);
  }
  const firstValue = getDeclarationValue(first, field);
  const secondValue = getDeclarationValue(second, field);
  if (field === "keys" && typeof firstValue === "string") {
    if (typeof secondValue !== "string") return false;
    return shortcutPlatforms.every((platform) =>
      areArraysEqual(
        first.parsedKeys?.[platform] ?? [],
        second.parsedKeys?.[platform] ?? [],
      ),
    );
  }
  return Object.is(firstValue, secondValue);
}

function warnAboutConflictingDeclarations(
  registration: ShortcutCommandRegistration,
  runtimes: Iterable<ShortcutStoreRuntime> = registration.runtime.active
    ? getNotifiedRuntimes(registration.runtime)
    : [registration.runtime],
  warnedFields?: Set<DeclarationField>,
) {
  const command = registration.command;
  if (!command) return;
  const fields: DeclarationField[] = [
    "keys",
    "onTrigger",
    "scope",
    "preventDefault",
    "enabledInTextbox",
  ];
  for (const field of fields) {
    if (warnedFields?.has(field)) continue;
    let conflict = false;
    for (const runtime of runtimes) {
      if (!areRuntimesRelated(runtime, registration.runtime)) continue;
      for (const existing of runtime.commandRegistrations.get(command) ?? []) {
        if (!hasDeclaration(existing, field)) continue;
        if (!hasDeclaration(registration, field)) continue;
        if (areDeclarationsEqual(field, existing, registration)) continue;
        conflict = true;
        break;
      }
      if (conflict) break;
    }
    if (!conflict) continue;
    warnedFields?.add(field);
    warn(
      `The "${command}" shortcut command has different concurrent ` +
        `declarations for "${field}". The last registration wins.`,
    );
  }
}

function warnAboutActiveRuntimeConflicts(runtime: ShortcutStoreRuntime) {
  const activeRuntimes: ShortcutStoreRuntime[] = [];
  for (const member of getRootRuntime(runtime).family) {
    if (member === runtime) continue;
    if (!areRuntimesRelated(member, runtime)) continue;
    activeRuntimes.push(member);
  }
  if (!activeRuntimes.length) return;
  for (const registrations of runtime.commandRegistrations.values()) {
    const warnedFields = new Set<DeclarationField>();
    for (const registration of registrations) {
      warnAboutConflictingDeclarations(
        registration,
        activeRuntimes,
        warnedFields,
      );
    }
  }
}

function getRegistrationByExternalId(
  runtime: ShortcutStoreRuntime,
  id: object,
) {
  const registrations: ShortcutCommandRegistration[] = [];
  for (const member of getRootRuntime(runtime).family) {
    for (const registration of member.commands) {
      if (registration.externalId !== id) continue;
      registrations.push(registration);
    }
  }
  registrations.sort((first, second) => second.order - first.order);
  return registrations[0];
}

function getCurrentOrigin(element?: Element | null) {
  const document =
    element?.ownerDocument ?? (canUseDOM ? window.document : null);
  if (!document) return null;
  const dispatcher = dispatchers.get(document);
  const origin = dispatcher?.focusedElement ?? getDeepActiveElement(document);
  return getActiveDescendant(isElement(origin) ? origin : null);
}

function getCommandState(
  runtime: ShortcutStoreRuntime,
  id: object,
  origin?: Element | null,
): UnstableShortcutCommandState | undefined {
  const registration = getRegistrationByExternalId(runtime, id);
  if (!registration) return;
  if (!registration.command) {
    const platform = registration.runtime.store.getState().platform;
    const keys = registration.parsedKeys?.[platform] ?? [];
    const action = getUnnamedAction(registration);
    const currentOrigin =
      origin === undefined
        ? getCurrentOrigin(registration.getElement?.())
        : origin;
    const inScope =
      getScopeMatch(registration.runtime, registration.scope, currentOrigin) !=
      null;
    const enabled =
      isStoreEnabled(registration.runtime) &&
      !!action &&
      registration.enabled !== false;
    return {
      keys,
      enabled,
      inScope,
      ariaKeyShortcuts: enabled ? keys[0] : undefined,
    };
  }
  const group = getNamedCommandGroup(
    registration.runtime,
    registration.command,
  );
  if (!group) return;
  const action = getNamedAction(group);
  const currentOrigin =
    origin === undefined
      ? getCurrentOrigin(registration.getElement?.())
      : origin;
  const inScope =
    getScopeMatch(registration.runtime, group.scope, currentOrigin) != null;
  const enabled =
    isStoreEnabled(registration.runtime) &&
    registration.enabled !== false &&
    (!registration.getElement || !!getRegistrationElement(registration)) &&
    !!action;
  return {
    command: registration.command,
    keys: group.keys,
    enabled,
    inScope,
    ariaKeyShortcuts: enabled ? group.keys[0] : undefined,
  };
}

function getNamedCommandState(
  runtime: ShortcutStoreRuntime,
  command: string,
  origin?: Element | null,
): UnstableShortcutCommandState | undefined {
  const group = getNamedCommandGroup(runtime, command);
  if (!group) return;
  const currentOrigin = origin === undefined ? getCurrentOrigin() : origin;
  const action = getNamedAction(group);
  const enabled = isStoreEnabled(runtime) && !!action;
  return {
    command,
    keys: group.keys,
    enabled,
    inScope: getScopeMatch(runtime, group.scope, currentOrigin) != null,
    ariaKeyShortcuts: enabled ? group.keys[0] : undefined,
  };
}

function isSyntheticClick(event: Event) {
  if (!syntheticClickElements.length) return false;
  const path = event.composedPath?.() ?? [];
  return syntheticClickElements.some(
    (element) => path.includes(element) || event.target === element,
  );
}

/**
 * Creates a framework-agnostic shortcut store.
 *
 * The store merges named command declarations along its ancestry, arbitrates
 * every live store through one capture listener per document, and works
 * without React.
 * @example
 * const store = createShortcutStore({ platform: "apple" });
 * const unregister = store.registerCommand({
 *   command: "save",
 *   keys: "mod+S",
 *   onTrigger: save,
 * });
 */
export function createShortcutStore(
  props: ShortcutStoreProps = {},
): ShortcutStore {
  if (props.store) return props.store;

  const parent = getRuntime(props.unstable_parent);
  const platform =
    props.platform ??
    parent?.store.getState().platform ??
    getShortcutPlatform();
  const initialState: ShortcutStoreState = {
    enabled: props.enabled ?? true,
    platform,
    glyphs:
      props.glyphs ??
      parent?.store.getState().glyphs ??
      getDefaultShortcutGlyphs(platform),
    keyNames:
      props.keyNames ??
      parent?.store.getState().keyNames ??
      getDefaultShortcutKeyNames(platform),
    keys: props.keys ?? {},
  };
  const baseStore = createStore(initialState);
  const publicStore = createStore(initialState);
  const parsedOverrides = parseShortcutOverrides(initialState.keys, platform);
  let runtime: ShortcutStoreRuntime;

  const getState = () => getRuntimeState(runtime);
  const setState: Store<ShortcutStoreState>["setState"] = (key, value) => {
    const previousValue = runtime.store.getState()[key];
    const previousLocalValue = baseStore.getState()[key];
    const nextValue = applyState(value, previousValue);
    let explicitChanged = false;
    if (key === "platform") {
      explicitChanged = !runtime.explicitState.platform;
      runtime.explicitState.platform = true;
    } else if (key === "glyphs") {
      explicitChanged = !runtime.explicitState.glyphs;
      runtime.explicitState.glyphs = true;
    } else if (key === "keyNames") {
      explicitChanged = !runtime.explicitState.keyNames;
      runtime.explicitState.keyNames = true;
    }
    const stateChanged = !Object.is(previousLocalValue, nextValue);
    if (!explicitChanged && !stateChanged) return;
    if (stateChanged) {
      baseStore.setState(key, nextValue);
      if (key === "keys") {
        const overrides = parseShortcutOverrides(
          baseStore.getState().keys,
          runtime.store.getState().platform,
        );
        runtime.parsedOverrides = overrides;
        runtime.overridesByKey = createShortcutOverrideIndex(overrides);
      }
    }
    notifyFamily(runtime);
  };

  const registerCommand: ShortcutStoreFunctions["registerCommand"] = (
    options,
  ) => {
    const scope = getScopeDeclaration(options);
    const hasKeys = options.keys !== undefined;
    const parsedKeys =
      typeof options.keys === "string"
        ? parseShortcutValues(options.keys, runtime.store.getState().platform)
        : undefined;
    const registration: ShortcutCommandRegistration = {
      id: Symbol(),
      externalId: options.unstable_id ?? {},
      runtime,
      order: ++registrationOrder,
      command: options.command,
      keys: options.keys,
      parsedKeys,
      hasKeys,
      onTrigger: options.onTrigger,
      hasOnTrigger: options.onTrigger !== undefined,
      preventDefault: options.preventDefault,
      hasPreventDefault: options.preventDefault !== undefined,
      scope: scope.scope,
      hasScope: scope.hasScope,
      enabled: options.enabled,
      enabledInTextbox: options.enabledInTextbox,
      hasEnabledInTextbox: options.enabledInTextbox !== undefined,
      getElement: options.unstable_getElement,
    };
    warnAboutConflictingDeclarations(registration);
    addCommandRegistration(runtime, registration);
    retainDefaultDocument(runtime);
    notifyFamily(runtime);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      if (!removeCommandRegistration(runtime, registration)) return;
      releaseDefaultDocument(runtime);
      notifyFamily(runtime);
    };
  };

  const registerScope: ShortcutStoreFunctions["registerScope"] = (options) => {
    const externalId = options.unstable_id ?? {};
    const registration: ShortcutScopeRegistration = {
      id: Symbol(),
      externalId,
      runtime,
      order: ++registrationOrder,
      getElement: options.unstable_getElement ?? (() => null),
      parent: options.unstable_parent ?? null,
    };
    runtime.scopes.add(registration);
    retainDefaultDocument(runtime);
    notifyFamily(runtime);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      if (!runtime.scopes.delete(registration)) return;
      releaseDefaultDocument(runtime);
      notifyFamily(runtime);
    };
  };

  const setKeys: ShortcutStoreFunctions["setKeys"] = (command, keys) => {
    const parsed =
      typeof keys === "string"
        ? parseShortcutValues(keys, runtime.store.getState().platform)
        : null;
    const current = runtime.baseStore.getState().keys;
    const next = { ...current };
    if (keys === undefined) {
      delete next[command];
    } else if (command === "__proto__") {
      Object.defineProperty(next, command, {
        configurable: true,
        enumerable: true,
        value: keys,
        writable: true,
      });
    } else {
      next[command] = keys;
    }
    setParsedOverride(
      runtime,
      command,
      keys === undefined ? undefined : parsed,
    );
    runtime.baseStore.setState("keys", next);
    notifyFamily(runtime);
  };

  const getKeys: ShortcutStoreFunctions["getKeys"] = (command) => {
    const group = getNamedCommandGroup(runtime, command);
    return group?.keys ?? [];
  };

  const trigger: ShortcutStoreFunctions["trigger"] = (command) => {
    const group = getNamedCommandGroup(runtime, command);
    if (!group) return false;
    if (!isStoreEnabled(runtime)) return false;
    const action = getNamedAction(group);
    if (!action) return false;
    const event: ShortcutProgrammaticEvent = {
      source: "programmatic",
      command,
      keys: group.keys[0] ?? "",
      target: null,
      originalEvent: undefined,
    };
    if (action.type === "handler") {
      return action.registration.onTrigger?.(event) !== false;
    }
    const element = action.element;
    if (!element) return false;
    fireShortcutClick(element);
    return true;
  };

  const attach: ShortcutStoreFunctions["attach"] = (document) =>
    retainDocument(runtime, document);

  const formatKeys: ShortcutStoreFunctions["formatKeys"] = (keys, options) => {
    return formatShortcutKeys(keys, getFormatOptions(runtime, options)).text;
  };

  const unstableGetKeyTokens: ShortcutStoreFunctions["unstable_getKeyTokens"] =
    (keys, options) => {
      return formatShortcutKeys(keys, getFormatOptions(runtime, options))
        .alternatives;
    };

  const store: ShortcutStore = {
    ...publicStore,
    getState,
    setState,
    registerCommand,
    registerScope,
    setEnabled: (enabled) => setState("enabled", enabled),
    setKeys,
    trigger,
    getKeys,
    attach,
    formatKeys,
    unstable_parent: props.unstable_parent,
    get unstable_hasExplicitPlatform() {
      return runtime.explicitState.platform;
    },
    unstable_getRegistryVersion: () => runtime.revision,
    unstable_subscribeRegistry: (listener) => {
      runtime.listeners.add(listener);
      return () => runtime.listeners.delete(listener);
    },
    unstable_getCommandState: (id, origin) =>
      getCommandState(runtime, id, origin),
    unstable_getNamedCommandState: (command, origin) =>
      getNamedCommandState(runtime, command, origin),
    unstable_getCommandKeys: (command, keys) =>
      getCommandKeys(runtime, command, keys),
    unstable_isScopeActive: (scope, origin) => {
      const currentOrigin = origin === undefined ? getCurrentOrigin() : origin;
      if (scope === null) return true;
      const values = Array.isArray(scope) ? scope : [scope];
      if (!values.length) return false;
      const records = getScopeRecords(runtime);
      const handles: UnstableShortcutScope[] = [];
      const refs: ShortcutScopeRef[] = [];
      for (const value of values) {
        if (records.some((record) => record.externalId === value)) {
          handles.push(value);
        } else if (isElement(value) || isElementRef(value)) {
          refs.push(value);
        }
      }
      const handleDepth = handles.length
        ? getScopeMatch(runtime, { type: "handles", handles }, currentOrigin)
        : null;
      const refDepth = refs.length
        ? getScopeMatch(runtime, { type: "refs", refs }, currentOrigin)
        : null;
      return handleDepth != null || refDepth != null;
    },
    unstable_triggerCommand: (id, originalEvent) => {
      if (isSyntheticClick(originalEvent)) return false;
      if (bridgedClickEvents.has(originalEvent)) return false;
      const registration = getRegistrationByExternalId(runtime, id);
      if (!registration) return false;
      if (!isRegistrationEnabled(registration)) return false;
      if (!isStoreEnabled(registration.runtime)) return false;
      const target = getEventOrigin(originalEvent);
      if (!registration.command) {
        if (!registration.onTrigger) return false;
        if (
          getScopeMatch(registration.runtime, registration.scope, target) ==
          null
        ) {
          return false;
        }
        const platform = registration.runtime.store.getState().platform;
        const keys = registration.parsedKeys?.[platform][0] ?? "";
        const event: ShortcutClickEvent = {
          source: "click",
          keys,
          target,
          originalEvent,
        };
        if (registration.onTrigger(event) === false) return false;
        bridgedClickEvents.add(originalEvent);
        return true;
      }
      const group = getNamedCommandGroup(
        registration.runtime,
        registration.command,
      );
      if (!group?.onTrigger) return false;
      if (!isRegistrationEnabled(group.onTrigger)) return false;
      if (getScopeMatch(registration.runtime, group.scope, target) == null) {
        return false;
      }
      const event: ShortcutClickEvent = {
        source: "click",
        command: registration.command,
        keys: group.keys[0] ?? "",
        target,
        originalEvent,
      };
      const result = group.onTrigger.onTrigger?.(event);
      if (result === false) return false;
      bridgedClickEvents.add(originalEvent);
      return true;
    },
    unstable_isSyntheticClick: isSyntheticClick,
    unstable_getKeyTokens: unstableGetKeyTokens,
    unstable_getEventKeys: (event) => getShortcutEventKeys(event)[0] ?? null,
    unstable_getStore: () => store,
    unstable_dispose: () => deactivateRuntime(runtime),
    unstable_setActiveScope: (scope, document) => {
      let activeScopes = activeScopesByDocument.get(document);
      if (!activeScopes) {
        activeScopes = new Set();
        activeScopesByDocument.set(document, activeScopes);
      }
      activeScopes.add(scope);
      const dispatcher = dispatchers.get(document);
      if (!dispatcher) return;
      if (dispatcher.activeScopes.has(scope)) return;
      dispatcher.activeScopes.add(scope);
      notifyDispatcherRoots(dispatcher);
    },
    unstable_clearActiveScope: (scope, document) => {
      const activeScopes = activeScopesByDocument.get(document);
      activeScopes?.delete(scope);
      if (!activeScopes?.size) {
        activeScopesByDocument.delete(document);
      }
      const dispatcher = dispatchers.get(document);
      if (!dispatcher?.activeScopes.delete(scope)) return;
      notifyDispatcherRoots(dispatcher);
    },
  };

  const root = parent ? getRootRuntime(parent) : undefined;
  const active = !root || !props.unstable_deferActivation;
  runtime = {
    store,
    baseStore,
    publicStore,
    parent,
    root,
    family: root?.family ?? new Set(),
    active,
    depth: (parent?.depth ?? -1) + 1,
    commands: new Set(),
    commandRegistrations: new Map(),
    registrationsByKey: createShortcutKeyIndex(),
    overridesByKey: createShortcutOverrideIndex(parsedOverrides),
    scopes: new Set(),
    listeners: new Set(),
    revision: 0,
    liveRegistrations: 0,
    parsedOverrides,
    explicitState: {
      platform: props.platform !== undefined,
      glyphs: props.glyphs !== undefined,
      keyNames: props.keyNames !== undefined,
    },
  };
  if (!root) {
    runtime.family = new Set([runtime]);
  } else if (active) {
    runtime.family.add(runtime);
  }
  runtimes.set(store, runtime);
  syncPublicState(runtime);
  setup(publicStore, () => {
    activateRuntime(runtime);
    return () => store.unstable_dispose();
  });
  return store;
}

let globalShortcutStore: ShortcutStore | undefined;

/**
 * Returns the shared shortcut store used when no framework provider exists.
 * @private
 */
export function unstable_getGlobalShortcutStore() {
  globalShortcutStore ??= createShortcutStore();
  return globalShortcutStore;
}
