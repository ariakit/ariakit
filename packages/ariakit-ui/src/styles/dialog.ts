import { cv } from "clava";
import { button } from "./button.ts";
import { popover, popoverDescription, popoverScroll } from "./popover.ts";

export const dialog = cv({
  extend: [popover],
  class: [
    // Channels rather than variants, so a breakpoint can still move them: an
    // inline style from a variant is out of reach of any media query, and a
    // caller's own max-w-* wins over the channel utility by sorting later.
    "[--dialog-inset:--spacing(3)] [--dialog-max-width:--spacing(100)]",
    "fixed inset-(--dialog-inset) m-auto h-fit",
    // The dialog stretches between the insets up to the cap, so short and
    // long content read as one width. The UA sizes a native dialog to its
    // content instead, and w-auto puts it on the same rule.
    "w-auto max-w-(--dialog-max-width)",
    // Ariakit measures the visual viewport into this property, so a virtual
    // keyboard shrinks the dialog instead of covering it. A native dialog has
    // no such measurement and takes the dynamic viewport.
    "max-h-[calc(var(--dialog-viewport-height,100dvh)-var(--dialog-inset)*2)]",
    // A translucent wash of the surface behind the dialog, through the same
    // channel as the fade: the native ::backdrop and Ariakit's element alike.
    "ui-backdrop:bg-(--ak-layer)/10 ak-dark:ui-backdrop:bg-(--ak-layer)/30",
    "ui-backdrop:backdrop-blur-xs",
  ],
});

export const dialogDisclosure = cv({
  extend: [button],
});

export const dialogDismiss = cv({
  extend: [button],
});

export const dialogScroll = popoverScroll;

// Dialogs are larger surfaces than popovers, so the heading steps up a size
// while keeping the same weight treatment.
export const dialogHeading = cv({
  class: "text-xl font-medium",
});

export const dialogDescription = popoverDescription;
