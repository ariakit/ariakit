import type { PopoverStore, PopoverStoreState } from "./popover-store.ts";

const explicitPopoverAnchors = new WeakMap<PopoverStore, HTMLElement>();

export function markExplicitPopoverAnchor(
  store: PopoverStore,
  element: HTMLElement,
) {
  explicitPopoverAnchors.set(store, element);
}

export function unmarkExplicitPopoverAnchor(
  store: PopoverStore,
  element: HTMLElement,
) {
  if (explicitPopoverAnchors.get(store) !== element) return;
  explicitPopoverAnchors.delete(store);
}

export function isExplicitPopoverAnchor(
  store: PopoverStore,
  element: HTMLElement | null | undefined,
) {
  return !!element && explicitPopoverAnchors.get(store) === element;
}

export function setPopoverDisclosureAnchor(
  store: PopoverStore | undefined,
  element: HTMLElement | null,
) {
  if (!store) return;
  const anchorElement = store.getState().anchorElement;
  if (isExplicitPopoverAnchor(store, anchorElement)) return;
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
