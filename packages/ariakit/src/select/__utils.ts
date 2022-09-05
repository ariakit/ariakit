import { createContext } from "react";
import { createStoreContext } from "ariakit-react-utils/store";
import { CompositeState } from "../composite/composite-state";
import { SelectState } from "./select-state";

export type Item = CompositeState["items"][number] & {
  value?: string;
};

export const SelectItemCheckedContext = createContext(false);

export const SelectContext = createStoreContext<SelectState>();

export function findFirstEnabledItemWithValue(items: Item[]) {
  return items.find((item) => item.value != null && !item.disabled);
}

export function findEnabledItemWithValueById(items: Item[], id: string) {
  return items.find(
    (item) => item.value != null && item.id === id && !item.disabled
  );
}

export function findEnabledItemByValue(items: Item[], value: string) {
  return items.find((item) => item.value === value && !item.disabled);
}
