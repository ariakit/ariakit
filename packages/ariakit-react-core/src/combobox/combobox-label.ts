import type { ElementType } from "react";
import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import {
  createElement,
  createHook2,
  forwardRef,
  memo,
} from "../utils/system.jsx";
import type { Options2, Props2 } from "../utils/types.js";
import { useComboboxProviderContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

const TagName = "label" satisfies ElementType;
type TagName = typeof TagName;

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
export const useComboboxLabel = createHook2<TagName, ComboboxLabelOptions>(
  function useComboboxLabel({ store, ...props }) {
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

    return removeUndefinedValues(props);
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
export const ComboboxLabel = memo(
  forwardRef(function ComboboxLabel(props: ComboboxLabelProps) {
    const htmlProps = useComboboxLabel(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface ComboboxLabelOptions<_T extends ElementType = TagName>
  extends Options2 {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxLabelProps<T extends ElementType = TagName> = Props2<
  T,
  ComboboxLabelOptions<T>
>;
