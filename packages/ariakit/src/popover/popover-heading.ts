import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  DialogHeadingOptions,
  useDialogHeading,
} from "../dialog/dialog-heading";
import { PopoverState } from "./popover-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a heading element for a popover. This hook must
 * be used in a component that's wrapped with `Popover` so the `aria-labelledby`
 * prop is properly set on the popover element.
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
 * A component that renders a heading in a popover. This component must be
 * wrapped with `Popover` so the `aria-labelledby` prop is properly set on the
 * popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverState();
 * <Popover state={popover}>
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

export type PopoverHeadingOptions<T extends As = "h1"> = Omit<
  DialogHeadingOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `usePopoverState` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  state?: PopoverState;
};

export type PopoverHeadingProps<T extends As = "h1"> = Props<
  PopoverHeadingOptions<T>
>;
