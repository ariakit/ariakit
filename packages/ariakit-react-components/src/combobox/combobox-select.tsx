import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
  afterPaint,
  toArray,
  getPopupRole,
  queueBeforeEvent,
  invariant,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, KeyboardEvent, SelectHTMLAttributes } from "react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { withDefaultButtonType } from "../button/utils.ts";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import { useCompositeTypeahead } from "../composite/composite-typeahead.tsx";
import { useComposite } from "../composite/composite.tsx";
import { getBasePlacement } from "../popover/__utils.ts";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import { usePopoverDisclosure } from "../popover/popover-disclosure.tsx";
import { getVisuallyHiddenStyle } from "../visually-hidden/visually-hidden.tsx";
import {
  ComboboxScopedContextProvider,
  useComboboxProviderContext,
} from "./combobox-context.tsx";
import { ComboboxSelectArrow } from "./combobox-select-arrow.tsx";
import { ComboboxSelectedValue } from "./combobox-selected-value.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getSelectedValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

// When moving through the items while the select list is closed, we don't want
// to move to items without value, so we filter them out here.
function nextWithValue(store: ComboboxStore, next: ComboboxStore["next"]) {
  return () => {
    const visitedIds = new Set<string>();
    let nextId = next();
    while (nextId) {
      const nextItem = store.item(nextId);
      if (!nextItem) return;
      if (nextItem.value != null) {
        return nextItem.id;
      }
      // Walking from the last returned id, as if the key was pressed again
      // from there, skips items without value even across focusLoop
      // boundaries. A repeated id means the walk cycled through every
      // reachable item without finding one with value, so we return undefined
      // to keep move() from changing the active item.
      if (visitedIds.has(nextId)) return;
      visitedIds.add(nextId);
      nextId = next({ activeId: nextId });
    }
    return;
  };
}

function scrollItemIntoView(element: HTMLElement) {
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
}

/**
 * Renders nothing and keeps the active item visible while focus stays on the
 * select or input. Composite scrolls items after move(), but the combobox store
 * can restore `activeId` directly, and the corresponding element may render
 * asynchronously.
 */
const ComboboxSelectScrollIntoView = memo(
  function ComboboxSelectScrollIntoView({ store }: { store: ComboboxStore }) {
    const activeElement = useStoreState(
      store,
      ["activeId", "items", "open"],
      (state) => {
        if (!state.open) return null;
        return store.item(state.activeId)?.element;
      },
    );
    const contentElement = useStoreState(store, "contentElement");

    useSafeLayoutEffect(() => {
      if (!activeElement) return;
      let cancelScroll = () => {};
      const scroll = () => {
        cancelScroll = afterPaint(() => {
          // Let offscreen observers initialize before the first scroll. This
          // may render adjacent items, so correct the position after they
          // affect the layout.
          cancelScroll = afterPaint(() => {
            scrollItemIntoView(activeElement);
            cancelScroll = afterPaint(() => {
              scrollItemIntoView(activeElement);
            });
          });
        });
      };
      if (!contentElement?.hasAttribute("data-placing")) {
        scroll();
        return cancelScroll;
      }
      const observer = new MutationObserver(() => {
        if (contentElement.hasAttribute("data-placing")) return;
        observer.disconnect();
        scroll();
      });
      observer.observe(contentElement, { attributeFilter: ["data-placing"] });
      return () => {
        observer.disconnect();
        cancelScroll();
      };
    }, [activeElement, contentElement]);

    return null;
  },
);

