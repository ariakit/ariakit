import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import {
  DialogDescriptionOptions,
  useDialogDescription,
} from "../dialog/dialog-description";
import { PopoverState } from "./popover-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a description element for a popover. This hook
 * must be used in a component that's wrapped with `Popover` so the
 * `aria-describedby` prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * // This component must be wrapped with Popover
 * const props = usePopoverDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const usePopoverDescription = createHook<PopoverDescriptionOptions>(
  (props) => {
    props = useDialogDescription(props);
    return props;
  }
);

/**
 * A component that renders a description in a popover. This component must be
 * wrapped with `Popover` so the `aria-describedby` prop is properly set on the
 * popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverState();
 * <Popover state={popover}>
 *   <PopoverDescription>Description</PopoverDescription>
 * </Popover>
 * ```
 */
export const PopoverDescription = createComponent<PopoverDescriptionOptions>(
  (props) => {
    const htmlProps = usePopoverDescription(props);
    return createElement("p", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  PopoverDescription.displayName = "PopoverDescription";
}

export type PopoverDescriptionOptions<T extends As = "p"> = Omit<
  DialogDescriptionOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `usePopoverState` hook. If not provided, the parent
   * `Popover` component's context will be used.
   */
  state?: PopoverState;
};

export type PopoverDescriptionProps<T extends As = "p"> = Props<
  PopoverDescriptionOptions<T>
>;
