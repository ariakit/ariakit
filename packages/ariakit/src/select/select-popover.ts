import { useEffect, useState } from "react";
import { toArray } from "ariakit-utils/array";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { PopoverOptions, usePopover } from "../popover/popover";
import { Item, findEnabledItemByValue } from "./__utils";
import { SelectListOptions, useSelectList } from "./select-list";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a select popover.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const state = useSelectState();
 * const props = useSelectPopover({ state });
 * <Role {...props}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </Role>
 * ```
 */
export const useSelectPopover = createHook<SelectPopoverOptions>(
  ({ state, ...props }) => {
    const values = toArray(state.value);
    const value = values[values.length - 1] ?? "";
    const [item, setItem] = useState<Item | null>(null);

    // Sets the initial focus ref.
    useEffect(() => {
      let cleaning = false;
      setItem((prevItem) => {
        if (cleaning) return null;
        if (state.mounted && prevItem) return prevItem;
        const item = findEnabledItemByValue(state.items, value);
        return item || null;
      });
      return () => {
        cleaning = true;
      };
    }, [state.mounted, state.items, value]);

    props = useSelectList({ state, ...props });
    props = usePopover({
      state,
      initialFocusRef: item?.ref || state.baseRef,
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
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export const SelectPopover = createComponent<SelectPopoverOptions>((props) => {
  const htmlProps = useSelectPopover(props);
  return createElement("div", htmlProps);
});

export type SelectPopoverOptions<T extends As = "div"> = SelectListOptions<T> &
  Omit<PopoverOptions<T>, "state">;

export type SelectPopoverProps<T extends As = "div"> = Props<
  SelectPopoverOptions<T>
>;
