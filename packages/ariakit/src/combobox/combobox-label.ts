import { useRefId } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { ComboboxState } from "./combobox-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox label.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const state = useComboboxState();
 * const props = useComboboxLabel({ state });
 * <Role {...props} />
 * <Combobox state={state} />
 * ```
 */
export const useComboboxLabel = createHook<ComboboxLabelOptions>(
  ({ state, ...props }) => {
    const htmlFor = useRefId(state.baseRef);
    props = { htmlFor, ...props };
    return props;
  }
);

/**
 * A component that renders a combobox label element.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxState();
 * <ComboboxLabel state={combobox}>Label</ComboboxLabel>
 * <Combobox state={combobox} />
 * <ComboboxList state={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxList>
 * ```
 */
export const ComboboxLabel = createComponent<ComboboxLabelOptions>((props) => {
  const htmlProps = useComboboxLabel(props);
  return createElement("label", htmlProps);
});

export type ComboboxLabelOptions<T extends As = "label"> = Options<T> & {
  /**
   * Object returned by the `useComboboxState` hook.
   */
  state: ComboboxState;
};

export type ComboboxLabelProps<T extends As = "label"> = Props<
  ComboboxLabelOptions<T>
>;
