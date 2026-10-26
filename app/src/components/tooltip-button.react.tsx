/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { TooltipStore } from "@ariakit/react";
import { useTooltipStore } from "@ariakit/react";
import type { ButtonProps } from "@ariakit/ui/components/button.ariakit.react";
import { Button } from "@ariakit/ui/components/button.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import type { button } from "@ariakit/ui/styles/button";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

/**
 * Whether a transition runs on an element that contains the given element and
 * moves it. Only the document's own animations are read, so they are from this
 * window.
 */
function isMovedByTransition(element: HTMLElement) {
  return element.ownerDocument.getAnimations().some((animation) => {
    if (!(animation.effect instanceof KeyframeEffect)) return false;
    const { target } = animation.effect;
    if (!target) return false;
    if (target === element) return false;
    return target.contains(element);
  });
}

/**
 * Keeps the tooltip on its anchor while a panel around the anchor slides, such
 * as a drawer that the layout script focuses as it opens. An anchor that moves
 * without resizing doesn't update the tooltip position by itself.
 */
function useFollowTransitions(
  store: TooltipStore,
  element: HTMLElement | null,
) {
  useEffect(() => {
    if (!element) return;
    let frame = 0;
    // Updates once more after the transition ends, at the final position.
    const follow = () => {
      const moving = isMovedByTransition(element);
      if (store.getState().open) {
        store.render();
      }
      frame = moving ? requestAnimationFrame(follow) : 0;
    };
    const onTransitionRun = () => {
      if (frame) return;
      frame = requestAnimationFrame(follow);
    };
    const doc = element.ownerDocument;
    doc.addEventListener("transitionrun", onTransitionRun);
    return () => {
      doc.removeEventListener("transitionrun", onTransitionRun);
      cancelAnimationFrame(frame);
    };
  }, [store, element]);
}

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
  const store = useTooltipStore();
  useFollowTransitions(store, element);
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
    <Tooltip store={store} content={showTooltip ? tooltip : null}>
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
