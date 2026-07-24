import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useBooleanEvent,
  useEvent,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import {
  getPopupRole,
  getWindow,
  invariant,
  queueBeforeEvent,
  toArray,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type {
  ElementType,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { findNextPageItemId } from "../composite/composite-item.tsx";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import { useCompositeTypeahead } from "../composite/composite-typeahead.tsx";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.tsx";
import { useDialogDisclosure } from "../dialog/dialog-disclosure.tsx";
import { getBasePlacement } from "../popover/__utils.ts";
import { PopoverScopedContextProvider } from "../popover/popover-context.tsx";
import { PopoverDisclosureArrow } from "../popover/popover-disclosure-arrow.tsx";
import { getVisuallyHiddenStyle } from "../visually-hidden/visually-hidden.tsx";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type {
  ComboboxStore,
  ComboboxStoreSelectedValue,
} from "./combobox-store.ts";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getSelectedValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function hasSelectedValue(
  value: ComboboxStoreSelectedValue | null | undefined,
) {
  return !!value?.length;
}

// When moving through the items when the select popover is closed, we don't
// want to move to items without value, so we filter them out here. This
// mirrors the same helper in select.tsx.
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

// Unlike scrollIntoViewIfNeeded from @ariakit/utils, this restores the window
// scroll position afterward so revealing the item only scrolls the popover,
// never the page, which may not have been repositioned yet at this point.
function scrollIntoView(element: Element) {
  if (!("scrollIntoView" in element)) return;
  const win = getWindow(element);
  const { scrollX, scrollY } = win;
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (win.scrollX === scrollX && win.scrollY === scrollY) return;
  win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
}

interface ComboboxSelectOption {
  value: string;
  label: string;
}

/**
 * Returns props to create a `ComboboxSelect` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider defaultSelectedValue="Apple" resetValueOnHide>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <Combobox autoSelect placeholder="Search..." />
 *     <ComboboxList>
 *       <ComboboxItem value="Apple" />
 *       <ComboboxItem value="Orange" />
 *     </ComboboxList>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const useComboboxSelect = createHook<TagName, ComboboxSelectOptions>(
  function useComboboxSelect({
    store,
    name,
    form,
    required,
    fallback,
    showOnKeyDown = true,
    moveOnKeyDown = true,
    toggleOnClick,
    ...props
  }) {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxSelect must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const scrollSelectedItemOnShowRef = useRef(false);

    useSafeLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;
      store.setSelectElement(element);
      store.setDisclosureElement(element);
      store.setAnchorElement(element);
      return () => {
        const { anchorElement, baseElement, disclosureElement, selectElement } =
          store.getState();
        if (selectElement === element) {
          store.setSelectElement(null);
        }
        if (disclosureElement === element) {
          store.setDisclosureElement(baseElement);
        }
        if (anchorElement === element) {
          store.setAnchorElement(baseElement);
        }
      };
    }, [store]);

    useEffect(() => {
      // Tracks whether the activeId state must be resolved again right after
      // the popover opens. When the popover unmounts its contents on hide, the
      // item ids assigned while it was closed no longer exist on the next
      // open, so the selected item must be found again once the items
      // re-register.
      let resolveOnOpen = false;
      return sync(
        store,
        ["open", "items", "selectedValue", "selectElement"],
        (state) => {
          if (!state.selectElement) return;
          const hasValue = hasSelectedValue(state.selectedValue);
          const values = toArray(state.selectedValue);
          const value = values[values.length - 1];
          if (state.open) {
            if (!resolveOnOpen) return;
            if (!state.items.length) return;
            resolveOnOpen = false;
            // Keep the current activeId if it still points to a registered
            // item, which means the popover contents remained mounted while
            // closed or the user has already moved to another item.
            if (store.item(store.getState().activeId)) return;
          } else {
            resolveOnOpen = true;
            // While closed, only the selected item is resolved, so the first
            // arrow key press on an empty select still moves to (and selects)
            // the first item, as it does with Select.
            if (!hasValue) return;
            if (value == null) return;
          }
          const item =
            hasValue && value != null
              ? state.items.find((item) => {
                  if (item.disabled) return false;
                  return item.value === value;
                })
              : // With no selected value, the first enabled item is
                // highlighted when an input-less popover opens, matching
                // Select. A combobox input holds the virtual focus position
                // instead, so nothing is highlighted for it until the user
                // interacts.
                store.getState().baseElement
                ? undefined
                : state.items.find((item) => !item.disabled);
          if (!item) return;
          store.setActiveId(item.id);
        },
      );
    }, [store]);

    // Mirrors the select store's value-on-move behavior: while the popover is
    // closed, moving the active item (arrow keys, typeahead) updates the
    // selected value like a native single-select. The moves count — rather
    // than the activeId state — is watched so programmatic setActiveId calls,
    // like the selected item resolution above, don't change the selection.
    useEffect(() => {
      return sync(store, ["moves"], (state) => {
        if (!state.moves) return;
        const { mounted, selectedValue, activeId } = store.getState();
        if (mounted) return;
        if (Array.isArray(selectedValue)) return;
        const item = store.item(activeId);
        if (!item || item.disabled || item.value == null) return;
        store.setSelectedValue(item.value);
      });
    }, [store]);

    const selectedValue = useStoreState(store, "selectedValue");
    const items = useStoreState(store, "items");
    const open = useStoreState(store, "open");
    const contentElement = useStoreState(store, "contentElement");
    // In a standard (input-less) select, DOM focus stays on this element while
    // the popover is open, so it must expose the virtually focused item
    // through aria-activedescendant, as the Combobox input does in a
    // filterable select.
    const activeDescendantId = useStoreState(store, (state) =>
      state.open && !state.baseElement
        ? (state.activeId ?? undefined)
        : undefined,
    );
    const selectLabelElement = useStoreState(store, "selectLabelElement");
    useAttribute(selectLabelElement, "id");
    const labelId = selectLabelElement?.id;
    const label = props["aria-label"];
    const labelledBy = props["aria-labelledby"] || labelId;
    const optionMapRef = useRef<ReadonlyMap<string, ComboboxSelectOption>>(
      new Map(),
    );

    const { options, selectedOptions, optionMap } = useMemo(() => {
      // The previous map is only read here, never mutated, so a render that
      // React discards can't corrupt it. It carries the labels of selected
      // values whose items are currently filtered out or unmounted.
      const previousOptionMap = optionMapRef.current;
      const optionMap = new Map<string, ComboboxSelectOption>();
      const selectedValues = toArray(selectedValue);
      const selectedSet = new Set(selectedValues);
      const currentOptions: ComboboxSelectOption[] = [];

      for (const item of items) {
        const { value } = item;
        if (value == null) continue;
        if (optionMap.has(value)) continue;
        if (item.disabled && !selectedSet.has(value)) continue;

        const option = { value, label: item.children ?? value };

        optionMap.set(value, option);

        if (!item.disabled) {
          currentOptions.push(option);
        }
      }

      for (const value of selectedValues) {
        if (optionMap.has(value)) continue;
        const option = previousOptionMap.get(value) ?? { value, label: value };
        optionMap.set(value, option);
      }

      const selectedOptions = selectedValues.map((value) => {
        const option = optionMap.get(value);
        if (option) return option;
        return { value, label: value };
      });

      const options = [...selectedOptions];
      for (const option of currentOptions) {
        if (selectedSet.has(option.value)) continue;
        options.push(option);
      }

      return { options, selectedOptions, optionMap };
    }, [items, selectedValue]);

    // Persist the resolved labels only after the render is committed.
    useEffect(() => {
      optionMapRef.current = optionMap;
    }, [optionMap]);

    const [autofill, setAutofill] = useState(false);
    const nativeSelectChangedRef = useRef(false);

    // Scrolls the selected item into view the next time the popover opens.
    useSafeLayoutEffect(() => {
      if (!open) {
        scrollSelectedItemOnShowRef.current = true;
        return;
      }
      if (!scrollSelectedItemOnShowRef.current) return;
      if (!hasSelectedValue(selectedValue)) {
        scrollSelectedItemOnShowRef.current = false;
        return;
      }
      const values = toArray(selectedValue);
      const value = values[values.length - 1];
      if (value == null) {
        scrollSelectedItemOnShowRef.current = false;
        return;
      }
      const item = items.find((item) => {
        if (item.disabled) return false;
        return item.value === value;
      });
      const element = item?.element;
      if (!element) return;
      scrollIntoView(element);
      scrollSelectedItemOnShowRef.current = false;
    }, [items, open, selectedValue]);

    // Resets the autofilled state when the selected value changes, but only if
    // the change wasn't triggered by the native select element (an autofill).
    useEffect(() => {
      const nativeSelectChanged = nativeSelectChangedRef.current;
      nativeSelectChangedRef.current = false;
      if (nativeSelectChanged) return;
      setAutofill(false);
    }, [selectedValue]);

    // Renders a visually hidden native select element with the same value as
    // the combobox so we support form submission and browser autofill. When
    // the native select value changes, the onChange event is triggered and we
    // set the autofill state to true.
    props = useWrapElement(
      props,
      (element) => {
        if (!name) return element;
        const multiSelectable = Array.isArray(selectedValue);
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
              // Even though this element is visually hidden and is not
              // tabbable, it's still focusable. Some autofill extensions like
              // 1password will move focus to the next form element on autofill.
              // In this case, we want to move focus to our custom select
              // element.
              onFocus={() => ref.current?.focus()}
              onChange={(event) => {
                nativeSelectChangedRef.current = true;
                setAutofill(true);
                store.setSelectedValue(
                  multiSelectable
                    ? getSelectedValues(event.currentTarget)
                    : event.currentTarget.value,
                );
              }}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {element}
          </>
        );
      },
      [
        form,
        label,
        labelledBy,
        name,
        options,
        props.disabled,
        required,
        selectedValue,
        store,
      ],
    );

    const displayValue = hasSelectedValue(selectedValue)
      ? selectedOptions.map((option) => option.label).join(", ")
      : fallback;

    const defaultChildren = (
      <>
        {displayValue}
        <PopoverDisclosureArrow store={store} />
      </>
    );

    const children = props.children ?? defaultChildren;

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      store.setAnchorElement(event.currentTarget);
      onClickProp?.(event);
    });

    const onKeyDownProp = props.onKeyDown;
    const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);
    const moveOnKeyDownProp = useBooleanEvent(moveOnKeyDown);
    const placement = useStoreState(store, "placement");
    const dir = getBasePlacement(placement);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      const { open, baseElement, activeId, orientation, items } =
        store.getState();
      // In a standard (input-less) select, this element keeps DOM focus while
      // the popover is open, so it drives the listbox with virtual focus, as
      // the Combobox input would in a filterable select. The key mapping
      // mirrors CompositeItem's, which handles these keys when the active item
      // itself receives the keyboard events.
      if (open && !baseElement) {
        const activeItem = store.item(activeId);
        const isGrid = !!activeItem?.rowId;
        const isVertical = orientation !== "horizontal";
        const isHorizontal = orientation !== "vertical";
        // A null return points to the combobox input position. There's no
        // input to land on in an input-less select, so the same movement is
        // resolved again without the base element stop, which yields the
        // store's own focusLoop/focusWrap target, like a column-aware wrap on
        // grids. Paging is the exception below: it never resolves the base
        // position, clamping at the boundaries like a native select.
        const nextWithoutBase = (next: ComboboxStore["next"]) => () => {
          const nextId = next();
          if (nextId !== null) return nextId;
          return next({ includesBaseElement: false });
        };
        const nextKeyMap = {
          ArrowUp: (isGrid || isVertical) && nextWithoutBase(store.up),
          ArrowRight: (isGrid || isHorizontal) && nextWithoutBase(store.next),
          ArrowDown: (isGrid || isVertical) && nextWithoutBase(store.down),
          ArrowLeft:
            (isGrid || isHorizontal) && nextWithoutBase(store.previous),
          Home: () => {
            if (!isGrid || event.ctrlKey) {
              return store.first();
            }
            return store.previous({ skip: -1 });
          },
          End: () => {
            if (!isGrid || event.ctrlKey) {
              return store.last();
            }
            return store.next({ skip: -1 });
          },
          PageUp: () => {
            const element = activeItem?.element;
            if (!element) return store.first();
            return findNextPageItemId(element, store, store.up, true);
          },
          PageDown: () => {
            const element = activeItem?.element;
            if (!element) return store.last();
            return findNextPageItemId(element, store, store.down);
          },
        };
        const getId = nextKeyMap[event.key as keyof typeof nextKeyMap];
        if (getId) {
          // Navigation keys are always consumed while the popover is open, so
          // the page doesn't scroll behind it even when there's no next item
          // in that direction, as with Select and the native select element.
          // A null or undefined id keeps the active item unchanged.
          event.preventDefault();
          const nextId = getId();
          if (nextId != null) {
            store.move(nextId);
          }
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          if (activeItem?.element) {
            // Prevent the native button activation click, which would close
            // the popover through the disclosure toggle behavior, and forward
            // the activation to the active item instead.
            event.preventDefault();
            activeItem.element.click();
          }
        }
        return;
      }
      if (open) return;
      if (event.ctrlKey) return;
      if (event.shiftKey) return;
      if (event.metaKey) return;
      // Alt is intentionally allowed: pressing Alt+ArrowDown to open the
      // popover is part of the WAI-ARIA combobox keyboard interaction.
      // moveOnKeyDown
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
      // showOnKeyDown
      const isTopOrBottom = dir === "top" || dir === "bottom";
      const canShowKeyMap = {
        ArrowDown: isTopOrBottom,
        ArrowUp: isTopOrBottom,
        ArrowLeft: dir === "left",
        ArrowRight: dir === "right",
      };
      const canShow = canShowKeyMap[event.key as keyof typeof canShowKeyMap];
      if (!canShow) return;
      if (!showOnKeyDownProp(event)) return;
      event.preventDefault();
      // Move back to the active item read before the moveOnKeyDown block, so
      // showing the popover with arrow keys doesn't also change the selection.
      // This mirrors the same sequence in select.tsx.
      store.move(activeId);
      store.setAnchorElement(event.currentTarget);
      // Schedule the show event to run after the key event has finished
      // bubbling. This is necessary to avoid the page to scroll when the
      // popover is shown.
      queueBeforeEvent(event.currentTarget, "keyup", store.show);
    });

    props = useWrapElement(
      props,
      (element) => (
        <PopoverScopedContextProvider value={store}>
          {element}
        </PopoverScopedContextProvider>
      ),
      [store],
    );

    const id = useId(props.id);

    props = {
      role: "combobox",
      "aria-autocomplete": "none",
      "aria-labelledby": label != null ? undefined : labelId,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "aria-required": required || undefined,
      "aria-activedescendant": activeDescendantId,
      "data-autofill": autofill || undefined,
      "data-name": name,
      children,
      ...props,
      id,
      ref: useMergeRefs(ref, props.ref),
      onClick,
      onKeyDown,
    };

    // The dialog disclosure hook is used here instead of the popover
    // disclosure one so this component's unmount cleanup is the only thing
    // restoring the anchorElement state. The popover disclosure hook would
    // also register this button as the popover anchor through its own ref,
    // whose detachment on unmount would reset the anchor element to null
    // right after the cleanup above restored it.
    props = useDialogDisclosure({ store, toggleOnClick, ...props });
    props = useCompositeTypeahead<TagName>({ store, ...props });

    return props;
  },
);

/**
 * Renders a select-like combobox disclosure that displays the current
 * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
 * state.
 *
 * This is a button trigger, distinct from the
 * [`Combobox`](https://ariakit.com/reference/combobox) filter input.
 * Compose them within the same
 * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) to
 * create a filterable select.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {3}
 * <ComboboxProvider defaultSelectedValue="Apple">
 *   <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <Combobox autoSelect />
 *     <ComboboxList>
 *       <ComboboxItem value="Apple" />
 *       <ComboboxItem value="Orange" />
 *     </ComboboxList>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxSelect = forwardRef(function ComboboxSelect(
  props: ComboboxSelectProps,
) {
  const htmlProps = useComboboxSelect(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxSelectOptions<T extends ElementType = TagName>
  extends
    Omit<DialogDisclosureOptions<T>, "store">,
    Omit<CompositeTypeaheadOptions<T>, "store">,
    Pick<
      SelectHTMLAttributes<HTMLSelectElement>,
      "name" | "form" | "required"
    > {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store) hook.
   * If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
  /**
   * The content to display when the
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * state is empty.
   */
  fallback?: ReactNode;
  /**
   * Determines whether the
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * component will appear when the user uses arrow keys while the select
   * element is in focus.
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Determines whether pressing arrow keys will move the active item (and,
   * for a single-select, the
   * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
   * state) even when the
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * component is hidden.
   * @default true
   */
  moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
}

export type ComboboxSelectProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSelectOptions<T>
>;
