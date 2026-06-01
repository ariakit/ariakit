import * as Core from "@ariakit/components/composite/composite-store";
import { getDocument, isTextField } from "@ariakit/utils";
import type { CompositeStore } from "./composite-store.ts";

export const flipItems = Core.flipItems;
export const findFirstEnabledItem = Core.findFirstEnabledItem;
export const groupItemsByRows = Core.groupItemsByRows;

/**
 * Finds the first enabled item by its id.
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

const FOCUS_SILENTLY = Symbol("FOCUS_SILENTLY");
type FocusSilentlyElement = HTMLElement & { [FOCUS_SILENTLY]?: boolean };

/**
 * Focus an element with a flag. The `silentlyFocused` function needs to be
 * called later to check if the focus was silenced and to reset this state.
 */
export function focusSilently(element: FocusSilentlyElement) {
  element[FOCUS_SILENTLY] = true;
  element.focus({ preventScroll: true });
}

/**
 * Checks whether the element has been focused with the `focusSilently` function
 * and resets the state.
 */
export function silentlyFocused(element: FocusSilentlyElement) {
  const isSilentlyFocused = element[FOCUS_SILENTLY];
  delete element[FOCUS_SILENTLY];
  return isSilentlyFocused;
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
