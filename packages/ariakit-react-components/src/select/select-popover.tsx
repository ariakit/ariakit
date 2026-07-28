import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import { createDialogComponent } from "../dialog/dialog.tsx";
import type { PopoverOptions } from "../popover/popover.tsx";
import { usePopover } from "../popover/popover.tsx";
import { useSelectProviderContext } from "./select-context.tsx";
import type { SelectListOptions } from "./select-list.tsx";
import { useSelectList } from "./select-list.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectPopover` component.
 * @deprecated Use `useComboboxPopover` instead.
 * @see https://ariakit.com/components/select
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
export const useSelectPopover = createHook<TagName, SelectPopoverOptions>(
  function useSelectPopover({ store, alwaysVisible, ...props }) {
    const context = useSelectProviderContext();
    store = store || context;
    props = useSelectList({ store, alwaysVisible, ...props });
    props = usePopover({ store, alwaysVisible, ...props });
    return props;
  },
);

/**
 * Renders a select popover. The `role` attribute is set to `listbox` by
 * default, but can be overriden by any other valid select popup role
 * (`listbox`, `menu`, `tree`, `grid` or `dialog`).
 * @deprecated Use
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) instead.
 * @see https://ariakit.com/components/select
 * @example
 * ```jsx {3-6}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectPopover = createDialogComponent(
  forwardRef(function SelectPopover(props: SelectPopoverProps) {
    const htmlProps = useSelectPopover(props);
    return createElement(TagName, htmlProps);
  }),
  useSelectProviderContext,
);

/** @deprecated Use `ComboboxPopoverOptions` instead. */
export interface SelectPopoverOptions<T extends ElementType = TagName>
  extends SelectListOptions<T>, Omit<PopoverOptions<T>, "store"> {}

/** @deprecated Use `ComboboxPopoverProps` instead. */
export type SelectPopoverProps<T extends ElementType = TagName> = Props<
  T,
  SelectPopoverOptions<T>
>;
