import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { PopoverDescriptionOptions } from "../popover/popover-description.tsx";
import { usePopoverDescription } from "../popover/popover-description.tsx";
import type { HovercardStore } from "./hovercard-store.ts";

const TagName = "p" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `HovercardDescription` component. This hook must be
 * used in a component that's wrapped with `Hovercard` so the `aria-describedby`
 * prop is properly set on the hovercard element.
 * @see https://ariakit.com/components/hovercard
 * @example
 * ```jsx
 * // This component must be wrapped with Hovercard
 * const props = useHovercardDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const useHovercardDescription = createHook<
  TagName,
  HovercardDescriptionOptions
>(function useHovercardDescription(props) {
  props = usePopoverDescription(props);
  return props;
});

/**
 * Renders a description in a hovercard. This component must be wrapped within
 * [`Hovercard`](https://ariakit.com/reference/hovercard) so the
 * `aria-describedby` prop is properly set on the content element.
 * @see https://ariakit.com/components/hovercard
 * @example
 * ```jsx {3}
 * <HovercardProvider>
 *   <Hovercard>
 *     <HovercardDescription>Description</HovercardDescription>
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardDescription = forwardRef(function HovercardDescription(
  props: HovercardDescriptionProps,
) {
  const htmlProps = useHovercardDescription(props);
  return createElement(TagName, htmlProps);
});

export interface HovercardDescriptionOptions<
  T extends ElementType = TagName,
> extends PopoverDescriptionOptions<T> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.com/reference/use-hovercard-store)
   * hook.
   *
   * **Note**: This prop has no effect on this component. The description is
   * linked to the closest
   * [`Hovercard`](https://ariakit.com/reference/hovercard) component through
   * React context, so it must be rendered inside the hovercard for the
   * `aria-describedby` prop to be set on the hovercard element.
   */
  store?: HovercardStore;
}

export type HovercardDescriptionProps<T extends ElementType = TagName> = Props<
  T,
  HovercardDescriptionOptions<T>
>;
