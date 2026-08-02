import type { ReactNode, RefCallback, RefObject } from "react";
import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { FocusPresentationAlignment } from "./scroll-into-view.ts";
import { scrollIntoView } from "./scroll-into-view.ts";

export interface FocusPresentationSnapshot {
  open: boolean;
  ready: boolean;
  cycle: number;
  positionRun: number;
  owner: HTMLElement | null;
}

export interface FocusPresentationUpdate {
  isCurrent(): boolean;
  ready(): void;
}

export interface FocusPresentationPositioning {
  beginUpdate(): FocusPresentationUpdate;
  dispose(): void;
}

export interface FocusPresentationScope {
  getSnapshot(): FocusPresentationSnapshot;
  subscribe(listener: () => void): () => void;
  setOpen(open: boolean): void;
  setOwner(element: HTMLElement | null): void;
  beginPositioning(): FocusPresentationPositioning;
}

export function createFocusPresentationScope(
  open = false,
): FocusPresentationScope {
  let snapshot: FocusPresentationSnapshot = {
    open,
    ready: false,
    cycle: open ? 1 : 0,
    positionRun: 0,
    owner: null,
  };
  let positionRun = 0;
  let update = 0;
  let detachedOwner: HTMLElement | null = null;
  let detachToken: object | null = null;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of [...listeners]) listener();
  };

  const setSnapshot = (next: Partial<FocusPresentationSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    emit();
  };

  const setOpen = (open: boolean) => {
    if (snapshot.open === open) return;
    setSnapshot({
      open,
      ready: false,
      cycle: snapshot.cycle + 1,
    });
  };

  const setOwner = (element: HTMLElement | null) => {
    if (!element) {
      detachedOwner = snapshot.owner;
      const token = {};
      detachToken = token;
      queueMicrotask(() => {
        if (detachToken !== token) return;
        detachToken = null;
        detachedOwner = null;
        if (!snapshot.owner) return;
        setSnapshot({
          owner: null,
          ready: false,
          cycle: snapshot.cycle + 1,
        });
      });
      return;
    }

    detachToken = null;
    const previousOwner = detachedOwner || snapshot.owner;
    detachedOwner = null;
    if (snapshot.owner === element) return;
    const ownerChanged = !!previousOwner && previousOwner !== element;
    setSnapshot({
      owner: element,
      ready: ownerChanged ? false : snapshot.ready,
      cycle: ownerChanged ? snapshot.cycle + 1 : snapshot.cycle,
    });
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setOpen,
    setOwner,
    beginPositioning() {
      const run = ++positionRun;
      setSnapshot({ ready: false, positionRun: run });
      return {
        beginUpdate() {
          const currentUpdate = ++update;
          if (snapshot.positionRun === run && snapshot.ready) {
            setSnapshot({ ready: false });
          }
          const isCurrent = () =>
            snapshot.positionRun === run && update === currentUpdate;
          return {
            isCurrent,
            ready() {
              if (!isCurrent()) return;
              if (!snapshot.open) return;
              if (!snapshot.owner?.isConnected) return;
              if (snapshot.ready) return;
              setSnapshot({ ready: true });
            },
          };
        },
        dispose() {
          if (snapshot.positionRun !== run) return;
          setSnapshot({ ready: false, positionRun: 0 });
        },
      };
    },
  };
}

export interface FocusPresentationScrollport {
  getElement(
    target?: HTMLElement,
    alignment?: FocusPresentationAlignment,
  ): HTMLElement | null;
}

interface FocusPresentationMetadata {
  scope: FocusPresentationScope;
  scrollport: FocusPresentationScrollport | null;
}

const FocusPresentationContext = createContext<FocusPresentationScope | null>(
  null,
);

const FocusPresentationScrollportContext =
  createContext<FocusPresentationScrollport | null>(null);

export function FocusPresentationProvider({
  scope,
  scrollport,
  children,
}: {
  scope: FocusPresentationScope;
  scrollport: FocusPresentationScrollport;
  children?: ReactNode;
}) {
  return (
    <FocusPresentationContext.Provider value={scope}>
      <FocusPresentationScrollportContext.Provider value={scrollport}>
        {children}
      </FocusPresentationScrollportContext.Provider>
    </FocusPresentationContext.Provider>
  );
}

