import { KeyboardEvent, useCallback, useContext, useRef } from "react";
import { isSelfTarget } from "ariakit-utils/events";
import { useEventCallback, useLiveRef } from "ariakit-utils/hooks";
import { normalizeString } from "ariakit-utils/misc";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { CompositeContext, Item, flipItems } from "./__utils";
import { CompositeState } from "./composite-state";

let chars = "";

function isValidTypeaheadEvent(event: KeyboardEvent) {
  // If the spacebar is pressed, we'll only consider it a valid typeahead event
  // if there were already other characters typed.
  if (event.key === " " && chars.length) return true;
  return (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    // TODO: We may need to revisit this arabic pattern.
    /^[ا-يa-z0-9_-]$/i.test(event.key)
  );
}

function isSelfTargetOrItem(event: KeyboardEvent, items: Item[]) {
  if (isSelfTarget(event)) return true;
  const target = event.target as HTMLElement | null;
  if (!target) return false;
  const isItem = items.some((item) => item.ref.current === target);
  return isItem;
}

function getEnabledItems(items: Item[]) {
  return items.filter((item) => !item.disabled);
}

function itemTextStartsWith(text: string) {
  return (item: Item) => {
    const itemText = item.ref.current?.textContent;
    if (!itemText) return false;
    return normalizeString(itemText)
      .toLowerCase()
      .startsWith(text.toLowerCase());
  };
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to add typeahead functionality to composite components.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeTypeahead({ state });
 * <Composite state={state} {...props}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const useCompositeTypeahead = createHook<CompositeTypeaheadOptions>(
  ({ state, typeahead = true, ...props }) => {
    const context = useContext(CompositeContext);
    state = state || context;
    const onKeyDownCaptureProp = useEventCallback(props.onKeyDownCapture);
    const cleanupTimeoutRef = useRef(0);
    const activeIdRef = useLiveRef(state?.activeId);

    // We have to listen to the event in the capture phase because the event
    // might be handled by a child component. For example, the space key may
    // trigger a click event on a child component. We need to prevent this
    // behavior if the character is a valid typeahead key.
    const onKeyDownCapture = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownCaptureProp(event);
        if (event.defaultPrevented) return;
        if (!typeahead) return;
        if (!state?.items) return;
        if (!isValidTypeaheadEvent(event)) return;
        let items = getEnabledItems(state.items);
        if (!isSelfTargetOrItem(event, items)) return;
        event.preventDefault();
        // We need to clear the previous cleanup timeout so we can append the
        // pressed char to the existing one.
        window.clearTimeout(cleanupTimeoutRef.current);
        // Schedule a new cleanup timeout. After a short delay we'll reset the
        // characters so the next one counts as a new start character.
        cleanupTimeoutRef.current = window.setTimeout(() => {
          chars = "";
        }, 500);
        const char = event.key.toLowerCase();
        chars += char;

        const activeId = activeIdRef.current;
        const activeItem = state.items.find((item) => item.id === activeId);
        if (
          activeId &&
          activeItem &&
          itemTextStartsWith(char)(activeItem) &&
          (chars === char || !itemTextStartsWith(chars)(activeItem))
        ) {
          chars = char;
          items = flipItems(items, activeId).filter(
            (item) => item.id !== activeId
          );
        }

        const item = items.find(itemTextStartsWith(chars));
        if (item) {
          state.move(item.id);
        } else {
          // Immediately clear the characters so the next keypress starts a new
          // search.
          chars = "";
        }
      },
      [onKeyDownCaptureProp, typeahead, state?.items, state?.move]
    );

    props = {
      ...props,
      onKeyDownCapture,
    };

    return props;
  }
);

/**
 * A component that adds typeahead functionality to composite components.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite} as={CompositeTypeahead}>
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

export type CompositeTypeaheadOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCompositeState` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  state?: CompositeState;
  /**
   * Determines whether the typeahead behavior is enabled.
   * @default true
   */
  typeahead?: boolean;
};

export type CompositeTypeaheadProps<T extends As = "div"> = Props<
  CompositeTypeaheadOptions<T>
>;
