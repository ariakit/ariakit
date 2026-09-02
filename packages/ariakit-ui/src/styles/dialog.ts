import { cv } from "clava";
import { button } from "./button.ts";
import { layer } from "./layer.ts";
import { popover, popoverDescription, popoverScroll } from "./popover.ts";

export const dialog = cv({
  extend: [popover],
  class: [
    "[--inset:--spacing(3)]",
    "fixed inset-(--inset) m-auto h-fit",
    "max-h-[calc(100dvh-var(--inset)*2)]",
    "backdrop:backdrop-blur-xs",
    // The native backdrop hosts the scroll when the dialog outgrows the
    // viewport, like the legacy ak-dialog.
    "backdrop:overflow-auto backdrop:overscroll-contain",
  ],
});

export const dialogBackdrop = cv({
  extend: [layer],
  class: ["bg-(--ak-layer)/10 ak-dark:bg-(--ak-layer)/30", "backdrop-blur-xs"],
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
