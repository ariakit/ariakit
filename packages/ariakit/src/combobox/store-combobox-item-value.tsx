import { useContext, useMemo } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Options, Props } from "ariakit-react-utils/types";
import { invariant, normalizeString } from "ariakit-utils/misc";
import { ComboboxContext, ComboboxItemValueContext } from "./__store-utils";
import { ComboboxStore } from "./store-combobox-store";

function normalizeValue(value: string) {
  return normalizeString(value).toLowerCase();
}

function splitValue(itemValue: string, userValue: string) {
  userValue = normalizeValue(userValue);
  let index = normalizeValue(itemValue).indexOf(userValue);
  const parts: JSX.Element[] = [];
  while (index !== -1) {
    if (index !== 0) {
      parts.push(
        <span data-autocomplete-value="" key={parts.length}>
          {itemValue.substr(0, index)}
        </span>
      );
    }
    parts.push(
      <span data-user-value="" key={parts.length}>
        {itemValue.substr(index, userValue.length)}
      </span>
    );
    itemValue = itemValue.substr(index + userValue.length);
    index = normalizeValue(itemValue).indexOf(userValue);
  }
  if (itemValue) {
    parts.push(
      <span data-autocomplete-value="" key={parts.length}>
        {itemValue}
      </span>
    );
  }
  return parts;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a value element inside a combobox item. The value
 * will be split into span elements and returned as the children prop. The
 * portions of the value that correspond to the store value will have a
 * `data-user-value` attribute. The other portions will have a
 * `data-autocomplete-value` attribute.
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
export const useComboboxItemValue = createHook<ComboboxItemValueOptions>(
  ({ store, value, ...props }) => {
    const context = useContext(ComboboxContext);
    store = store || context;
    const itemContext = useContext(ComboboxItemValueContext);
    const itemValue = value ?? itemContext;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxItemValue must be wrapped in a ComboboxItem component"
    );

    const stateValue = store.useState((state) =>
      itemValue && state.value ? state.value : undefined
    );

    const children = useMemo(
      () =>
        itemValue && stateValue ? splitValue(itemValue, stateValue) : itemValue,
      [itemValue, stateValue]
    );

    props = {
      children,
      ...props,
    };

    return props;
  }
);

/**
 * A component that renders a value element inside a combobox item. The value
 * will be split into span elements. The portions of the value that correspond
 * to the store value will have a `data-user-value` attribute. The other
 * portions will have a `data-autocomplete-value` attribute.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore({ value: "p" });
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxItem value="Apple">
 *     <ComboboxItemValue />
 *   </ComboboxItem>
 * </ComboboxPopover>
 * // The Apple item will have a value element that looks like this:
 * <span>
 *   <span data-autocomplete-value>A</span>
 *   <span data-user-value>p</span>
 *   <span data-user-value>p</span>
 *   <span data-autocomplete-value>le</span>
 * </span>
 * ```
 */
export const ComboboxItemValue = createComponent<ComboboxItemValueOptions>(
  (props) => {
    const htmlProps = useComboboxItemValue(props);
    return createElement("span", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  ComboboxItemValue.displayName = "ComboboxItemValue";
}

export type ComboboxItemValueOptions<T extends As = "span"> = Options<T> & {
  /**
   * Object returned by the `useComboboxStore` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  store?: ComboboxStore;
  /**
   * The current combobox item value. If not provided, the parent `ComboboxItem`
   * component's `value` prop will be used.
   */
  value?: string;
};

export type ComboboxItemValueProps<T extends As = "span"> = Props<
  ComboboxItemValueOptions<T>
>;
