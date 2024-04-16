import type { ElementType } from "react";
import { createDialogComponent } from "../dialog/dialog.tsx";
import type { PopoverOptions } from "../popover/popover.tsx";
import { usePopover } from "../popover/popover.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useSelectProviderContext } from "./select-context.tsx";
import type { SelectListOptions } from "./select-list.ts";
import { useSelectList } from "./select-list.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectPopover` component.
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
export const useSelectPopover = createHook<TagName, SelectPopoverOptions>(
  function useSelectPopover({ store, alwaysVisible, composite, ...props }) {
    const context = useSelectProviderContext();
    store = store || context;

    const hasCombobox = !!store?.combobox;
    composite = composite ?? !hasCombobox;

    props = useSelectList({ store, alwaysVisible, composite, ...props });
    props = usePopover({ store, alwaysVisible, ...props });
    return props;
  },
);

/**
 * Renders a select popover. The `role` attribute is set to `listbox` by
 * default, but can be overriden by any other valid select popup role
 * (`listbox`, `menu`, `tree`, `grid` or `dialog`).
 * @see https://ariakit.org/components/select
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

export interface SelectPopoverOptions<T extends ElementType = TagName>
  extends SelectListOptions<T>,
    Omit<PopoverOptions<T>, "store"> {}

export type SelectPopoverProps<T extends ElementType = TagName> = Props<
  T,
  SelectPopoverOptions<T>
>;
