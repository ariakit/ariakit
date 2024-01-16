import { useContext, useMemo } from "react";
import type { ElementType, ReactElement } from "react";
import {
  invariant,
  normalizeString,
  removeUndefinedValues,
} from "@ariakit/core/utils/misc";
import { createElement, createHook2, forwardRef } from "../utils/system.js";
import type { Options2, Props2 } from "../utils/types.js";
import {
  ComboboxItemValueContext,
  useComboboxScopedContext,
} from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

function normalizeValue(value: string) {
  return normalizeString(value).toLowerCase();
}

function splitValue(itemValue: string, userValue: string) {
  userValue = normalizeValue(userValue);
  let index = normalizeValue(itemValue).indexOf(userValue);
  const parts: ReactElement[] = [];
  while (index !== -1) {
    if (index !== 0) {
      parts.push(
        <span data-autocomplete-value="" key={parts.length}>
          {itemValue.substr(0, index)}
        </span>,
      );
    }
    parts.push(
      <span data-user-value="" key={parts.length}>
        {itemValue.substr(index, userValue.length)}
      </span>,
    );
    itemValue = itemValue.substr(index + userValue.length);
    index = normalizeValue(itemValue).indexOf(userValue);
  }
  if (itemValue) {
    parts.push(
      <span data-autocomplete-value="" key={parts.length}>
        {itemValue}
      </span>,
    );
  }
  return parts;
}

/**
 * Returns props to create a `ComboboxItemValue` component that displays a value
 * element inside a combobox item. The value will be split into span elements
 * and returned as the children prop. The portions of the value that correspond
 * to the store value will have a `data-user-value` attribute. The other
 * portions will have a `data-autocomplete-value` attribute.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore({ value: "p" });
 * const props = useComboboxItemValue({ store, value: "Apple" });
 * <Role {...props} />
 * // This will result in the following DOM:
 * <span>
 *   <span data-autocomplete-value>A</span>
 *   <span data-user-value>p</span>
 *   <span data-user-value>p</span>
 *   <span data-autocomplete-value>le</span>
 * </span>
 * ```
 */
export const useComboboxItemValue = createHook2<
  TagName,
  ComboboxItemValueOptions
>(function useComboboxItemValue({ store, value, ...props }) {
  const context = useComboboxScopedContext();
  store = store || context;

  const itemContext = useContext(ComboboxItemValueContext);
  const itemValue = value ?? itemContext;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "ComboboxItemValue must be wrapped in a ComboboxItem component.",
  );

  const stateValue = store.useState((state) =>
    itemValue && state.value ? state.value : undefined,
  );

  const children = useMemo(
    () =>
      itemValue && stateValue ? splitValue(itemValue, stateValue) : itemValue,
    [itemValue, stateValue],
  );

  props = {
    children,
    ...props,
  };

  return removeUndefinedValues(props);
});

/**
 * Renders a value element inside a
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item). The value will
 * be split into span elements. The portions of the value that correspond to the
 * combobox value will have a
 * [`data-user-value`](https://ariakit.org/guide/styling#data-user-value)
 * attribute. The other portions will have a [`data-autocomplete-value`](https://ariakit.org/guide/styling#data-autocomplete-value)
 * attribute.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {5} "value"
 * <ComboboxProvider value="p">
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple">
 *       <ComboboxItemValue />
 *     </ComboboxItem>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 *
 * // The Apple item will have a value element that looks like this:
 * <span>
 *   <span data-autocomplete-value>A</span>
 *   <span data-user-value>p</span>
 *   <span data-user-value>p</span>
 *   <span data-autocomplete-value>le</span>
 * </span>
 * ```
 */
export const ComboboxItemValue = forwardRef(function ComboboxItemValue(
  props: ComboboxItemValueProps,
) {
  const htmlProps = useComboboxItemValue(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxItemValueOptions<_T extends ElementType = TagName>
  extends Options2 {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
   * components' context will be used.
   */
  store?: ComboboxStore;
  /**
   * The current combobox item value. If not provided, the parent
   * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component's
   * [`value`](https://ariakit.org/reference/combobox-item#value) prop will be
   * used.
   */
  value?: string;
}

export type ComboboxItemValueProps<T extends ElementType = TagName> = Props2<
  T,
  ComboboxItemValueOptions<T>
>;
