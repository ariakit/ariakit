import { cv } from "clava";
import { button } from "./button.ts";
import {
  popover,
  popoverDescription,
  popoverDismiss,
  popoverScroll,
} from "./popover.ts";

/** A centered dialog constrained to the viewport. */
export const dialog = cv({
  extend: [popover],
  class: [
    // Use CSS channels so responsive sizing classes can override these
    // defaults.
    "[--dialog-inset:--spacing(3)] [--dialog-max-width:--spacing(100)]",
    "fixed inset-(--dialog-inset) m-auto h-fit",
    // Override native dialog content sizing so short content uses the same
    // width.
    "w-auto max-w-(--dialog-max-width)",
    // Use Ariakit's visual viewport height to avoid virtual keyboards; native
    // dialogs fall back to dynamic viewport height.
    "[--dialog-max-height:calc(var(--dialog-viewport-height,100dvh)-var(--dialog-inset)*2)]",
    "max-h-(--dialog-max-height)",
    "ui-backdrop:bg-(--ak-layer)/10 ak-dark:ui-backdrop:bg-(--ak-layer)/30",
    "ui-backdrop:backdrop-blur-xs",
  ],
});

/** A button that opens a dialog. */
export const dialogDisclosure = cv({
  extend: [button],
});

/** Button styles for a dialog dismiss control. */
export const dialogDismiss = popoverDismiss;

/** A scrollable dialog region that keeps rounded corners. */
export const dialogScroll = popoverScroll;

/** A medium-weight heading for a dialog. */
export const dialogHeading = cv({
  class: "text-xl font-medium",
});

/** Secondary text for a dialog description. */
export const dialogDescription = popoverDescription;
