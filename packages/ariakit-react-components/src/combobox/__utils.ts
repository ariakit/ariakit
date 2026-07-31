import { withDocumentScrollPreserved } from "../composite/utils.ts";
import { centerIntoView } from "./center-into-view.ts";
import type { ComboboxStore } from "./combobox-store.ts";

export function scrollSelectedItemIntoView(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const { contentElement, selectElement, selectedValue } = store.getState();
  if (!selectElement) return;
  if (!contentElement) return;
  const value = Array.isArray(selectedValue)
    ? selectedValue.at(-1)
    : selectedValue;
  if (value == null) return;
  if (store.item(element.id)?.value !== value) return;
  withDocumentScrollPreserved(element, () => {
    centerIntoView(element, contentElement);
  });
}
