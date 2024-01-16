import { createDialogComponent } from "../dialog/dialog.js";
import type { PopoverOptions } from "../popover/popover.js";
import { usePopover } from "../popover/popover.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { Props2 } from "../utils/types.js";
import { useSelectProviderContext } from "./select-context.js";
import type { SelectListOptions } from "./select-list.js";
import { useSelectList } from "./select-list.js";

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
export const useSelectPopover = createHook2<TagName, SelectPopoverOptions>(
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
  createComponent<SelectPopoverOptions>((props) => {
    const htmlProps = useSelectPopover(props);
    return createElement(TagName, htmlProps);
  }),
  useSelectProviderContext,
);

export interface SelectPopoverOptions<T extends ElementType = TagName>
  extends SelectListOptions<T>,
    Omit<PopoverOptions<T>, "store"> {}

export type SelectPopoverProps<T extends ElementType = TagName> = Props2<
  T,
  SelectPopoverOptions<T>
>;
