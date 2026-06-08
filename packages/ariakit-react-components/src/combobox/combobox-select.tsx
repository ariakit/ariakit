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
  getWindow,
  getPopupRole,
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
  CSSProperties,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PopoverDisclosureArrow } from "../popover/popover-disclosure-arrow.tsx";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import { usePopoverDisclosure } from "../popover/popover-disclosure.tsx";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import {
  addComboboxSelectElement,
  isComboboxSelectElement,
  removeComboboxSelectElement,
  useComboboxSelectLabelElement,
} from "./combobox-select-state.ts";
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

function getOptionLabel(value: string, label?: string) {
  if (!label) return value;
  return label;
}

function scrollIntoView(element: Element) {
  if (!("scrollIntoView" in element)) return;
  const win = getWindow(element);
  const { scrollX, scrollY } = win;
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (win.scrollX === scrollX && win.scrollY === scrollY) return;
  win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
}

const hiddenSelectStyle = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
} satisfies CSSProperties;

/**
 * Returns props to create a `ComboboxSelect` component.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider defaultSelectedValue="Apple" resetValueOnHide>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <Combobox autoSelect placeholder="Search..." />
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
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
      addComboboxSelectElement(element);
      store.setDisclosureElement(element);
      store.setAnchorElement(element);
      return () => {
        removeComboboxSelectElement(element);
        const { anchorElement, baseElement, disclosureElement } =
          store.getState();
        if (disclosureElement === element) {
          store.setDisclosureElement(baseElement);
        }
        if (anchorElement === element) {
          store.setAnchorElement(baseElement);
        }
      };
    }, [store]);

    useEffect(() => {
      return sync(
        store,
        ["open", "items", "selectedValue", "disclosureElement"],
        (state) => {
          if (!isComboboxSelectElement(state.disclosureElement)) return;
          if (state.open) return;
          if (Array.isArray(state.selectedValue)) return;
          if (!state.selectedValue) return;
          const item = state.items.find((item) => {
            if (item.disabled) return false;
            return item.value === state.selectedValue;
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
    const labelElement = useComboboxSelectLabelElement(store);
    const labelId = labelElement?.id;
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

        const option = {
          value,
          label: getOptionLabel(value, item.children),
        };

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

    useSafeLayoutEffect(() => {
      if (!open) {
        scrollSelectedItemOnShowRef.current = true;
        return;
      }
      if (!scrollSelectedItemOnShowRef.current) return;
      if (Array.isArray(selectedValue)) {
        scrollSelectedItemOnShowRef.current = false;
        return;
      }
      if (!selectedValue) {
        scrollSelectedItemOnShowRef.current = false;
        return;
      }
      const item = items.find((item) => {
        if (item.disabled) return false;
        return item.value === selectedValue;
      });
      const element = item?.element;
      if (!element) return;
      scrollIntoView(element);
      scrollSelectedItemOnShowRef.current = false;
    }, [items, open, selectedValue]);

    useEffect(() => {
      const nativeSelectChanged = nativeSelectChangedRef.current;
      nativeSelectChangedRef.current = false;
      if (nativeSelectChanged) return;
      setAutofill(false);
    }, [selectedValue]);

    props = useWrapElement(
      props,
      (element) => {
        if (!name) return element;
        const multiSelectable = Array.isArray(selectedValue);
        return (
          <>
            <select
              style={hiddenSelectStyle}
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

    const defaultValue = hasSelectedValue(selectedValue)
      ? selectedOptions.map((option) => option.label).join(", ")
      : fallback;

    const defaultChildren = (
      <>
        {defaultValue}
        <PopoverDisclosureArrow store={store} />
      </>
    );

    const children = props.children ?? defaultChildren;

    const onClickProp = props.onClick;

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      addComboboxSelectElement(event.currentTarget);
      store.setDisclosureElement(event.currentTarget);
      store.setAnchorElement(event.currentTarget);
    });

    const onKeyDownProp = props.onKeyDown;
    const showOnKeyDownProp = useBooleanEvent(showOnKeyDown);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.ctrlKey) return;
      if (event.altKey) return;
      if (event.shiftKey) return;
      if (event.metaKey) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      if (!showOnKeyDownProp(event)) return;
      event.preventDefault();
      queueBeforeEvent(event.currentTarget, "keyup", store.show);
    });

    const id = useId(props.id);

    props = {
      role: "combobox",
      "aria-autocomplete": "none",
      "aria-labelledby": label != null ? undefined : labelId,
      "aria-haspopup": getPopupRole(contentElement, "listbox"),
      "data-autofill": autofill || undefined,
      "data-name": name,
      children,
      ...props,
      id,
      ref: useMergeRefs(ref, props.ref),
      onClick,
      onKeyDown,
    };

    props = usePopoverDisclosure({ store, toggleOnClick, ...props });

    return props;
  },
);

/**
 * Renders a select-like combobox disclosure that displays the current
 * [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue)
 * state.
 * @see https://ariakit.com/components/combobox
 * @example
 * ```jsx {2}
 * <ComboboxProvider defaultSelectedValue="Apple">
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <Combobox autoSelect />
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
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

interface ComboboxSelectOption {
  value: string;
  label: string;
}

export interface ComboboxSelectOptions<T extends ElementType = TagName>
  extends
    Omit<PopoverDisclosureOptions<T>, "store">,
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
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) component
   * will appear when the user uses arrow keys while the select element is in
   * focus.
   * @default true
   */
  showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
}

export type ComboboxSelectProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxSelectOptions<T>
>;
