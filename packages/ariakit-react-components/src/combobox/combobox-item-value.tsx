import { useStoreState } from "@ariakit/react-store";
import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  toArray,
  normalizeString,
  removeUndefinedValues,
} from "@ariakit/utils";
import type { ElementType, ReactElement } from "react";
import { useContext, useMemo } from "react";
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
    // An empty value makes indexOf keep returning the end of the string.
    if (!value) continue;
    let pos = 0;
    const length = value.length;
    let index = string.indexOf(value, pos);
    while (index !== -1) {
      offsets.push([index, length]);
      pos = index + 1;
      index = string.indexOf(value, pos);
    }
  }
  return offsets;
}

function mergeOverlappingOffsets(offsets: Array<[number, number]>) {
  offsets.sort(([a], [b]) => a - b);

  const merged: Array<[number, number]> = [];

  for (const [offset, length] of offsets) {
    const last = merged[merged.length - 1];
    // Adjacent matches should remain separate so repeated matches keep
    // rendering as individual spans.
    if (last && offset < last[0] + last[1]) {
      last[1] = Math.max(last[1], offset + length - last[0]);
    } else {
      merged.push([offset, length]);
    }
  }

  return merged;
}

function getNormalizedIndexes(itemValue: string) {
  // Maps each index of the normalized item value to original character
  // boundaries, plus a final entry for the end boundary. Positions inside a
  // character (such as part of a decomposed Hangul syllable) round up to the
  // next boundary in `starts` and down to the previous one in `ends`, so a
  // partially matched character is never highlighted. Iterating code points
  // keeps surrogate pairs intact, and characters removed by normalization
  // contribute no entries, so combining marks stay attached to the preceding
  // character when slicing.
  const starts: number[] = [];
  const ends: number[] = [];
  let index = 0;
  for (const char of itemValue) {
    const normalizedLength = normalizeValue(char).length;
    for (let i = 0; i < normalizedLength; i += 1) {
      // Positions inside a character are filled in the backward pass below.
      starts.push(i === 0 ? index : -1);
      ends.push(index);
    }
    index += char.length;
  }
  starts.push(itemValue.length);
  ends.push(itemValue.length);
  // Round positions inside a character up to the start of the next character
  // that produced normalized entries, skipping characters removed by
  // normalization so a highlight never begins at a detached combining mark.
  let nextBoundary = itemValue.length;
  for (let i = starts.length - 1; i >= 0; i -= 1) {
    const start = starts[i];
    if (start == null) continue;
    if (start === -1) {
      starts[i] = nextBoundary;
    } else {
      nextBoundary = start;
    }
  }
  return { starts, ends };
}

function toOriginalOffsets(
  itemValue: string,
  normalizedOffsets: Array<[number, number]>,
) {
  if (!normalizedOffsets.length) return normalizedOffsets;
  const { starts, ends } = getNormalizedIndexes(itemValue);
  const offsets: Array<[number, number]> = [];
  for (const [normalizedOffset, normalizedLength] of normalizedOffsets) {
    const start = starts[normalizedOffset];
    const end = ends[normalizedOffset + normalizedLength];
    if (start == null || end == null) continue;
    // Matches confined to a fragment of a single character (for example, part
    // of a decomposed Hangul syllable while composing with an IME) collapse to
    // an empty range and produce no highlight.
    if (end <= start) continue;
    offsets.push([start, end - start]);
  }
  return offsets;
}

function splitValue(itemValue?: string | null, userValue?: string | string[]) {
  if (!itemValue) return itemValue;
  if (!userValue) return itemValue;
  const userValues = toArray(userValue).map(normalizeValue);
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

  // Offsets are computed in normalized space so matching stays
  // diacritic-insensitive, but the parts are sliced from the original string.
  // Translate the offsets to original character boundaries before slicing, as
  // normalization may change the string length for values such as Hangul,
  // kana, and decomposed (NFD) strings.
  const offsets = toOriginalOffsets(
    itemValue,
    mergeOverlappingOffsets(
      // Convert userValues into a set to avoid duplicates
      getOffsets(normalizeValue(itemValue), new Set(userValues)),
    ),
  );

  const firstEntry = offsets[0];

  if (!firstEntry) {
    parts.push(span(itemValue, true));
    return parts;
  }

  const [firstOffset] = firstEntry;

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
 * @see https://ariakit.com/components/combobox
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

  const inputValue = useStoreState(
    store,
    ["value"],
    (state) => userValue ?? state?.value,
  );

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
 * [`data-user-value`](https://ariakit.com/guide/styling#data-user-value)
 * attribute, while the rest will have a
 * [`data-autocomplete-value`](https://ariakit.com/guide/styling#data-autocomplete-value)
 * attribute.
 *
 * The item value is automatically set to the value of the closest
 * [`ComboboxItem`](https://ariakit.com/reference/combobox-item) component's
 * [`value`](https://ariakit.com/reference/combobox-item#value) prop. The user
 * input value is automatically set to the combobox store's
 * [`value`](https://ariakit.com/reference/use-combobox-store#value) state. Both
 * values can be overridden by providing the
 * [`value`](https://ariakit.com/reference/combobox-item-value#value) and
 * [`userValue`](https://ariakit.com/reference/combobox-item-value#uservalue)
 * props, respectively.
 * @see https://ariakit.com/components/combobox
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

export interface ComboboxItemValueOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxList`](https://ariakit.com/reference/combobox-list) or
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * components' context will be used.
   */
  store?: ComboboxStore;
  /**
   * The current combobox item value. If not provided, the parent
   * [`ComboboxItem`](https://ariakit.com/reference/combobox-item) component's
   * [`value`](https://ariakit.com/reference/combobox-item#value) prop will be
   * used.
   *
   * This is the value rendered by the component. It can be customized to
   * display different children.
   */
  value?: string;
  /**
   * The current user input value. If not provided, the combobox store's
   * [`value`](https://ariakit.com/reference/use-combobox-store#value) state
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
