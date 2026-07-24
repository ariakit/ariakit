import {
  useId,
  useSafeLayoutEffect,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import { useContext } from "react";
import type { PopoverHeadingOptions } from "../popover/popover-heading.tsx";
import { usePopoverHeading } from "../popover/popover-heading.tsx";
import { ComboboxHeadingContext } from "./combobox-context.tsx";
import type { ComboboxStore } from "./combobox-store.ts";

const TagName = "h1" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ComboboxHeading` component.
 * @see https://ariakit.com/components/combobox
 */
export const useComboboxHeading = createHook<TagName, ComboboxHeadingOptions>(
  function useComboboxHeading(props) {
    const [, setHeadingId] = useContext(ComboboxHeadingContext) || [];
    const id = useId(props.id);

    useSafeLayoutEffect(() => {
      setHeadingId?.(id);
      return () => setHeadingId?.(undefined);
    }, [setHeadingId, id]);

    props = {
      ...props,
      id,
    };

    props = usePopoverHeading(props);

    return props;
  },
);

/**
 * Renders a heading element that labels
 * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) and
 * [`ComboboxList`](https://ariakit.com/reference/combobox-list) components.
 * @example
 * ```jsx {4}
 * <ComboboxProvider>
 *   <ComboboxSelect />
 *   <ComboboxPopover>
 *     <ComboboxHeading>Fruits</ComboboxHeading>
 *     <ComboboxList>
 *       <ComboboxItem value="Apple" />
 *       <ComboboxItem value="Orange" />
 *     </ComboboxList>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 * @see https://ariakit.com/components/combobox
 */
export const ComboboxHeading = forwardRef(function ComboboxHeading(
  props: ComboboxHeadingProps,
) {
  const htmlProps = useComboboxHeading(props);
  return createElement(TagName, htmlProps);
});

export interface ComboboxHeadingOptions<
  T extends ElementType = TagName,
> extends PopoverHeadingOptions<T> {
  /**
   * Object returned by the
   * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
   * hook.
   *
   * **Note**: This prop has no effect on this component. The heading is linked
   * to the closest [`ComboboxList`](https://ariakit.com/reference/combobox-list)
   * or
   * [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover)
   * component through React context.
   */
  store?: ComboboxStore;
}

export type ComboboxHeadingProps<T extends ElementType = TagName> = Props<
  T,
  ComboboxHeadingOptions<T>
>;
