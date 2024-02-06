import type { ElementType, KeyboardEvent } from "react";
import { useRef } from "react";
import { isTextField } from "@ariakit/core/utils/dom";
import { isSelfTarget } from "@ariakit/core/utils/events";
import {
  invariant,
  normalizeString,
  removeUndefinedValues,
} from "@ariakit/core/utils/misc";
import { useEvent } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import { useCompositeContext } from "./composite-context.js";
import type { CompositeStore, CompositeStoreItem } from "./composite-store.js";
import { flipItems } from "./utils.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
  const itemText =
    item.textContent || item.element?.textContent || item.children;
  if (!itemText) return false;
  return normalizeString(itemText)
    .trim()
    .toLowerCase()
    .startsWith(text.toLowerCase());
}

function getSameInitialItems(
  items: CompositeStoreItem[],
  char: string,
  activeId?: string | null,
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
    activeId,
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
export const useCompositeTypeahead = createHook<
  TagName,
  CompositeTypeaheadOptions
>(function useCompositeTypeahead({ store, typeahead = true, ...props }) {
  const context = useCompositeContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "CompositeTypeahead must be a Composite component",
  );

  const onKeyDownCaptureProp = props.onKeyDownCapture;
  const cleanupTimeoutRef = useRef(0);

  // We have to listen to the event in the capture phase because the event
  // might be handled by a child component. For example, the space key may
  // trigger a click event on a child component. We need to prevent this
  // behavior if the character is a valid typeahead key.
  const onKeyDownCapture = useEvent((event: KeyboardEvent<HTMLType>) => {
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
    const item = enabledItems.find((item) => itemTextStartsWith(item, chars));
    if (item) {
      store.move(item.id);
    } else {
      // Immediately clear the characters so the next keypress starts a new
      // search.
      clearChars();
    }
  });

  props = {
    ...props,
    onKeyDownCapture,
  };

  return removeUndefinedValues(props);
});

/**
 * Renders a component that adds typeahead functionality to composite
 * components.
 *
 * When the
 * [`typeahead`](https://ariakit.org/reference/composite-typeahead#typeahead)
 * prop is enabled, which it is by default, hitting printable character keys
 * will move focus to the next composite item that begins with the input
 * characters.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * <CompositeProvider>
 *   <Composite render={<CompositeTypeahead />}>
 *     <CompositeItem>Item 1</CompositeItem>
 *     <CompositeItem>Item 2</CompositeItem>
 *   </Composite>
 * </CompositeProvider>
 * ```
 */
export const CompositeTypeahead = forwardRef(function CompositeTypeahead(
  props: CompositeTypeaheadProps,
) {
  const htmlProps = useCompositeTypeahead(props);
  return createElement(TagName, htmlProps);
});

export interface CompositeTypeaheadOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook. If not provided, the closest
   * [`Composite`](https://ariakit.org/reference/composite) or
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * components' context will be used.
   */
  store?: CompositeStore;
  /**
   * When enabled, pressing printable character keys shifts focus to the next
   * composite item that begins with the input characters.
   *
   * This feature uses the
   * [`textContent`](https://ariakit.org/reference/composite-item#textcontent)
   * prop of the items to match the characters. If the items lack a
   * [`textContent`](https://ariakit.org/reference/composite-item#textcontent)
   * prop, the HTML element's `textContent` is used.
   * @default true
   */
  typeahead?: boolean;
}

export type CompositeTypeaheadProps<T extends ElementType = TagName> = Props<
  T,
  CompositeTypeaheadOptions<T>
>;
