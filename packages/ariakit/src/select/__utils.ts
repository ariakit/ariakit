import { createContext } from "react";
import { createStoreContext } from "ariakit-react-utils/store";
import { CompositeState } from "../composite/composite-state";
import { SelectState } from "./select-state";

export type SelectStateItem = CompositeState["items"][number] & {
  value?: string;
};

export const SelectItemCheckedContext = createContext(false);

export const SelectContext = createStoreContext<SelectState>();

export function findFirstEnabledItemWithValue(items: SelectStateItem[]) {
  return items.find((item) => item.value != null && !item.disabled);
}

export function findEnabledItemWithValueById(
  items: SelectStateItem[],
  id: string
) {
  return items.find(
    (item) => item.value != null && item.id === id && !item.disabled
  );
}

export function findEnabledItemByValue(
  items: SelectStateItem[],
  value: string
) {
  return items.find((item) => item.value === value && !item.disabled);
}
