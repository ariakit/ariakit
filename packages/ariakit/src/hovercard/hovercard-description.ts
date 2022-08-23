import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  PopoverDescriptionOptions,
  usePopoverDescription,
} from "../popover/popover-description";
import { HovercardState } from "./hovercard-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a description element for a hovercard. This hook
 * must be used in a component that's wrapped with `Hovercard` so the
 * `aria-describedby` prop is properly set on the hovercard element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * // This component must be wrapped with Hovercard
 * const props = useHovercardDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const useHovercardDescription = createHook<HovercardDescriptionOptions>(
  (props) => {
    props = usePopoverDescription(props);
    return props;
  }
);

/**
 * A component that renders a description in a hovercard. This component must be
 * wrapped with `Hovercard` so the `aria-describedby` prop is properly set on
 * the hovercard element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardState();
 * <Hovercard state={hovercard}>
 *   <HovercardDescription>Description</HovercardDescription>
 * </Hovercard>
 * ```
 */
export const HovercardDescription =
  createComponent<HovercardDescriptionOptions>((props) => {
    const htmlProps = useHovercardDescription(props);
    return createElement("p", htmlProps);
  });

if (process.env.NODE_ENV !== "production") {
  HovercardDescription.displayName = "HovercardDescription";
}

export type HovercardDescriptionOptions<T extends As = "p"> = Omit<
  PopoverDescriptionOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useHovercardState` hook. If not provided, the
   * parent `Hovercard` component's context will be used.
   */
  state?: HovercardState;
};

export type HovercardDescriptionProps<T extends As = "p"> = Props<
  HovercardDescriptionOptions<T>
>;
