import { useContext, useMemo } from "react";
import { normalizeString } from "ariakit-utils/misc";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { ComboboxContext, ComboboxItemValueContext } from "./__utils";
import { ComboboxState } from "./combobox-state";

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
 * portions of the value that correspond to the state value will have a
 * `data-user-value` attribute. The other portions will have a
 * `data-autocomplete-value` attribute.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const state = useComboboxState({ value: "p" });
 * const props = useComboboxItemValue({ state, value: "Apple" });
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
  ({ state, value, ...props }) => {
    state = useStore(state || ComboboxContext, ["value"]);
    const context = useContext(ComboboxItemValueContext);
    const itemValue = value ?? context;

    const children = useMemo(
      () =>
        itemValue && state?.value
          ? splitValue(itemValue, state.value)
          : itemValue,
      [itemValue, state?.value]
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
 * to the state value will have a `data-user-value` attribute. The other
 * portions will have a `data-autocomplete-value` attribute.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState({ value: "p" });
 * <Combobox state={combobox} />
 * <ComboboxPopover state={combobox}>
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
   * Object returned by the `useComboboxState` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  state?: ComboboxState;
  /**
   * The current combobox item value. If not provided, the parent `ComboboxItem`
   * component's `value` prop will be used.
   */
  value?: string;
};

export type ComboboxItemValueProps<T extends As = "span"> = Props<
  ComboboxItemValueOptions<T>
>;
