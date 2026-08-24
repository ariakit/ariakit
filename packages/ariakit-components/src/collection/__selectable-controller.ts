import {
  isAdditiveSelectionEvent,
  isNonContiguousSelectionEvent,
  isRangeSelectionEvent,
  isVirtualClick,
  warnOnce,
} from "@ariakit/utils";
import type { CollectionStore } from "./collection-store.ts";

export type SelectableMode = "none" | "single" | "multiple";

export type SelectableBehavior = "toggle" | "replace";

/**
 * Supplies complete selection geometry for a collection. Delegate answers are
 * authoritative and are not filtered through the mounted opt-in registry.
 * Returning `null` refuses an operation that cannot be resolved safely.
 */
export interface SelectableRangeDelegate {
  /** Keys from `fromId` to `toId`, inclusive, in logical order. */
  getKeysInRange(fromId: string, toId: string): readonly string[] | null;
  /** Every eligible key in the collection, in logical order. */
  getOrderedKeys(): readonly string[] | null;
}

export interface SelectableEvent extends Pick<
  MouseEvent,
  "ctrlKey" | "detail" | "metaKey" | "shiftKey"
> {
  nativeEvent?: Event;
  pointerType?: string;
}

export interface SelectableControllerOptions {
  collection: Pick<CollectionStore, "getState" | "item">;
  getBehavior(): SelectableBehavior;
  /** Returns the current composite cursor when a stored range anchor is gone. */
  getCursorId(): string | null | undefined;
  getKeys(): readonly string[];
  getMode(): SelectableMode;
  getSelectionKey(id: string): string | null | undefined;
  rangeDelegate?: SelectableRangeDelegate | null;
  requireOptIn: boolean;
  resolveTarget?(id: string): string;
  setKeys(keys: readonly string[]): void;
  subscribeKeys(listener: (keys: readonly string[]) => void): () => void;
}

export interface SelectableController {
  getMode(): SelectableMode;
  isSelected(id: string): boolean;
  isSelectable(id: string): boolean;
  hasOptIn(id: string): boolean;
  isOptedIn(id: string): boolean;
  isIgnored(event: SelectableEvent): boolean;
  select(id: string): void;
  deselect(id: string): void;
  toggle(id: string): void;
  ignore(event: SelectableEvent): void;
  activate(id: string, event: SelectableEvent): void;
  extendFrom(
    fromId: string | null | undefined,
    toId: string,
    options?: { additive?: boolean },
  ): void;
  selectAll(): void;
  deselectAll(): void;
  seat(id: string): void;
  setOptIn(id: string, selectable: boolean): () => void;
  addRangeDelegate(delegate: SelectableRangeDelegate): () => void;
}

interface InternalSelectableController extends SelectableController {
  /** Uses renderer data only when the collection has no item for the ID. */
  getSelectionKey(id: string, fallbackKey?: string): string | null | undefined;
}

interface OptInRegistration {
  selectable: boolean;
  token: object;
}

interface RangeDelegateRegistration {
  delegate: SelectableRangeDelegate;
}

interface ResolvedRange {
  delegate?: SelectableRangeDelegate;
  delegated: boolean;
  keys: readonly string[] | null;
}

interface PendingKeysTransition {
  keys: readonly (readonly string[])[];
  latestKeys: readonly string[];
  sawPreviousKeys: boolean;
  sawPreviousKeysForWrite: boolean;
  token: object;
  writing: boolean;
}

type RangeOperation = "add" | "replace" | "subtract";

function uniqueKeys(keys: readonly string[]) {
  return [...new Set(keys)];
}

function haveSameKeys(keys: readonly string[], otherKeys: readonly string[]) {
  if (keys.length !== otherKeys.length) return false;
  for (let index = 0; index < keys.length; index += 1) {
    if (keys[index] !== otherKeys[index]) return false;
  }
  return true;
}

function addKeys(keys: readonly string[], keysToAdd: readonly string[]) {
  const nextKeys = keys.slice();
  const keySet = new Set(keys);
  for (const key of keysToAdd) {
    if (keySet.has(key)) continue;
    keySet.add(key);
    nextKeys.push(key);
  }
  return nextKeys;
}

