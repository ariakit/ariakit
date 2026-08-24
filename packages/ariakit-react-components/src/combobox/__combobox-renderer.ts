import { toArray } from "@ariakit/utils";
import type { ComboboxStoreSelectedValue } from "./combobox-store.ts";

export const defaultSelectedValuePersistenceLimit = 32;

export function getPersistentSelectedValues(
  selectedValue: ComboboxStoreSelectedValue,
  limit = defaultSelectedValuePersistenceLimit,
) {
  if (Number.isNaN(limit)) {
    limit = defaultSelectedValuePersistenceLimit;
  } else if (limit !== Infinity) {
    limit = Math.max(0, Math.floor(limit));
  }

  const values = toArray(selectedValue);
  if (!limit) return [];
  if (limit === Infinity) return values;
  return values.slice(-limit);
}
