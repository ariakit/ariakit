/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ButtonProps } from "@ariakit/ui/components/button.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import type { button } from "@ariakit/ui/styles/button";
import { clsx } from "clsx";

export interface TooltipButtonProps extends ButtonProps {
  /** The tooltip text. Astro passes only serializable props to an island. */
  tooltip: string;
}

/**
 * A button with a tooltip for Astro pages. Astro renders the children of an
 * island as static HTML, so a hydrated `Tooltip` can't wrap a button that an
 * Astro page renders. This island renders both.
 * @example
 * <TooltipButton client:load tooltip="Close menu" aria-label="Close menu">
 *   <ButtonSlot><X /></ButtonSlot>
 * </TooltipButton>
 */
export function TooltipButton({
  tooltip,
  className,
  ...props
}: TooltipButtonProps) {
  return (
    <Tooltip content={tooltip}>
      {/* Without the explicit recipe type, the spread props make TypeScript
          infer a recipe that rejects the class name. */}
      <Button<typeof button>
        {...props}
        // Astro wraps the children of an island in an astro-slot element, which
        // the global styles give the display of the button. The slots and the
        // label would then lose the gap of the button between them.
        className={clsx("[&>astro-slot]:contents!", className)}
      />
    </Tooltip>
  );
}
