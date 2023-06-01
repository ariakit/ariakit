import type { KeyboardEvent } from "react";
import { useContext, useRef } from "react";
import { isTextField } from "@ariakit/core/utils/dom";
import { isSelfTarget } from "@ariakit/core/utils/events";
import { invariant, normalizeString } from "@ariakit/core/utils/misc";
import { useEvent } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { CompositeContext } from "./composite-context.js";
import type { CompositeStore, CompositeStoreItem } from "./composite-store.js";
import { flipItems } from "./utils.js";

let chars = "";

function clearChars() {
  chars = "";
}

function isValidTypeaheadEvent(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  if (target && isTextField(target)) return false;
  // If the spacebar is pressed, we'll only consider it a valid typeahead event
  // if there were already other characters typed.
  if (event.key === " " && chars.length) return true;
  return (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    /^[\p{Letter}\p{Number}]$/u.test(event.key)
  );
}

function isSelfTargetOrItem(event: KeyboardEvent, items: CompositeStoreItem[]) {
  if (isSelfTarget(event)) return true;
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const isItem = items.some((item) => item.element === target);
  return isItem;
}

function getEnabledItems(items: CompositeStoreItem[]) {
  return items.filter((item) => !item.disabled);
}

function itemTextStartsWith(item: CompositeStoreItem, text: string) {
  const itemText = item.element?.textContent || item.children;
  if (!itemText) return false;
  return normalizeString(itemText)
    .trim()
    .toLowerCase()
    .startsWith(text.toLowerCase());
}

function getSameInitialItems(
  items: CompositeStoreItem[],
  char: string,
  activeId?: string | null
) {
  if (!activeId) return items;
  const activeItem = items.find((item) => item.id === activeId);
  if (!activeItem) return items;
  if (!itemTextStartsWith(activeItem, char)) return items;
  // Typing "oo" will match "oof" instead of moving to the next item.
  if (chars !== char && itemTextStartsWith(activeItem, chars)) return items;
  // If we're looping through the items, we'll want to reset the chars so "oo"
  // becomes just "o".
  chars = char;
  // flipItems will put the previous items at the end of the list so we can loop
  // through them.
  return flipItems(
    items.filter((item) => itemTextStartsWith(item, chars)),
    activeId
  ).filter((item) => item.id !== activeId);
}

/**
 * Returns props to create a `CompositeTypeahead` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeTypeahead({ store });
 * <Composite store={store} {...props}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const useCompositeTypeahead = createHook<CompositeTypeaheadOptions>(
  ({ store, typeahead = true, ...props }) => {
    const context = useContext(CompositeContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "CompositeTypeahead must be a Composite component"
    );

    const onKeyDownCaptureProp = props.onKeyDownCapture;
    const cleanupTimeoutRef = useRef(0);

    // We have to listen to the event in the capture phase because the event
    // might be handled by a child component. For example, the space key may
    // trigger a click event on a child component. We need to prevent this
    // behavior if the character is a valid typeahead key.
    const onKeyDownCapture = useEvent(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownCaptureProp?.(event);
        if (event.defaultPrevented) return;
        if (!typeahead) return;
        if (!store) return;
        const { items, activeId } = store.getState();
        if (!isValidTypeaheadEvent(event)) return clearChars();
        let enabledItems = getEnabledItems(items);
        if (!isSelfTargetOrItem(event, enabledItems)) return clearChars();
        event.preventDefault();
        // We need to clear the previous cleanup timeout so we can append the
        // pressed char to the existing one.
        window.clearTimeout(cleanupTimeoutRef.current);
        // Schedule a new cleanup timeout. After a short delay we'll reset the
        // characters so the next one counts as a new start character.
        cleanupTimeoutRef.current = window.setTimeout(() => {
          chars = "";
        }, 500);
        // Always consider the lowercase version of the key.
        const char = event.key.toLowerCase();
        chars += char;
        enabledItems = getSameInitialItems(enabledItems, char, activeId);
        const item = enabledItems.find((item) =>
          itemTextStartsWith(item, chars)
        );
        if (item) {
          store.move(item.id);
        } else {
          // Immediately clear the characters so the next keypress starts a new
          // search.
          clearChars();
        }
      }
    );

    props = {
      ...props,
      onKeyDownCapture,
    };

    return props;
  }
);

/**
 * Renders a component that adds typeahead functionality to composite
 * components.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite} render={<CompositeTypeahead />}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const CompositeTypeahead = createComponent<CompositeTypeaheadOptions>(
  (props) => {
    const htmlProps = useCompositeTypeahead(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  CompositeTypeahead.displayName = "CompositeTypeahead";
}

export interface CompositeTypeaheadOptions<T extends As = "div">
  extends Options<T> {
  /**
   * Object returned by the `useCompositeStore` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  store?: CompositeStore;
  /**
   * Determines whether the typeahead behavior is enabled.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * @default true
   */
  typeahead?: boolean;
}

export type CompositeTypeaheadProps<T extends As = "div"> = Props<
  CompositeTypeaheadOptions<T>
>;