export function FocusPresentationScrollportProvider({
  scrollport,
  children,
}: {
  scrollport: FocusPresentationScrollport;
  children?: ReactNode;
}) {
  return (
    <FocusPresentationScrollportContext.Provider value={scrollport}>
      {children}
    </FocusPresentationScrollportContext.Provider>
  );
}

export function useFocusPresentationScrollport(
  ref: RefObject<HTMLElement | null>,
  fallbackToParent = false,
) {
  const parent = useContext(FocusPresentationScrollportContext);
  return useMemo<FocusPresentationScrollport>(
    () => ({
      getElement(target, alignment = "nearest") {
        const element = ref.current;
        if (!fallbackToParent || !element || !parent) return element;
        const style =
          element.ownerDocument.defaultView?.getComputedStyle(element);
        const canScrollHorizontally =
          element.scrollWidth > element.clientWidth &&
          style?.overflowX !== "visible" &&
          style?.overflowX !== "clip";
        const canScrollVertically =
          element.scrollHeight > element.clientHeight &&
          style?.overflowY !== "visible" &&
          style?.overflowY !== "clip";
        if (target) {
          const elementRect = element.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const verticalWritingMode =
            style?.writingMode.startsWith("vertical") ||
            style?.writingMode.startsWith("sideways");
          const centersHorizontally =
            alignment === "center" && verticalWritingMode;
          const centersVertically =
            alignment === "center" && !verticalWritingMode;
          const needsHorizontalScroll =
            centersHorizontally ||
            targetRect.left < elementRect.left ||
            targetRect.right > elementRect.right;
          const needsVerticalScroll =
            centersVertically ||
            targetRect.top < elementRect.top ||
            targetRect.bottom > elementRect.bottom;
          if (
            (canScrollHorizontally && needsHorizontalScroll) ||
            (canScrollVertically && needsVerticalScroll)
          ) {
            return element;
          }
        } else if (canScrollHorizontally || canScrollVertically) {
          return element;
        }
        return parent.getElement(target, alignment);
      },
    }),
    [ref, fallbackToParent, parent],
  );
}

const metadataMap = new WeakMap<
  HTMLElement,
  Map<object, FocusPresentationMetadata>
>();
const metadataListeners = new WeakMap<HTMLElement, Set<() => void>>();

function emitMetadata(element: HTMLElement) {
  const listeners = metadataListeners.get(element);
  if (!listeners) return;
  for (const listener of [...listeners]) listener();
}

function setMetadata(
  element: HTMLElement,
  token: object,
  metadata: FocusPresentationMetadata | null,
) {
  const registrations = metadataMap.get(element);
  if (!metadata) {
    registrations?.delete(token);
    if (!registrations?.size) metadataMap.delete(element);
    emitMetadata(element);
    return;
  }
  const nextRegistrations = registrations || new Map();
  nextRegistrations.delete(token);
  nextRegistrations.set(token, metadata);
  metadataMap.set(element, nextRegistrations);
  emitMetadata(element);
}

function getMetadata(element: HTMLElement) {
  const registrations = metadataMap.get(element);
  if (!registrations) return null;
  let metadata: FocusPresentationMetadata | null = null;
  for (const registration of registrations.values()) {
    metadata = registration;
  }
  return metadata;
}

function subscribeMetadata(element: HTMLElement, listener: () => void) {
  const listeners = metadataListeners.get(element) || new Set();
  listeners.add(listener);
  metadataListeners.set(element, listeners);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) metadataListeners.delete(element);
  };
}

