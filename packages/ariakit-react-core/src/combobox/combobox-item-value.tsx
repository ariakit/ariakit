import { toArray } from "@ariakit/core/utils/array";
import {
  normalizeString,
  removeUndefinedValues,
} from "@ariakit/core/utils/misc";
import type { ElementType, ReactElement } from "react";
import { useContext, useMemo } from "react";
import { useStoreState } from "../utils/store.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import {
  ComboboxItemValueContext,
  useComboboxScopedContext,
} from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

function normalizeValue(value: string) {
  return normalizeString(value).toLowerCase();
}

function getOffsets(string: string, values: Iterable<string>) {
  const offsets = [] as Array<[number, number]>;
  for (const value of values) {
    let pos = 0;
    const length = value.length;
    while (string.indexOf(value, pos) !== -1) {
      const index = string.indexOf(value, pos);
      if (index !== -1) {
        offsets.push([index, length]);
      }
      pos = index + 1;
    }
  }
  return offsets;
}

function filterOverlappingOffsets(offsets: Array<[number, number]>) {
  return offsets.filter(([offset, length], i, arr) => {
    return !arr.some(
      ([o, l], j) => j !== i && o <= offset && o + l >= offset + length,
    );
  });
}

function sortOffsets(offsets: Array<[number, number]>) {
  return offsets.sort(([a], [b]) => a - b);
}

function splitValue(itemValue?: string | null, userValue?: string | string[]) {
  if (!itemValue) return itemValue;
  if (!userValue) return itemValue;
  const userValues = toArray(userValue).filter(Boolean).map(normalizeValue);
  const parts: ReactElement[] = [];

  const span = (value: string, autocomplete = false) => (
    <span
      key={parts.length}
      data-autocomplete-value={autocomplete ? "" : undefined}
      data-user-value={autocomplete ? undefined : ""}
    >
      {value}
    </span>
  );

  const offsets = sortOffsets(
    filterOverlappingOffsets(
      // Convert userValues into a set to avoid duplicates
      getOffsets(normalizeValue(itemValue), new Set(userValues)),
    ),
  );

  if (!offsets.length) {
    parts.push(span(itemValue, true));
    return parts;
  }

  const [firstOffset] = offsets[0]!;

  const values = [
    itemValue.slice(0, firstOffset),
    ...offsets.flatMap(([offset, length], i) => {
      const value = itemValue.slice(offset, offset + length);
      const nextOffset = offsets[i + 1]?.[0];
      const nextValue = itemValue.slice(offset + length, nextOffset);
      return [value, nextValue];
    }),
  ];

  values.forEach((value, i) => {
    if (!value) return;
    parts.push(span(value, i % 2 === 0));
  });

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
export const useComboboxItemValue = createHook<
  TagName,
  ComboboxItemValueOptions
>(function useComboboxItemValue({ store, value, userValue, ...props }) {
  const context = useComboboxScopedContext();
  store = store || context;

  const itemContext = useContext(ComboboxItemValueContext);
  const itemValue = value ?? itemContext;

  const inputValue = useStoreState(store, (state) => userValue ?? state?.value);

  const children = useMemo(() => {
    if (!itemValue) return;
    if (!inputValue) return itemValue;
    return splitValue(itemValue, inputValue);
  }, [itemValue, inputValue]);

  props = {
    children,
    ...props,
  };

  return removeUndefinedValues(props);
});

/**
 * Renders a `span` element with the combobox item value as children. The value
 * is split into span elements. Portions of the value matching the user input
 * will have a
 * [`data-user-value`](https://ariakit.org/guide/styling#data-user-value)
 * attribute, while the rest will have a
 * [`data-autocomplete-value`](https://ariakit.org/guide/styling#data-autocomplete-value)
 * attribute.
 *
 * The item value is automatically set to the value of the closest
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component's
 * [`value`](https://ariakit.org/reference/combobox-item#value) prop. The user
 * input value is automatically set to the combobox store's
 * [`value`](https://ariakit.org/reference/use-combobox-store#value) state. Both
 * values can be overridden by providing the
 * [`value`](https://ariakit.org/reference/combobox-item-value#value) and
 * [`userValue`](https://ariakit.org/reference/combobox-item-value#uservalue)
 * props, respectively.
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
  extends Options {
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
   *
   * This is the value rendered by the component. It can be customized to
   * display different children.
   */
  value?: string;
  /**
   * The current user input value. If not provided, the combobox store's
   * [`value`](https://ariakit.org/reference/use-combobox-store#value) state
   * will be used.
   *
   * This is the value used to highlight the matching portions of the item
   * value. It can be customized to highlight different portions.
   */
  userValue?: string | string[];
}

export type ComboboxItemValueProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxItemValueOptions<T>
>;
