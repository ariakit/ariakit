import { KeyboardEvent, useRef } from "react";
import { useEvent, useForkRef, useId, useWrapElement } from "../utils/hooks.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import { As, Options, Props } from "../utils/types.js";
import { ComboboxContext } from "./combobox-context.js";
import { ComboboxStore } from "./combobox-store.js";

/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxList({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export const useComboboxList = createHook<ComboboxListOptions>(
  ({ store, ...props }) => {
    const ref = useRef<HTMLDivElement>(null);
    const id = useId(props.id);

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        store.move(null);
      }
    });

    props = useWrapElement(
      props,
      (element) => (
        <ComboboxContext.Provider value={store}>
          {element}
        </ComboboxContext.Provider>
      ),
      [store]
    );

    const mounted = store.useState("mounted");

    const style = mounted ? props.style : { ...props.style, display: "none" };

    props = {
      id,
      role: "listbox",
      hidden: !mounted,
      ...props,
      ref: useForkRef(id ? store.setContentElement : null, ref, props.ref),
      style,
      onKeyDown,
    };

    return props;
  }
);

/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`). The `aria-labelledby` prop is set to the
 * combobox input element's `id` by default.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxList store={combobox}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxList>
 * ```
 */
export const ComboboxList = createComponent<ComboboxListOptions>((props) => {
  const htmlProps = useComboboxList(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  ComboboxList.displayName = "ComboboxList";
}

export interface ComboboxListOptions<T extends As = "div"> extends Options<T> {
  /**
   * Object returned by the `useComboboxStore` hook.
   */
  store: ComboboxStore;
}

export type ComboboxListProps<T extends As = "div"> = Props<
  ComboboxListOptions<T>
>;
