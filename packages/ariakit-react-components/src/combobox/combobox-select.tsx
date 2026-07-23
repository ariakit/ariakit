import { useStoreState } from "@ariakit/react-store";
import {
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
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.tsx";
import { useDialogDisclosure } from "../dialog/dialog-disclosure.tsx";
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
type BasePlacement = "top" | "bottom" | "left" | "right";

function getSelectedValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function hasSelectedValue(
  value: ComboboxStoreSelectedValue | null | undefined,
) {
  return !!value?.length;
}

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
          if (!hasSelectedValue(state.selectedValue)) return;
          const values = toArray(state.selectedValue);
          const value = values[values.length - 1];
          if (value == null) return;
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
          }
          const item = state.items.find((item) => {
            if (item.disabled) return false;
            return item.value === value;
          });
          if (!item) return;
          store.setActiveId(item.id);
        },
      );
    }, [store]);

    const selectedValue = useStoreState(store, "selectedValue");
    const items = useStoreState(store, "items");
    const open = useStoreState(store, "open");
    const contentElement = useStoreState(store, "contentElement");
    const labelId = useStoreState(store, (state) => state.labelElement?.id);
    const label = props["aria-label"];
    const labelledBy = props["aria-labelledby"] || labelId;
    const optionMapRef = useRef(new Map<string, ComboboxSelectOption>());

    const { options, selectedOptions } = useMemo(() => {
      const optionMap = optionMapRef.current;
      const selectedValues = toArray(selectedValue);
      const selectedSet = new Set(selectedValues);
      const currentOptions: ComboboxSelectOption[] = [];
      const currentValues = new Set<string>();

      for (const item of items) {
        const { value } = item;
        if (value == null) continue;
        if (currentValues.has(value)) continue;
        if (item.disabled && !selectedSet.has(value)) continue;

        const option = { value, label: item.children ?? value };

        currentValues.add(value);
        optionMap.set(value, option);

        if (!item.disabled) {
          currentOptions.push(option);
        }
      }

      for (const value of selectedValues) {
        if (optionMap.has(value)) continue;
        optionMap.set(value, { value, label: value });
      }

      for (const value of Array.from(optionMap.keys())) {
        if (selectedSet.has(value)) continue;
        if (currentValues.has(value)) continue;
        optionMap.delete(value);
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

      return { options, selectedOptions };
    }, [items, selectedValue]);

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
    const placement = useStoreState(store, "placement");
    const dir = placement.split("-")[0] as BasePlacement;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.ctrlKey) return;
      if (event.shiftKey) return;
      if (event.metaKey) return;
      // Alt is intentionally allowed: pressing Alt+ArrowDown to open the
      // popover is part of the WAI-ARIA combobox keyboard interaction.
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
}

export type ComboboxSelectProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSelectOptions<T>
>;
