import type { VariantProps } from "clava";
import { useMemo } from "react";
import type { HTMLAttributes } from "react";
import { popoverPositioner } from "../styles/popover.ts";

/**
 * Returns the `wrapperProps` of a popup with the `popoverPositioner` style
 * recipe, so its variants style the element that Ariakit positions. The
 * `className` and `style` of the caller's `wrapperProps` come after it.
 */
export function usePopoverPositionerProps(
  { $slide }: VariantProps<typeof popoverPositioner>,
  wrapperProps?: HTMLAttributes<HTMLDivElement>,
) {
  return useMemo(() => {
    const styles = popoverPositioner.jsx({
      $slide,
      className: wrapperProps?.className,
      style: wrapperProps?.style,
    });
    return { ...wrapperProps, ...styles };
  }, [$slide, wrapperProps]);
}
