import { hasOwnProperty } from "@ariakit/utils";
import type { PopoverStore, PopoverStoreState } from "./popover-store.ts";

interface ExplicitPopoverAnchorRegistry {
  anchors: WeakMap<HTMLElement, number>;
  current?: HTMLElement;
}

interface PopoverAnchorStore {
  getState(): Partial<PopoverStoreState>;
}

const explicitPopoverAnchorRegistries = new WeakMap<
  object,
  ExplicitPopoverAnchorRegistry
>();

function getExplicitPopoverAnchorRegistry(store: object) {
  let registry = explicitPopoverAnchorRegistries.get(store);
  if (!registry) {
    registry = { anchors: new WeakMap() };
    explicitPopoverAnchorRegistries.set(store, registry);
  }
  return registry;
}

export function linkExplicitPopoverAnchorStore(
  store: PopoverAnchorStore,
  source?: PopoverAnchorStore | null,
) {
  if (explicitPopoverAnchorRegistries.has(store)) return;
  // Synchronized stores may still have stale element state while refs run, so
  // they must share explicit anchor metadata before store initialization.
  if (!source || !hasOwnProperty(source.getState(), "anchorElement")) {
    getExplicitPopoverAnchorRegistry(store);
    return;
  }
  const registry = getExplicitPopoverAnchorRegistry(source);
  explicitPopoverAnchorRegistries.set(store, registry);
}

export function markExplicitPopoverAnchor(
  store: PopoverStore,
  element: HTMLElement,
) {
  const registry = getExplicitPopoverAnchorRegistry(store);
  const count = registry.anchors.get(element) || 0;
  registry.anchors.set(element, count + 1);
  registry.current = element;
}

export function unmarkExplicitPopoverAnchor(
  store: PopoverStore,
  element: HTMLElement,
) {
  const registry = getExplicitPopoverAnchorRegistry(store);
  const count = registry.anchors.get(element);
  if (!count) return;
  if (count === 1) {
    registry.anchors.delete(element);
    if (registry.current === element) {
      delete registry.current;
    }
    return;
  }
  registry.anchors.set(element, count - 1);
}

export function getExplicitPopoverAnchor(store: PopoverStore) {
  return getExplicitPopoverAnchorRegistry(store).current;
}

export function setPopoverDisclosureAnchor(
  store: PopoverStore | undefined,
  element: HTMLElement | null,
) {
  if (!store) return;
  const explicitAnchor = getExplicitPopoverAnchor(store);
  if (explicitAnchor) {
    store.setAnchorElement(explicitAnchor);
    return;
  }
  store.setAnchorElement(element);
}

export type Placement = PopoverStoreState["placement"];

type BasePlacementOf<T extends string> = T extends `${infer Base}-${string}`
  ? Base
  : T;

export type BasePlacement = BasePlacementOf<Placement>;

export function getBasePlacement(placement: Placement) {
  // Every Placement union member starts with its base side.
  return placement.split("-")[0] as BasePlacement;
}
