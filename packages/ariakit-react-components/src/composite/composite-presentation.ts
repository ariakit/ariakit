import { subscribe } from "@ariakit/store";
import { isTextField } from "@ariakit/utils";
import type { FocusPresentationOptions } from "../focusable/focus-presentation.tsx";
import {
  getFocusActiveElement,
  scheduleFocusPresentation,
} from "../focusable/focus-presentation.tsx";
import type { CompositeStore } from "./composite-store.ts";
import { getEnabledItem, isItem } from "./utils.ts";

interface CompositePresentationOptions {
  target: "active" | "base";
  focus?: FocusPresentationOptions["focus"];
  scroll?: FocusPresentationOptions["scroll"];
  beforeFocus?: FocusPresentationOptions["beforeFocus"];
  beforeScroll?: FocusPresentationOptions["beforeScroll"];
  onPresented?: FocusPresentationOptions["onPresented"];
  targetId?: string | null;
}

function ownsCompositeFocus(store: CompositeStore, element: Element | null) {
  if (!element) return false;
  const { baseElement } = store.getState();
  if (baseElement?.contains(element)) return true;
  return isItem(store, element);
}

function compositeOwnsCurrentFocus(store: CompositeStore) {
  const { baseElement, items } = store.getState();
  const roots = new Set<Node>();
  for (const element of [baseElement, ...items.map((item) => item.element)]) {
    if (!element) continue;
    const root = element.getRootNode();
    if (roots.has(root)) continue;
    roots.add(root);
    if (ownsCompositeFocus(store, getFocusActiveElement(element))) return true;
  }
  return false;
}

function getCompositeScopeTarget(
  store: CompositeStore,
  target: HTMLElement | null,
) {
  const state = store.getState();
  if ("contentElement" in state) {
    const contentElement = state.contentElement as HTMLElement | null;
    if (contentElement?.isConnected) return contentElement;
    return target;
  }
  return state.baseElement || target;
}

export function scheduleCompositePresentation(
  store: CompositeStore,
  {
    target,
    focus = true,
    scroll = "nearest",
    beforeFocus,
    beforeScroll,
    onPresented,
    targetId: targetIdProp,
  }: CompositePresentationOptions,
) {
  const initialState = store.getState();
  const initialActiveId = initialState.activeId;
  const initialMoves = initialState.moves;
  const initialVirtualFocus = initialState.virtualFocus;
  const initialOpen =
    "open" in initialState ? (initialState.open as boolean) : undefined;
  const targetId = targetIdProp === undefined ? initialActiveId : targetIdProp;
  let baseElement = initialState.baseElement;
  const initiallyOwned = compositeOwnsCurrentFocus(store);
  const preserveElement =
    initialVirtualFocus && baseElement && isTextField(baseElement)
      ? baseElement
      : null;

  const isValid = () => {
    const state = store.getState();
    if (!baseElement && state.baseElement) {
      baseElement = state.baseElement;
    } else if (baseElement && state.baseElement !== baseElement) {
      return false;
    }
    if (state.moves !== initialMoves) return false;
    if (state.virtualFocus !== initialVirtualFocus) return false;
    if (
      initialOpen !== undefined &&
      (!("open" in state) || state.open !== initialOpen)
    ) {
      return false;
    }
    if (target === "base") {
      if (state.activeId !== null) return false;
    } else if (state.activeId !== initialActiveId) {
      return false;
    }
    if (!initiallyOwned) return true;
    return compositeOwnsCurrentFocus(store);
  };

  const subscribeToChanges = (retry: () => void) => {
    const unsubscribe = subscribe(store, null, retry);
    if (!initiallyOwned) return unsubscribe;
    const doc = (baseElement || getEnabledItem(store, targetId)?.element)
      ?.ownerDocument;
    doc?.addEventListener("focusin", retry, true);
    return () => {
      unsubscribe();
      doc?.removeEventListener("focusin", retry, true);
    };
  };

  return scheduleFocusPresentation({
    getTarget() {
      const state = store.getState();
      if (target === "base") return state.baseElement;
      return getEnabledItem(store, targetId)?.element || null;
    },
    getScopeTarget() {
      const state = store.getState();
      if (target === "base") return state.baseElement;
      const targetElement = getEnabledItem(store, targetId)?.element || null;
      return getCompositeScopeTarget(store, targetElement);
    },
    subscribe: subscribeToChanges,
    isValid,
    focus,
    scroll,
    preserveElement,
    beforeFocus,
    beforeScroll,
    onPresented,
  });
}
