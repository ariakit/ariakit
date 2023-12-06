import { invariant } from "@ariakit/core/utils/misc";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.jsx";
import type { As, Options, Props } from "../utils/types.js";
import { useComboboxProviderContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

/**
 * Returns props to create a `ComboboxLabel` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxLabel({ store });
 * <Role {...props}>Favorite fruit</Role>
 * <Combobox store={store} />
 * ```
 */
export const useComboboxLabel = createHook<ComboboxLabelOptions>(
  ({ store, ...props }) => {
    const context = useComboboxProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxLabel must receive a `store` prop or be wrapped in a ComboboxProvider component.",
    );

    const comboboxId = store.useState((state) => state.baseElement?.id);

    props = {
      htmlFor: comboboxId,
      ...props,
    };

    return props;
  },
);

/**
 * Renders a label for the [`Combobox`](https://ariakit.org/reference/combobox)
 * component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {2}
 * <ComboboxProvider>
 *   <ComboboxLabel>Favorite fruit</ComboboxLabel>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export const ComboboxLabel = createMemoComponent<ComboboxLabelOptions>(
  (props) => {
    const htmlProps = useComboboxLabel(props);
    return createElement("label", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  ComboboxLabel.displayName = "ComboboxLabel";
}

export interface ComboboxLabelOptions<T extends As = "label">
  extends Options<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxLabelProps<T extends As = "label"> = Props<
  ComboboxLabelOptions<T>
>;
