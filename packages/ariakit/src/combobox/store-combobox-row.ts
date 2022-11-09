import { useContext } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { getPopupRole } from "ariakit-utils/dom";
import { invariant } from "ariakit-utils/misc";
import {
  CompositeRowOptions,
  useCompositeRow,
} from "../composite/store-composite-row";
import { ComboboxContext } from "./__store-utils";
import { ComboboxStore } from "./store-combobox-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a combobox row.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxRow({ store });
 * <ComboboxPopover store={store}>
 *   <Role {...props}>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *     <ComboboxItem value="Item 3" />
 *   </Role>
 * </ComboboxPopover>
 * ```
 */
export const useComboboxRow = createHook<ComboboxRowOptions>(
  ({ store, ...props }) => {
    const context = useContext(ComboboxContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "ComboboxRow must be wrapped in a ComboboxList or ComboboxPopover component"
    );

    const contentElement = store.useState("contentElement");
    const popupRole = getPopupRole(contentElement);
    const role = popupRole === "grid" ? "row" : "presentation";

    props = { role, ...props };

    props = useCompositeRow({ store, ...props });

    return props;
  }
);

/**
 * A component that renders a combobox row.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxRow>
 *     <ComboboxItem value="Item 1.1" />
 *     <ComboboxItem value="Item 1.2" />
 *     <ComboboxItem value="Item 1.3" />
 *   </ComboboxRow>
 *   <ComboboxRow>
 *     <ComboboxItem value="Item 2.1" />
 *     <ComboboxItem value="Item 2.2" />
 *     <ComboboxItem value="Item 2.3" />
 *   </ComboboxRow>
 * </ComboboxPopover>
 * ```
 */
export const ComboboxRow = createComponent<ComboboxRowOptions>((props) => {
  const htmlProps = useComboboxRow(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  ComboboxRow.displayName = "ComboboxRow";
}

export type ComboboxRowOptions<T extends As = "div"> = Omit<
  CompositeRowOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useComboboxStore` hook. If not provided, the parent
   * `ComboboxList` or `ComboboxPopover` components' context will be used.
   */
  store?: ComboboxStore;
};

export type ComboboxRowProps<T extends As = "div"> = Props<
  ComboboxRowOptions<T>
>;
