import * as Core from "@ariakit/components/composite/composite-store";
import { getDocument, isTextField } from "@ariakit/utils";
import type { CompositeStore } from "./composite-store.ts";

export const flipItems = Core.flipItems;
export const findFirstEnabledItem = Core.findFirstEnabledItem;
export const groupItemsByRows = Core.groupItemsByRows;

/**
 * Returns the store item with the given id (enabled or not), or `null`.
 */
export function getEnabledItem(store: CompositeStore, id?: string | null) {
  if (!id) return null;
  return store.item(id) || null;
}

/**
 * Selects text field contents even if it's a content editable element.
 */
export function selectTextField(element: HTMLElement, collapseToEnd = false) {
  if (isTextField(element)) {
    element.setSelectionRange(
      collapseToEnd ? element.value.length : 0,
      element.value.length,
    );
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    selection?.selectAllChildren(element);
    if (collapseToEnd) {
      selection?.collapseToEnd();
    }
  }
}

/**
 * Determines whether the element is a composite item.
 */
export function isItem(
  store: CompositeStore,
  element?: Element | null,
  exclude?: Element,
) {
  if (!element) return false;
  if (element === exclude) return false;
  const item = store.item(element.id);
  if (!item) return false;
  if (exclude && item.element === exclude) return false;
  return true;
}
