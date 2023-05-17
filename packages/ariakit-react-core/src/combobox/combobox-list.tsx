import type { FocusEvent, KeyboardEvent } from "react";
import { useRef } from "react";
import { useFocusable } from "../focusable/focusable.js";
import type { FocusableOptions } from "../focusable/focusable.js";
import { useEvent, useForkRef, useId, useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { ComboboxContext } from "./combobox-context.js";
import type { ComboboxStore } from "./combobox-store.js";

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
  ({ store, focusable = true, ...props }) => {
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

    // TODO: Comment and try to test
    const restoreVirtualFocus = useRef(false);
    const onFocusVisibleProp = props.onFocusVisible;
    // TODO: Raf is necessary on VoiceOver: move VO cursor to listbox, then
    // VO+ArrowDown, then VO+ArrowUp, then VO+ArrowDown, etc.
    const rafRef = useRef(0);

    const onFocusVisible = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusVisibleProp?.(event);
      if (event.defaultPrevented) return;
      const { virtualFocus } = store.getState();
      if (!virtualFocus) return;
      const { relatedTarget, currentTarget } = event;
      if (relatedTarget && currentTarget.contains(relatedTarget)) return;
      restoreVirtualFocus.current = true;
      store.setState("virtualFocus", false);
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      cancelAnimationFrame(rafRef.current);
      if (!restoreVirtualFocus.current) return;
      const { relatedTarget, currentTarget } = event;
      if (currentTarget.contains(relatedTarget)) return;
      restoreVirtualFocus.current = false;
      rafRef.current = requestAnimationFrame(() => {
        store.setState("virtualFocus", true);
      });
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
      tabIndex: focusable ? -1 : undefined,
      ...props,
      ref: useForkRef(id ? store.setContentElement : null, ref, props.ref),
      style,
      onKeyDown,
      onFocusVisible,
      onBlur,
    };

    props = useFocusable({ focusable, ...props });

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

export interface ComboboxListOptions<T extends As = "div">
  extends FocusableOptions<T> {
  /**
   * Object returned by the `useComboboxStore` hook.
   */
  store: ComboboxStore;
}

export type ComboboxListProps<T extends As = "div"> = Props<
  ComboboxListOptions<T>
>;
