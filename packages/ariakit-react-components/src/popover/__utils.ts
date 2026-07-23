import type { PopoverStoreState } from "./popover-store.ts";

export type Placement = PopoverStoreState["placement"];

type BasePlacementOf<T extends string> = T extends `${infer Base}-${string}`
  ? Base
  : T;

export type BasePlacement = BasePlacementOf<Placement>;

export function getBasePlacement(placement: Placement) {
  // Every Placement union member starts with its base side.
  return placement.split("-")[0] as BasePlacement;
}