function removeKeys(keys: readonly string[], keysToRemove: readonly string[]) {
  const removalSet = new Set(keysToRemove);
  return keys.filter((key) => !removalSet.has(key));
}

function getPointerType(event: SelectableEvent) {
  if (event.pointerType) return event.pointerType;
  const nativeEvent = event.nativeEvent;
  if (!nativeEvent) return;
  if (!("pointerType" in nativeEvent)) return;
  if (typeof nativeEvent.pointerType !== "string") return;
  return nativeEvent.pointerType;
}

function isCoarsePointerEvent(event: SelectableEvent) {
  const pointerType = getPointerType(event);
  return pointerType === "touch" || pointerType === "pen";
}

function getEventIdentity(event: SelectableEvent) {
  return event.nativeEvent ?? event;
}

/**
 * Creates the selection state machine shared by selectable composite stores.
 * The controller keeps cursor item ids separate from membership keys so stores
 * such as Combobox can select by value without losing an exact range anchor.
 */
export function createSelectableController(
  options: SelectableControllerOptions,
): SelectableController {
  let anchorId: string | undefined;
  let baseKeys: readonly string[] | null = null;
  let pendingKeysTransition: PendingKeysTransition | null = null;
  let knownKeys = uniqueKeys(options.getKeys());
  let selectedKeys = new Set(knownKeys);
  const handledEvents = new WeakSet<object>();
  const ignoredEvents = new WeakSet<object>();
  const optInRegistrations = new Map<string, OptInRegistration[]>();
  const rangeDelegates = new Set<RangeDelegateRegistration>();
  const unresolvedRangeWarningKey = {};
  const missingOrderedKeysWarningKey = {};
  const rowContainmentWarningKey = {};

  const hasTransitionKeys = (
    transition: PendingKeysTransition,
    keys: readonly string[],
  ) => {
    return transition.keys.some((currentKeys) =>
      haveSameKeys(keys, currentKeys),
    );
  };

  const observeKeys = (keys: readonly string[]) => {
    const nextKeys = uniqueKeys(keys);
    const changed = !haveSameKeys(knownKeys, nextKeys);
    knownKeys = nextKeys;
    selectedKeys = new Set(nextKeys);
    if (!changed) return;
    const transition = pendingKeysTransition;
    if (!transition || !hasTransitionKeys(transition, nextKeys)) {
      pendingKeysTransition = null;
      baseKeys = null;
      return;
    }
    const matchesLatestKeys = haveSameKeys(nextKeys, transition.latestKeys);
    if (!matchesLatestKeys) {
      transition.sawPreviousKeys = true;
      transition.sawPreviousKeysForWrite = true;
      return;
    }
    if (transition.sawPreviousKeys && !transition.writing) {
      pendingKeysTransition = null;
    }
  };

  const settleCommittedTransition = (transition: PendingKeysTransition) => {
    if (pendingKeysTransition !== transition) return;
    transition.writing = false;
    observeKeys(options.getKeys());
    if (pendingKeysTransition !== transition) return;
    if (!transition.sawPreviousKeysForWrite) return;
    if (!haveSameKeys(knownKeys, transition.latestKeys)) return;
    pendingKeysTransition = null;
  };

  const scheduleTransitionCleanup = (token: object) => {
    queueMicrotask(() => {
      if (pendingKeysTransition?.token !== token) return;
      if (pendingKeysTransition.sawPreviousKeys) return;
      pendingKeysTransition = null;
    });
  };

  void options.subscribeKeys((keys) => {
    observeKeys(keys);
  });

  const warnUnresolvedRange = () => {
    if (process.env.NODE_ENV === "production") return;
    warnOnce(
      "A selection range could not be resolved. The destination was selected without truncating the range.",
      unresolvedRangeWarningKey,
    );
  };

  const warnMissingOrderedKeys = () => {
    if (process.env.NODE_ENV === "production") return;
    warnOnce(
      "A selection range delegate must implement getOrderedKeys to replace or select all items safely. The existing selection was preserved.",
      missingOrderedKeysWarningKey,
    );
  };

  const resolveTarget = (id: string) => options.resolveTarget?.(id) ?? id;

  const getSelectionKey = (id: string) => options.getSelectionKey(id);

  const getSelectionKeys = (ids: readonly string[]) => {
    const keys: string[] = [];
    const keySet = new Set<string>();
    for (const id of ids) {
      const key = getSelectionKey(id);
      if (key == null) continue;
      if (keySet.has(key)) continue;
      keySet.add(key);
      keys.push(key);
    }
    return keys;
  };

  const commitKeys = (keys: readonly string[]) => {
    const currentKeys = uniqueKeys(options.getKeys());
    const normalizedKeys = uniqueKeys(keys);
    const nextKeys = haveSameKeys(currentKeys, normalizedKeys)
      ? currentKeys
      : normalizedKeys;
    const previousTransition = pendingKeysTransition;
    const continuesTransition =
      previousTransition && hasTransitionKeys(previousTransition, currentKeys);
    if (previousTransition && !continuesTransition) {
      baseKeys = null;
    }
    const transitionKeys = continuesTransition
      ? previousTransition.keys.slice()
      : [currentKeys];
    if (!transitionKeys.some((keys) => haveSameKeys(keys, normalizedKeys))) {
      transitionKeys.push(normalizedKeys);
    }
    const token = {};
    const transition: PendingKeysTransition = {
      keys: transitionKeys,
      latestKeys: normalizedKeys,
      sawPreviousKeys: continuesTransition
        ? previousTransition.sawPreviousKeys
        : false,
      sawPreviousKeysForWrite: false,
      token,
      writing: true,
    };
    pendingKeysTransition = transition;
    try {
      options.setKeys(nextKeys);
      settleCommittedTransition(transition);
      if (
        pendingKeysTransition === transition &&
        transition.sawPreviousKeys &&
        haveSameKeys(currentKeys, normalizedKeys)
      ) {
        pendingKeysTransition = null;
      }
      scheduleTransitionCleanup(token);
    } catch (error) {
      if (pendingKeysTransition?.token === token) {
        const committedKeys = uniqueKeys(options.getKeys());
        if (haveSameKeys(committedKeys, normalizedKeys)) {
          settleCommittedTransition(transition);
          scheduleTransitionCleanup(token);
        } else if (haveSameKeys(committedKeys, currentKeys)) {
          knownKeys = committedKeys;
          selectedKeys = new Set(committedKeys);
          if (transition.sawPreviousKeysForWrite) {
            transition.writing = false;
            scheduleTransitionCleanup(token);
          } else {
            pendingKeysTransition = previousTransition;
          }
        } else {
          observeKeys(committedKeys);
          if (pendingKeysTransition === transition) {
            pendingKeysTransition = null;
            baseKeys = null;
          }
        }
      }
      throw error;
    }
  };

  const isOptedIn = (id: string) => {
    const registrations = optInRegistrations.get(id);
    return (
      registrations?.some((registration) => registration.selectable) ?? false
    );
  };

  const hasOptIn = (id: string) => optInRegistrations.has(id);

  const isSelectable = (id: string) => {
    if (hasOptIn(id)) return isOptedIn(id);
    if (options.requireOptIn) return false;
    return getSelectionKey(id) != null;
  };

  const getRangeDelegates = () => {
    return [...rangeDelegates].map((registration) => registration.delegate);
  };

  const isSelected = (id: string) => {
    const key = getSelectionKey(id);
    if (key == null) return false;
    return selectedKeys.has(key);
  };

  const canMutate = () => options.getMode() !== "none";

  const warnUnresolvedRowContainment = (id: string) => {
    if (process.env.NODE_ENV === "production") return;
    const item = options.collection.item(id);
    if (!item) return;
    if (!("rowId" in item)) return;
    const rowId = item.rowId;
    if (typeof rowId !== "string") return;
    if (rowId === id) return;
    const row = options.collection.item(rowId);
    if (row && isSelectable(rowId)) return;
    warnOnce(
      "A grid selection range could not resolve the cell's rowId to a selectable row. Give the selectable row item the same id as its CompositeRow.",
      rowContainmentWarningKey,
    );
  };

  const seat = (id: string) => {
    anchorId = resolveTarget(id);
    baseKeys = null;
  };

  const commitSingleTarget = (id: string) => {
    const key = getSelectionKey(id);
    if (key == null) return;
    commitKeys([key]);
    seat(id);
  };

  const getRenderedOrderedIds = () => {
    return options.collection.getState().renderedItems.map((item) => item.id);
  };

  const getRenderedOrderedSelectionKeys = () => {
    const ids = getRenderedOrderedIds().filter(isSelectable);
    return getSelectionKeys(ids);
  };

  const getDelegateOrderedKeys = (delegate: SelectableRangeDelegate) => {
    if (typeof delegate.getOrderedKeys !== "function") return;
    const keys = delegate.getOrderedKeys();
    if (keys == null) return;
    return uniqueKeys(keys);
  };

  const getRegisteredDelegateScope = (
    requiredDelegate: SelectableRangeDelegate,
  ) => {
    let foundRequiredDelegate = false;
    let orderedKeys: readonly string[] = [];
    for (const delegate of getRangeDelegates()) {
      if (delegate === requiredDelegate) {
        foundRequiredDelegate = true;
      }
      const delegateKeys = getDelegateOrderedKeys(delegate);
      if (!delegateKeys) {
        if (delegate === requiredDelegate) return;
        continue;
      }
      orderedKeys = addKeys(orderedKeys, delegateKeys);
    }
    if (!foundRequiredDelegate) return;
    return orderedKeys;
  };

  const getReplacementScope = (id: string) => {
    const explicitDelegate = options.rangeDelegate;
    if (explicitDelegate) {
      return getDelegateOrderedKeys(explicitDelegate);
    }
    if (rangeDelegates.size) {
      for (const delegate of getRangeDelegates()) {
        const targetRange = delegate.getKeysInRange(id, id);
        if (targetRange == null) continue;
        return getRegisteredDelegateScope(delegate);
      }
      return;
    }
    return getRenderedOrderedSelectionKeys();
  };

  const replace = (id: string) => {
    if (!canMutate()) return;
    if (!isSelectable(id)) return;
    const key = getSelectionKey(id);
    if (key == null) return;
    if (options.getMode() === "single") {
      commitSingleTarget(id);
      return;
    }
    const scope = getReplacementScope(id);
    if (!scope) {
      warnMissingOrderedKeys();
      commitKeys(addKeys(options.getKeys(), [key]));
      seat(id);
      return;
    }
    const keysOutsideScope = removeKeys(options.getKeys(), scope);
    commitKeys(addKeys(keysOutsideScope, [key]));
    seat(id);
  };

  const select = (id: string) => {
    if (!canMutate()) return;
    if (!isSelectable(id)) return;
    if (options.getMode() === "single") {
      commitSingleTarget(id);
      return;
    }
    const key = getSelectionKey(id);
    if (key == null) return;
    commitKeys(addKeys(options.getKeys(), [key]));
    seat(id);
  };

  const deselect = (id: string) => {
    if (!canMutate()) return;
    if (!isSelectable(id)) return;
    const key = getSelectionKey(id);
    if (key == null) return;
    commitKeys(removeKeys(options.getKeys(), [key]));
    seat(id);
  };

  const toggle = (id: string) => {
    if (!canMutate()) return;
    if (!isSelectable(id)) return;
    if (isSelected(id)) {
      deselect(id);
      return;
    }
    select(id);
  };

  const getRange = (fromId: string, toId: string): ResolvedRange => {
    const explicitDelegate = options.rangeDelegate;
    if (explicitDelegate) {
      return {
        delegate: explicitDelegate,
        delegated: true,
        keys: explicitDelegate.getKeysInRange(fromId, toId),
      };
    }
    if (rangeDelegates.size) {
      for (const delegate of getRangeDelegates()) {
        const keys = delegate.getKeysInRange(fromId, toId);
        if (keys == null) continue;
        return { delegate, delegated: true, keys };
      }
      return { delegated: true, keys: null };
    }
    const orderedIds = getRenderedOrderedIds();
    const fromIndex = orderedIds.indexOf(fromId);
    const toIndex = orderedIds.indexOf(toId);
    if (fromIndex < 0 || toIndex < 0) {
      return { delegated: false, keys: null };
    }
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    const ids = orderedIds.slice(startIndex, endIndex + 1).filter(isSelectable);
    return { delegated: false, keys: getSelectionKeys(ids) };
  };

  const getRangeScope = (range: ResolvedRange) => {
    if (range.delegate) {
      if (range.delegate === options.rangeDelegate) {
        return getDelegateOrderedKeys(range.delegate);
      }
      return getRegisteredDelegateScope(range.delegate);
    }
    if (range.delegated) return;
    return getRenderedOrderedSelectionKeys();
  };

  const resolveAnchor = (fromId: string | null | undefined) => {
    if (anchorId && options.collection.item(anchorId)) return anchorId;
    const cursorId = fromId === undefined ? options.getCursorId() : fromId;
    if (cursorId == null) return;
    const targetId = resolveTarget(cursorId);
    if (!options.collection.item(targetId)) return;
    anchorId = targetId;
    return targetId;
  };

  const extendRange = (
    fromId: string | null | undefined,
    toId: string,
    operation: RangeOperation,
  ) => {
    if (!canMutate()) return;
    const targetId = resolveTarget(toId);
    const rangeAnchor = resolveAnchor(fromId);
    warnUnresolvedRowContainment(toId);
    if (rangeAnchor) {
      warnUnresolvedRowContainment(rangeAnchor);
    }
    if (options.getMode() === "single") {
      if (!isSelectable(targetId)) return;
      const key = getSelectionKey(targetId);
      if (key == null) return;
      commitKeys([key]);
      baseKeys = null;
      // With no previous cursor or anchor, the first Shift target becomes the
      // only usable origin for a later range. Otherwise Shift never moves it.
      if (!rangeAnchor) seat(targetId);
      return;
    }
    if (!rangeAnchor) {
      if (isSelectable(targetId)) {
        select(targetId);
      } else {
        seat(targetId);
      }
      return;
    }
    baseKeys ??= options.getKeys().slice();
    const range = getRange(resolveTarget(rangeAnchor), targetId);
    if (range.keys == null) {
      warnUnresolvedRange();
      const key = getSelectionKey(targetId);
      if (key != null && isSelectable(targetId)) {
        commitKeys(addKeys(options.getKeys(), [key]));
      }
      return;
    }
    const rangeKeys = uniqueKeys(range.keys);
    if (operation === "add") {
      commitKeys(addKeys(baseKeys, rangeKeys));
      return;
    }
    if (operation === "subtract") {
      commitKeys(removeKeys(baseKeys, rangeKeys));
      return;
    }
    const scope = getRangeScope(range);
    if (!scope) {
      warnMissingOrderedKeys();
      commitKeys(addKeys(baseKeys, rangeKeys));
      return;
    }
    const keysOutsideScope = removeKeys(baseKeys, scope);
    commitKeys(addKeys(keysOutsideScope, rangeKeys));
  };

  const extendFrom: SelectableController["extendFrom"] = (
    fromId,
    toId,
    extendOptions,
  ) => {
    const behavior = options.getBehavior();
    const operation =
      behavior === "toggle" && extendOptions?.additive ? "subtract" : "add";
    extendRange(fromId, toId, operation);
  };

  const activate = (id: string, event: SelectableEvent) => {
    const eventIdentity = getEventIdentity(event);
    if (handledEvents.has(eventIdentity)) return;
    handledEvents.add(eventIdentity);
    if (!canMutate()) return;
    const targetId = resolveTarget(id);
    const rangeEvent = isRangeSelectionEvent(event);
    if (options.getMode() === "single") {
      if (rangeEvent) {
        extendRange(undefined, targetId, "replace");
      } else if (isSelectable(targetId)) {
        replace(targetId);
      }
      return;
    }
    // Touch and pen cannot reliably express desktop modifiers, so replace
    // behavior degrades to modifier-free toggling for the whole activation.
    if (options.getBehavior() === "replace" && isCoarsePointerEvent(event)) {
      const previousAnchorId = anchorId;
      const previousBaseKeys = baseKeys;
      if (isSelectable(targetId)) {
        toggle(targetId);
      }
      // Degrading the operation must not change Shift's anchor lifecycle.
      if (rangeEvent) {
        anchorId = previousAnchorId;
        baseKeys = previousBaseKeys;
      }
      return;
    }
    if (rangeEvent) {
      if (options.getBehavior() === "toggle") {
        const operation = isAdditiveSelectionEvent(event) ? "subtract" : "add";
        extendRange(undefined, targetId, operation);
        return;
      }
      const keyboardRange = isVirtualClick(event);
      const additiveRange = isAdditiveSelectionEvent(event);
      const operation = keyboardRange || additiveRange ? "add" : "replace";
      extendRange(undefined, targetId, operation);
      return;
    }
    if (!isSelectable(targetId)) return;
    if (options.getBehavior() === "toggle") {
      toggle(targetId);
      return;
    }
    if (isNonContiguousSelectionEvent(event)) {
      toggle(targetId);
      return;
    }
    // Virtual activations use modifier-free toggling even in replace behavior.
    // The issue's operation table currently omits this row.
    if (isVirtualClick(event)) {
      toggle(targetId);
      return;
    }
    replace(targetId);
  };

  const getAllOrderedKeys = () => {
    const explicitDelegate = options.rangeDelegate;
    if (explicitDelegate) {
      return getDelegateOrderedKeys(explicitDelegate);
    }
    if (rangeDelegates.size) {
      let orderedKeys: readonly string[] = [];
      for (const delegate of getRangeDelegates()) {
        const delegateKeys = getDelegateOrderedKeys(delegate);
        if (!delegateKeys) return;
        orderedKeys = addKeys(orderedKeys, delegateKeys);
      }
      return orderedKeys;
    }
    return getRenderedOrderedSelectionKeys();
  };

  const selectAll = () => {
    if (!canMutate()) return;
    const orderedKeys = getAllOrderedKeys();
    if (!orderedKeys) {
      warnMissingOrderedKeys();
      return;
    }
    if (options.getMode() === "single") {
      const firstKey = orderedKeys[0];
      if (firstKey == null) return;
      commitKeys([firstKey]);
      baseKeys = [];
      return;
    }
    commitKeys(addKeys(options.getKeys(), orderedKeys));
    baseKeys = [];
  };

  const deselectAll = () => {
    if (!canMutate()) return;
    commitKeys([]);
    baseKeys = [];
  };

  const setOptIn = (id: string, selectable: boolean) => {
    const token = {};
    const registration = { selectable, token };
    const registrations = optInRegistrations.get(id) ?? [];
    registrations.push(registration);
    optInRegistrations.set(id, registrations);
    return () => {
      const currentRegistrations = optInRegistrations.get(id);
      if (!currentRegistrations) return;
      const nextRegistrations = currentRegistrations.filter(
        (currentRegistration) => currentRegistration.token !== token,
      );
      if (nextRegistrations.length) {
        optInRegistrations.set(id, nextRegistrations);
      } else {
        optInRegistrations.delete(id);
      }
    };
  };

  const addRangeDelegate = (delegate: SelectableRangeDelegate) => {
    const registration = { delegate };
    rangeDelegates.add(registration);
    return () => rangeDelegates.delete(registration);
  };

  const ignore = (event: SelectableEvent) => {
    const eventIdentity = getEventIdentity(event);
    ignoredEvents.add(eventIdentity);
    handledEvents.add(eventIdentity);
  };

  const isIgnored = (event: SelectableEvent) => {
    return ignoredEvents.has(getEventIdentity(event));
  };

  const controller: InternalSelectableController = {
    getMode: () => options.getMode(),
    getSelectionKey: (id, fallbackKey) => {
      const key = getSelectionKey(id);
      if (key != null) return key;
      if (options.collection.item(id)) return key;
      return fallbackKey;
    },
    isSelected,
    isSelectable,
    hasOptIn,
    isOptedIn,
    isIgnored,
    select,
    deselect,
    toggle,
    ignore,
    activate,
    extendFrom,
    selectAll,
    deselectAll,
    seat,
    setOptIn,
    addRangeDelegate,
  };
  return controller;
}
