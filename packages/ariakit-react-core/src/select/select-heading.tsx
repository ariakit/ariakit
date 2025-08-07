import type { ElementType } from "react";
import { useContext } from "react";
import type { PopoverHeadingOptions } from "../popover/popover-heading.tsx";
import { usePopoverHeading } from "../popover/popover-heading.tsx";
import { useId, useSafeLayoutEffect } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { SelectHeadingContext } from "./select-context.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "h1" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectHeading` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const props = useSelectHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const useSelectHeading = createHook<TagName, SelectHeadingOptions>(
  function useSelectHeading(props) {
    const [, setHeadingId] = useContext(SelectHeadingContext) || [];
    const id = useId(props.id);

    useSafeLayoutEffect(() => {
      setHeadingId?.(id);
      return () => setHeadingId?.(undefined);
    }, [setHeadingId, id]);

    props = {
      id,
      ...props,
    };

    props = usePopoverHeading(props);

    return props;
  },
);

/**
 * Renders a heading element that serves as a label for
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) and
 * [`SelectList`](https://ariakit.org/reference/select-list) components.
 *
 * When this component is rendered within
 * [`SelectPopover`](https://ariakit.org/reference/select-popover), all
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements must be
 * rendered within a [`SelectList`](https://ariakit.org/reference/select-list)
 * instead of directly within the popover.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectHeading>Fruits</SelectHeading>
 *     <SelectList>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectList>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectHeading = forwardRef(function SelectHeading(
  props: SelectHeadingProps,
) {
  const htmlProps = useSelectHeading(props);
  return createElement(TagName, htmlProps);
});

export interface SelectHeadingOptions<T extends ElementType = TagName>
  extends PopoverHeadingOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook.
   * If not provided, the closest
   * [`Select`](https://ariakit.org/reference/select) or
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * components' context will be used.
   */
  store?: SelectStore;
}

export type SelectHeadingProps<T extends ElementType = TagName> = Props<
  T,
  SelectHeadingOptions<T>
>;
