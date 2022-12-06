import {
  MutableRefObject,
  RefObject,
  createRef,
  useEffect,
  useState,
} from "react";
import { toArray } from "@ariakit/core/utils/array";
import { PopoverOptions, usePopover } from "../popover/popover";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { SelectListOptions, useSelectList } from "./select-list";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select popover.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectPopover({ store });
 * <Role {...props}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </Role>
 * ```
 */
export const useSelectPopover = createHook<SelectPopoverOptions>(
  ({ store, ...props }) => {
    const value = store.useState((state) => {
      const values = toArray(state.value);
      return values[values.length - 1] ?? "";
    });

    const open = store.useState("open");
    const items = store.useState("items");
    const [initialFocusRef, setInitialFocusRef] =
      useState<RefObject<HTMLElement>>();

    // Sets the initial focus ref.
    useEffect(() => {
      let cleaning = false;
      setInitialFocusRef((prevInitialFocusRef) => {
        if (cleaning) return prevInitialFocusRef;
        // This must be state.open instead of state.mounted, otherwise
        // re-opening an animated popover before the leave animation is done
        // will not restore focus to the correct item.
        if (open && prevInitialFocusRef?.current?.isConnected)
          return prevInitialFocusRef;
        const item = items.find(
          (item) => item.value === value && !item.disabled
        );
        const ref = createRef() as MutableRefObject<HTMLElement | null>;
        if (item?.element) {
          ref.current = item.element;
        }
        return ref;
      });
      return () => {
        cleaning = true;
      };
    }, [open, items, value]);

    props = useSelectList({ store, ...props });
    props = usePopover({
      store,
      initialFocusRef,
      ...props,
    });

    return props;
  }
);

/**
 * A component that renders a select popover. The `role` prop is set to
 * `listbox` by default, but can be overriden by any other valid select popup
 * role (`listbox`, `menu`, `tree`, `grid` or `dialog`).
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore();
 * <Select store={select} />
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectPopover = createComponent<SelectPopoverOptions>((props) => {
  const htmlProps = useSelectPopover(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectPopover.displayName = "SelectPopover";
}

export type SelectPopoverOptions<T extends As = "div"> = SelectListOptions<T> &
  Omit<PopoverOptions<T>, "store">;

export type SelectPopoverProps<T extends As = "div"> = Props<
  SelectPopoverOptions<T>
>;