export function useFocusPresentationTarget(
  scopeProp?: FocusPresentationScope | null,
  scrollportProp?: FocusPresentationScrollport | null,
): RefCallback<HTMLElement> {
  const contextScope = useContext(FocusPresentationContext);
  const contextScrollport = useContext(FocusPresentationScrollportContext);
  const scope = scopeProp === undefined ? contextScope : scopeProp;
  const scrollport =
    scrollportProp === undefined ? contextScrollport : scrollportProp;
  const token = useRef({});
  const metadataElement = useRef<HTMLElement | null>(null);
  const detachToken = useRef<object | null>(null);

  return useCallback(
    (element) => {
      if (!element) {
        if (!metadataElement.current) return;
        const currentDetachToken = {};
        detachToken.current = currentDetachToken;
        queueMicrotask(() => {
          if (detachToken.current !== currentDetachToken) return;
          detachToken.current = null;
          const metadataTarget = metadataElement.current;
          metadataElement.current = null;
          if (metadataTarget) {
            setMetadata(metadataTarget, token.current, null);
          }
        });
        return;
      }

      detachToken.current = null;
      const previousMetadataElement = metadataElement.current;
      if (previousMetadataElement && previousMetadataElement !== element) {
        setMetadata(previousMetadataElement, token.current, null);
        metadataElement.current = null;
      }
      if (!scope) {
        if (metadataElement.current) {
          setMetadata(metadataElement.current, token.current, null);
          metadataElement.current = null;
        }
        return;
      }
      metadataElement.current = element;
      setMetadata(element, token.current, { scope, scrollport });
    },
    [scope, scrollport],
  );
}

const SILENT_FOCUS = Symbol("silent-focus");
type SilentFocusElement = HTMLElement & { [SILENT_FOCUS]?: boolean };

let focusTransaction: Set<HTMLElement> | null = null;

/**
 * Returns the active element in the node's root, falling back to its document
 * when focus has left that root.
 */
export function getFocusActiveElement(node: Node | null | undefined) {
  if (!node) return null;
  const root = node.getRootNode();
  if (!("activeElement" in root)) return null;
  const activeElement = root.activeElement as HTMLElement | null;
  if (activeElement) return activeElement;
  return (node.ownerDocument?.activeElement as HTMLElement | null) || null;
}

function transactionOwnsFocus(transaction: Set<HTMLElement>) {
  for (const element of transaction) {
    if (getFocusActiveElement(element) === element) return true;
  }
  return false;
}

export function focusWithoutScrolling(
  element: SilentFocusElement,
  silent = false,
) {
  const previousTransaction = focusTransaction;
  const transaction = previousTransaction || new Set<HTMLElement>();
  focusTransaction = transaction;
  transaction.add(element);
  if (silent) element[SILENT_FOCUS] = true;
  try {
    element.focus({ preventScroll: true });
  } finally {
    focusTransaction = previousTransaction;
    if (silent) {
      queueMicrotask(() => {
        delete element[SILENT_FOCUS];
      });
    }
  }
  return transaction;
}

export function silentlyFocused(element: SilentFocusElement) {
  const silent = element[SILENT_FOCUS];
  delete element[SILENT_FOCUS];
  return silent;
}

export interface FocusPresentationOptions {
  getTarget: () => HTMLElement | null;
  getScopeTarget?: () => HTMLElement | null;
  subscribe?: (retry: () => void) => () => void;
  isValid?: () => boolean;
  isReady?: () => boolean;
  settle?: boolean | (() => boolean);
  focus?: boolean | "silent" | ((target: HTMLElement) => boolean | "silent");
  scroll?: false | FocusPresentationAlignment;
  requireScope?: boolean;
  requireTargetScope?: boolean;
  preserveElement?: HTMLElement | null;
  beforeFocus?: (target: HTMLElement) => void;
  beforeScroll?: (target: HTMLElement) => void;
  onPresented?: () => void;
}

