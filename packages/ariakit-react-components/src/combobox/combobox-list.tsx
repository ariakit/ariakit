import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
  flatten2DArray,
  reverseArray,
  hasFocusWithin,
  isSelfTarget,
} from "@ariakit/utils";
import type { ElementType, KeyboardEvent } from "react";
import { useState } from "react";
import { findFirstEnabledItem, groupItemsByRows } from "../composite/utils.ts";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";
import type { ComboboxContentOptions } from "./combobox-content.tsx";
import { useComboboxContent } from "./combobox-content.tsx";
import { useComboboxContext } from "./combobox-context.tsx";
import type { ComboboxStoreItem } from "./combobox-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function findFirstEnabledItemInTheLastRow(items: ComboboxStoreItem[]) {
  return findFirstEnabledItem(
    flatten2DArray(reverseArray(groupItemsByRows(items))),
  );
}

// The list's tabIndex depends on whether the content contains focus, so we need
// to update it on native focus transitions.
function useElementFocusWithin(
  element?: HTMLElement | null,
  activeDescendant?: string,
) {
  const [focusWithin, setFocusWithin] = useState(false);

  useSafeLayoutEffect(() => {
    if (!element) {
      setFocusWithin(false);
      return;
    }
    let canceled = false;
    const update = () => {
      if (canceled) return;
      setFocusWithin(hasFocusWithin(element));
    };
    const onFocusIn = () => setFocusWithin(true);
    const onFocusOut = () => {
      // Virtual-focus handoffs may dispatch focusout with no related target.
      // Recompute after the focus sequence instead of treating that as leaving.
      queueMicrotask(update);
    };
    // Virtual focus can move without a DOM focus event, so this also runs when
    // aria-activedescendant changes.
    queueMicrotask(update);
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    return () => {
      canceled = true;
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
    };
  }, [element, activeDescendant]);

  return focusWithin;
}

/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxList({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxList = createHook<TagName, ComboboxListOptions>(
  function useComboboxList({ store, ...props }) {
    const context = useComboboxContext();
    store = store || context;

    const virtualFocus = useStoreState(store, "virtualFocus");
    const baseElement = useStoreState(store, "baseElement");
    const contentElement = useStoreState(store, "contentElement");
    const [listElement, setListElement] = useState<HTMLType | null>(null);
    const activeDescendant = useAttribute(
      baseElement || null,
      "aria-activedescendant",
    );
    const contentFocusWithin = useElementFocusWithin(
      contentElement,
      activeDescendant,
    );
    const listFocusWithin = useElementFocusWithin(
      listElement,
      activeDescendant,
    );

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      // https://github.com/ariakit/ariakit/issues/4388
      if (event.nativeEvent.isComposing) return;
      if (event.defaultPrevented) return;
      if (!store) return;
      if (!isSelfTarget(event)) return;
      const { orientation, renderedItems, activeId } = store.getState();
      // A store may back multiple mounted lists. Restricting movement to this
      // list prevents an active item in another, possibly hidden, list from
      // becoming the next focus target.
      const movementItems = renderedItems.filter(
        (item) => item.element && event.currentTarget.contains(item.element),
      );
      const localActiveId = movementItems.some((item) => item.id === activeId)
        ? activeId
        : null;
      const moveOptions = {
        activeId: localActiveId,
        renderedItems: movementItems,
      };
      const isGrid = movementItems.some((item) => !!item.rowId);
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const first = () => findFirstEnabledItem(movementItems)?.id;
      const last = () => findFirstEnabledItem(reverseArray(movementItems))?.id;
      const up = () => {
        if (isGrid && localActiveId === null) {
          // Match Composite's initial grid entry at the first enabled cell in
          // the last row instead of the last cell in the flattened collection.
          return findFirstEnabledItemInTheLastRow(movementItems)?.id;
        }
        return store.up(moveOptions);
      };
      const keyMap = {
        ArrowUp: (isGrid || isVertical) && up,
        ArrowRight: (isGrid || isHorizontal) && (() => store.next(moveOptions)),
        ArrowDown: (isGrid || isVertical) && (() => store.down(moveOptions)),
        ArrowLeft:
          (isGrid || isHorizontal) && (() => store.previous(moveOptions)),
        Home: first,
        End: last,
        PageUp: first,
        PageDown: last,
      };
      const action = keyMap[event.key as keyof typeof keyMap];
      if (!action) return;
      const id = action();
      if (id === undefined) return;
      event.preventDefault();
      store.move(id);
    });

    // aria-activedescendant may put virtual focus within either this list or a
    // sibling composite. Only the former should keep the list out of Tab order.
    let tabIndex = props.tabIndex;
    if (tabIndex == null && props.focusable !== false) {
      tabIndex =
        virtualFocus && contentFocusWithin && !listFocusWithin ? 0 : -1;
    }
    props = {
      ...props,
      ref: useMergeRefs(setListElement, props.ref),
      tabIndex,
      onKeyDown,
    };
    props = useComboboxContent({ store, ...props });
    props = useFocusable(props);
    return props;
  },
);

/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxList>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxList>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxList = forwardRef(function ComboboxList(
  props: ComboboxListProps,
) {
  const htmlProps = useComboboxList(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxListOptions<T extends ElementType = TagName>
  extends FocusableOptions<T>, ComboboxContentOptions<T> {}

export type ComboboxListProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxListOptions<T>
>;