/**
 * Returns props to create a `ComboboxSelect` component.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxSelect = createHook<TagName, ComboboxSelectOptions>(
  function useComboboxSelect({
    store,
    name,
    form,
    required,
    showOnKeyDown = true,
    moveOnKeyDown = true,
    toggleOnClick = true,
    focusable = true,
    ...props
  }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxSelect must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const onKeyDownProp = props.onKeyDown;
    const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);
    const moveOnKeyDownProp = useBooleanEvent(moveOnKeyDown);
    const placement = useStoreState(store, "placement");
    const dir = getBasePlacement(placement);
    const selectedValue = useStoreState(store, "selectedValue");
    const multiSelectable = Array.isArray(selectedValue);
    const inputElement = useStoreState(store, "inputElement");

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const { orientation, items, activeId } = store.getState();
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const isGrid = !!items.find(
        (item) => !item.disabled && item.value != null,
      )?.rowId;
      const moveKeyMap = {
        ArrowUp: (isGrid || isVertical) && nextWithValue(store, store.up),
        ArrowRight:
          (isGrid || isHorizontal) && nextWithValue(store, store.next),
        ArrowDown: (isGrid || isVertical) && nextWithValue(store, store.down),
        ArrowLeft:
          (isGrid || isHorizontal) && nextWithValue(store, store.previous),
      };
      const getId = moveKeyMap[event.key as keyof typeof moveKeyMap];
      if (getId && moveOnKeyDownProp(event)) {
        event.preventDefault();
        store.move(getId());
      }
      const isTopOrBottom = dir === "top" || dir === "bottom";
      const isLeft = dir === "left";
      const isRight = dir === "right";
      const canShowKeyMap = {
        ArrowDown: isTopOrBottom,
        ArrowUp: isTopOrBottom,
        ArrowLeft: isLeft,
        ArrowRight: isRight,
      };
      const canShow = canShowKeyMap[event.key as keyof typeof canShowKeyMap];
      if (canShow && showOnKeyDownProp(event)) {
        event.preventDefault();
        store.move(activeId);
        queueBeforeEvent(event.currentTarget, "keyup", store.show);
      }
    });

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxScopedContextProvider value={store}>
          {element}
          <ComboboxSelectScrollIntoView store={store} />
        </ComboboxScopedContextProvider>
      ),
      [store],
    );

    const [autofill, setAutofill] = useState(false);
    const nativeSelectChangedRef = useRef(false);

    // Resets the autofilled state when the selected value changes, but only if
    // the change wasn't triggered by the native select element.
    useEffect(() => {
      const nativeSelectChanged = nativeSelectChangedRef.current;
      nativeSelectChangedRef.current = false;
      if (nativeSelectChanged) return;
      setAutofill(false);
    }, [selectedValue]);

    const labelElement = useStoreState(store, "selectLabelElement");
    useAttribute(labelElement, "id");
    const labelId = labelElement?.id;
    const label = props["aria-label"];
    const labelledBy = props["aria-labelledby"] || labelId;
    const items = useStoreState(store, ["items"], (state) => {
      if (!name) return;
      return state.items;
    });
    const values = useMemo(() => {
      // Filter out items without value and duplicate values.
      const itemValues = items?.flatMap((item) => item.value ?? []);
      return [...new Set(itemValues)];
    }, [items]);

    // Renders a native select element with the same value as the custom select
    // so browser autofill can update the combobox store.
    props = useWrapElement(
      props,
      (element) => {
        if (!name) return element;
        return (
          <>
            <select
              style={getVisuallyHiddenStyle()}
              tabIndex={-1}
              aria-hidden
              aria-label={label}
              aria-labelledby={label != null ? undefined : labelledBy}
              name={name}
              form={form}
              required={required}
              disabled={props.disabled}
              value={selectedValue}
              multiple={multiSelectable}
              // Although visually hidden and not tabbable, this element remains
              // focusable. Some autofill extensions move focus to the next form
              // element, so redirect it to the custom select.
              onFocus={() => store?.getState().selectElement?.focus()}
              onChange={(event) => {
                nativeSelectChangedRef.current = true;
                setAutofill(true);
                store?.setSelectedValue(
                  multiSelectable
                    ? getSelectedValues(event.target)
                    : event.target.value,
                );
              }}
            >
              {toArray(selectedValue).map((value) => {
                if (value == null) return null;
                if (values.includes(value)) return null;
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
              {values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {element}
          </>
        );
      },
      [
        store,
        label,
        labelledBy,
        name,
        form,
        required,
        selectedValue,
        multiSelectable,
        values,
        props.disabled,
      ],
    );

    const children = (
      <>
        <ComboboxSelectedValue />
        <ComboboxSelectArrow />
      </>
    );
    const contentElement = useStoreState(store, "contentElement");

    props = {
      role: "combobox",
      "aria-autocomplete": "none",
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "data-autofill": autofill || undefined,
      "data-name": name,
      children,
      ...props,
      ref: useMergeRefs(store.setSelectElement, props.ref),
      onKeyDown,
    };

    props = usePopoverDisclosure({
      store,
      toggleOnClick,
      focusable,
      ...props,
    });
    props = useCompositeTypeahead<TagName>({ store, ...props });
    const onKeyDownCaptureProp = props.onKeyDownCapture;
    const onKeyUpCaptureProp = props.onKeyUpCapture;
    props = useComposite<TagName>({
      store,
      composite: !inputElement,
      focusable,
      moveOnKeyPress: false,
      ...props,
    });
    const onCompositeKeyDownCapture = props.onKeyDownCapture;
    const onCompositeKeyUpCapture = props.onKeyUpCapture;
    props = {
      ...props,
      onKeyDownCapture(event) {
        if (store.getState().open && !inputElement) {
          onCompositeKeyDownCapture?.(event);
        } else {
          onKeyDownCaptureProp?.(event);
        }
      },
      onKeyUpCapture(event) {
        if (store.getState().open && !inputElement) {
          onCompositeKeyUpCapture?.(event);
        } else {
          onKeyUpCaptureProp?.(event);
        }
      },
    };

    return props;
  },
);

/**
 * Renders a custom select element that controls the visibility of a
 * [`ComboboxList`](https://ariakit.com/reference/combobox-list) or
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).
 *
 * By default, the combobox store's
 * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
 * state is rendered as the children, followed by a
 * [`ComboboxSelectArrow`](https://ariakit.com/reference/combobox-select-arrow).
 * @example
 * ```jsx {2}
 * <ComboboxProvider>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 * @see https://ariakit.com/components/combobox
 */
export const ComboboxSelect = forwardRef(function ComboboxSelect(
  props: ComboboxSelectProps,
) {
  const htmlProps = useComboboxSelect(withDefaultButtonType(props));
  return createElement(TagName, htmlProps);
});

export interface ComboboxSelectOptions<T extends ElementType = TagName>
  extends
    PopoverDisclosureOptions<T>,
    CompositeTypeaheadOptions<T>,
    Pick<
      SelectHTMLAttributes<HTMLSelectElement>,
      "name" | "form" | "required"
    > {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * Whether arrow keys show the combobox popover.
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Whether arrow keys move through items while the popover is hidden.
   * @default true
   */
  moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
}

export type ComboboxSelectProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSelectOptions<T>
>;