export function scheduleFocusPresentation({
  getTarget,
  getScopeTarget,
  subscribe,
  isValid = () => true,
  isReady = () => true,
  settle = false,
  focus = false,
  scroll = false,
  requireScope = false,
  requireTargetScope = false,
  preserveElement,
  beforeFocus,
  beforeScroll,
  onPresented,
}: FocusPresentationOptions) {
  let canceled = false;
  let running = false;
  let rerun = false;
  let settleGeneration = 0;
  let settlePending = false;
  let settled = !settle;
  let boundTarget: HTMLElement | null = null;
  let boundScopeTarget: HTMLElement | null = null;
  let boundScope: FocusPresentationScope | null = null;
  let boundCycle = 0;
  let boundOwner: HTMLElement | null = null;
  let targetScopeBound = false;
  let targetMetadataElement: HTMLElement | null = null;
  let scopeMetadataElement: HTMLElement | null = null;
  let subscribedScope: FocusPresentationScope | null = null;
  let unsubscribeTargetMetadata = () => {};
  let unsubscribeScopeMetadata = () => {};
  let unsubscribeScope = () => {};
  let unsubscribeSource = () => {};

  const cleanup = () => {
    unsubscribeTargetMetadata();
    unsubscribeScopeMetadata();
    unsubscribeScope();
    unsubscribeSource();
    unsubscribeTargetMetadata = () => {};
    unsubscribeScopeMetadata = () => {};
    unsubscribeScope = () => {};
    unsubscribeSource = () => {};
  };

  const cancel = () => {
    if (canceled) return;
    canceled = true;
    settleGeneration += 1;
    cleanup();
  };

  const retry = (restartSettlement = true) => {
    if (canceled) return;
    if (restartSettlement) resetSettlement();
    if (running) {
      rerun = true;
      return;
    }
    run();
  };

  const resetSettlement = () => {
    if (!settle) return;
    settled = false;
    if (!settlePending) return;
    settlePending = false;
    settleGeneration += 1;
  };

  const waitForSettlement = () => {
    if (settled) return false;
    if (settlePending) return true;
    settlePending = true;
    const generation = ++settleGeneration;
    queueMicrotask(() => {
      // Event handlers may queue another focus action. Wait through their
      // microtasks before considering the presentation state settled.
      queueMicrotask(() => {
        if (canceled) return;
        if (generation !== settleGeneration) return;
        settlePending = false;
        settled = true;
        retry(false);
      });
    });
    return true;
  };

  const subscribeToMetadata = (element: HTMLElement, scopeTarget: boolean) => {
    const currentElement = scopeTarget
      ? scopeMetadataElement
      : targetMetadataElement;
    if (currentElement === element) return;
    if (scopeTarget) {
      unsubscribeScopeMetadata();
      scopeMetadataElement = element;
      unsubscribeScopeMetadata = subscribeMetadata(element, retry);
    } else {
      unsubscribeTargetMetadata();
      targetMetadataElement = element;
      unsubscribeTargetMetadata = subscribeMetadata(element, retry);
    }
  };

  const waitForScope = (scope: FocusPresentationScope) => {
    if (subscribedScope === scope) return;
    unsubscribeScope();
    subscribedScope = scope;
    unsubscribeScope = scope.subscribe(retry);
  };

  const run = () => {
    if (canceled || running) return;
    running = true;
    try {
      if (!isValid()) {
        cancel();
        return;
      }

      const explicitScopeTarget = getScopeTarget?.();
      if (getScopeTarget && !explicitScopeTarget?.isConnected) {
        if (boundScopeTarget) cancel();
        return;
      }

      const target = getTarget();
      const targetConnected = !!target?.isConnected;
      if (!targetConnected && boundTarget) {
        cancel();
        return;
      }

      const scopeTarget = getScopeTarget ? explicitScopeTarget : target;
      if (!scopeTarget?.isConnected) return;

      if (!boundScopeTarget) {
        boundScopeTarget = scopeTarget;
      } else if (boundScopeTarget !== scopeTarget) {
        cancel();
        return;
      }

      if (scopeTarget !== target) {
        subscribeToMetadata(scopeTarget, true);
      }

      if (targetConnected) {
        if (!boundTarget) {
          boundTarget = target;
        } else if (boundTarget !== target) {
          cancel();
          return;
        }
        subscribeToMetadata(target, false);
      }

      const targetMetadata = targetConnected ? getMetadata(target) : null;
      const scopeMetadata =
        scopeTarget === target ? targetMetadata : getMetadata(scopeTarget);
      const scope = scopeMetadata?.scope;
      const scrollport =
        targetMetadata && targetMetadata.scope === scope
          ? targetMetadata.scrollport
          : scopeMetadata?.scrollport;

      if (boundScope && !scope) {
        cancel();
        return;
      }
      if (requireScope && !scope) {
        return;
      }
      if (requireTargetScope && scope) {
        if (!targetMetadata) {
          if (targetScopeBound) cancel();
          return;
        }
        if (targetMetadata.scope !== scope) {
          cancel();
          return;
        }
        targetScopeBound = true;
      }

      if (scope) {
        const snapshot = scope.getSnapshot();
        if (!snapshot.open) {
          cancel();
          return;
        }
        if (!boundScope) {
          boundScope = scope;
          boundCycle = snapshot.cycle;
        } else if (boundScope !== scope || boundCycle !== snapshot.cycle) {
          cancel();
          return;
        }
        waitForScope(scope);
        if (!snapshot.ready) {
          resetSettlement();
          return;
        }
        if (!boundOwner) {
          boundOwner = snapshot.owner;
        } else if (boundOwner !== snapshot.owner) {
          cancel();
          return;
        }
      }

      if (!targetConnected) return;

      if (waitForSettlement()) return;
      if (typeof settle === "function" && !settle()) {
        cancel();
        return;
      }
      if (!isReady()) return;

      const isCurrentPresentation = () => {
        if (canceled) return false;
        if (!target.isConnected || !scopeTarget.isConnected) return false;
        if (getTarget() !== target) return false;
        if (getScopeTarget && getScopeTarget() !== scopeTarget) return false;
        if (!isValid() || !isReady()) return false;
        if (typeof settle === "function" && !settle()) return false;

        const currentTargetMetadata = getMetadata(target);
        const currentScopeMetadata =
          scopeTarget === target
            ? currentTargetMetadata
            : getMetadata(scopeTarget);
        const currentScope = currentScopeMetadata?.scope;
        const currentScrollport =
          currentTargetMetadata && currentTargetMetadata.scope === currentScope
            ? currentTargetMetadata.scrollport
            : currentScopeMetadata?.scrollport;

        if (currentScope !== scope) return false;
        if (currentScrollport !== scrollport) return false;
        if (requireScope && !currentScope) return false;
        if (
          requireTargetScope &&
          currentScope &&
          currentTargetMetadata?.scope !== currentScope
        ) {
          return false;
        }
        if (!currentScope) return true;

        const snapshot = currentScope.getSnapshot();
        if (!snapshot.open || !snapshot.ready) return false;
        if (!snapshot.owner?.isConnected) return false;
        if (snapshot.cycle !== boundCycle) return false;
        if (snapshot.owner !== boundOwner) return false;
        return true;
      };

      if (!isCurrentPresentation()) {
        cancel();
        return;
      }

      // Stop observing before the action. Synchronous handlers are validated
      // against the bound target and scope below rather than starting a second
      // presentation while this one is running.
      cleanup();

      const savedScroll = preserveElement
        ? { left: preserveElement.scrollLeft, top: preserveElement.scrollTop }
        : null;
      try {
        const focusTarget = typeof focus === "function" ? focus(target) : focus;
        if (focusTarget) {
          beforeFocus?.(target);
          if (!isCurrentPresentation()) return;
          const transaction = focusWithoutScrolling(
            target,
            focusTarget === "silent",
          );
          if (!transactionOwnsFocus(transaction)) return;
        }
        if (!isCurrentPresentation()) return;
        if (scroll) {
          beforeScroll?.(target);
          if (!isCurrentPresentation()) return;
          if (scope) {
            const scrollportElement = scrollport?.getElement(target, scroll);
            if (scrollportElement) {
              scrollIntoView(target, scrollportElement, scroll);
            }
          } else {
            target.scrollIntoView({ block: scroll, inline: "nearest" });
          }
        }
        if (!isCurrentPresentation()) return;
        onPresented?.();
      } finally {
        cancel();
        if (savedScroll && preserveElement) {
          preserveElement.scrollLeft = savedScroll.left;
          preserveElement.scrollTop = savedScroll.top;
        }
      }
    } finally {
      running = false;
      if (rerun && !canceled) {
        rerun = false;
        queueMicrotask(run);
      }
    }
  };

  const sourceSubscription = subscribe?.(retry) || (() => {});
  if (canceled) {
    sourceSubscription();
  } else {
    unsubscribeSource = sourceSubscription;
  }
  run();
  return cancel;
}
