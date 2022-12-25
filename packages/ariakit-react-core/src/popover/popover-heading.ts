import {
  DialogHeadingOptions,
  useDialogHeading,
} from "../dialog/dialog-heading";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { PopoverStore } from "./popover-store";

/**
 * Returns props to create a `PopoverHeading` component. This hook must be used
 * in a component that's wrapped with `Popover` so the `aria-labelledby` prop is
 * properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * // This component must be wrapped with Popover
 * const props = usePopoverHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const usePopoverHeading = createHook<PopoverHeadingOptions>((props) => {
  props = useDialogHeading(props);
  return props;
});

/**
 * Renders a heading in a popover. This component must be wrapped with `Popover`
 * so the `aria-labelledby` prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <Popover store={popover}>
 *   <PopoverHeading>Heading</PopoverHeading>
 * </Popover>
 * ```
 */
export const PopoverHeading = createComponent<PopoverHeadingOptions>(
  (props) => {
    const htmlProps = usePopoverHeading(props);
    return createElement("h1", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  PopoverHeading.displayName = "PopoverHeading";
}

export interface PopoverHeadingOptions<T extends As = "h1">
  extends DialogHeadingOptions<T> {
  /**
   * Object returned by the `usePopoverStore` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  store?: PopoverStore;
}

export type PopoverHeadingProps<T extends As = "h1"> = Props<
  PopoverHeadingOptions<T>
>;
