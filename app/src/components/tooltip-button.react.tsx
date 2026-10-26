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
import { useEffect, useState } from "react";

export interface TooltipButtonProps extends ButtonProps {
  /** The tooltip text. Astro passes only serializable props to an island. */
  tooltip: string;
  /**
   * Shows the tooltip only while the button shows no text, such as when a
   * container query hides its label.
   */
  tooltipWhenIconOnly?: boolean;
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
  tooltipWhenIconOnly,
  className,
  ...props
}: TooltipButtonProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  // The server can't measure the button, so a conditional tooltip starts off.
  const [iconOnly, setIconOnly] = useState(false);

  // A label that a container query hides changes the button size. Hidden text
  // is not part of innerText.
  useEffect(() => {
    if (!tooltipWhenIconOnly) return;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setIconOnly(!element.innerText.trim());
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [tooltipWhenIconOnly, element]);

  const showTooltip = !tooltipWhenIconOnly || iconOnly;
  return (
    <Tooltip content={showTooltip ? tooltip : null}>
      {/* Without the explicit recipe type, the spread props make TypeScript
          infer a recipe that rejects the ref. */}
      <Button<typeof button>
        {...props}
        ref={setElement}
        // Astro wraps the children of an island in an astro-slot element, which
        // the global styles give the display of the button. The slots and the
        // label would then lose the gap of the button between them.
        className={clsx("[&>astro-slot]:contents!", className)}
      />
    </Tooltip>
  );
}
