import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { useComboboxProviderContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

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
export const useComboboxLabel = createHook<TagName, ComboboxLabelOptions>(
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
  extends Options {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
   * hook. If not provided, the closest
   * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
   * component's context will be used.
   */
  store?: ComboboxStore;
}

export type ComboboxLabelProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxLabelOptions<T>
>;
