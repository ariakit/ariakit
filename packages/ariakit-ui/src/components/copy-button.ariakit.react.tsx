import { getWindow } from "@ariakit/utils";
import { cx } from "clava";
import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import * as React from "react";
import { hasContent } from "../react-utils/create-render.react.ts";
import type { ButtonProps } from "./button.ariakit.react.tsx";
import { Button, ButtonLabel, ButtonSlot } from "./button.ariakit.react.tsx";
import type { TooltipProps } from "./tooltip.ariakit.react.tsx";
import { Tooltip } from "./tooltip.ariakit.react.tsx";

export interface CopyButtonProps extends Omit<ButtonProps, "recipe" | "value"> {
  /**
   * The text to copy. A function runs on each click, for text that only exists
   * at that moment, such as `location.href` or the content of an editor. It
   * must return a string right away, as Safari rejects a copy that waits for a
   * promise. If it throws, the button reports a failed copy.
   */
  value: string | (() => string);
  /**
   * The accessible name and the tooltip of a button without children.
   * @default "Copy"
   */
  label?: string;
  /**
   * The text that reports a successful copy.
   * @default "Copied"
   */
  copiedLabel?: string;
  /**
   * The text that reports a failed copy, such as when the page isn't in a
   * secure context or the browser denies access to the clipboard.
   * @default "Couldn't copy"
   */
  failedLabel?: string;
  /**
   * How long the feedback stays, in milliseconds. Each copy restarts the time.
   * @default 2000
   */
  feedbackDuration?: number;
  /**
   * Props for the `Tooltip` of a button without children, such as `placement`.
   * A button with children has no tooltip, because its label is visible.
   */
  tooltip?: Omit<TooltipProps, "children" | "text">;
}

/**
 * A button that copies text to the clipboard and reports the result with its
 * icon, its tooltip or label, and a status message. Without children, it's an
 * icon button named by `label`. Children become a visible label, and they name
 * the button. The `Button` variants work, and the status message is a visually
 * hidden sibling of the button, so screen readers announce the result. That
 * sibling keeps a `$cover` button from counting as the last child of its frame,
 * so add `$frameEnd` when it is.
 * @example
 * <CopyButton value="https://ariakit.com" label="Copy link" />
 * @example
 * <CopyButton value="https://ariakit.com">Copy link</CopyButton>
 */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  failedLabel = "Couldn't copy",
  feedbackDuration = 2000,
  tooltip,
  onClick,
  children,
  ...props
}: CopyButtonProps) {
  // Each copy sets a new object, which restarts the timer below, so a copy
  // during the feedback of an earlier one gets the full duration too.
  const [feedback, setFeedback] = React.useState<{ failed: boolean }>();
  const hasLabel = hasContent(children);
  const feedbackLabel = feedback?.failed ? failedLabel : copiedLabel;
  const Icon = feedback ? (feedback.failed ? XIcon : CheckIcon) : CopyIcon;

  React.useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(undefined), feedbackDuration);
    return () => clearTimeout(timeout);
  }, [feedback, feedbackDuration]);

  const copy = async (element: Element) => {
    try {
      const text = typeof value === "function" ? value() : value;
      await getWindow(element).navigator.clipboard.writeText(text);
      setFeedback({ failed: false });
    } catch {
      setFeedback({ failed: true });
    }
  };

  return (
    <>
      <Tooltip
        {...tooltip}
        text={hasLabel ? null : feedback ? feedbackLabel : label}
      >
        <Button
          aria-label={hasLabel ? undefined : label}
          {...props}
          onClick={(event) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            void copy(event.currentTarget);
          }}
        >
          <ButtonSlot aria-hidden>
            <Icon />
          </ButtonSlot>
          {hasLabel && (
            // Both texts share one grid cell, so a copy doesn't resize the
            // button. The children stay in the accessibility tree, so the name
            // of the button doesn't change.
            <ButtonLabel
              $truncate={false}
              className="grid text-start *:[grid-area:1/1]"
            >
              <span className={cx(feedback && "opacity-0")}>{children}</span>
              <span aria-hidden className={cx(!feedback && "opacity-0")}>
                {feedbackLabel}
              </span>
            </ButtonLabel>
          )}
        </Button>
      </Tooltip>
      {/* Touch screens don't show tooltips, and screen readers don't read them.
          The message is outside the button, because a button hides the roles
          of its children, including this live region. */}
      <span role="status" className="sr-only">
        {feedback && feedbackLabel}
      </span>
    </>
  );
}
