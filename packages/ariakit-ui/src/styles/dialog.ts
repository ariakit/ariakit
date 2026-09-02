import { cv } from "clava";
import { button } from "./button.ts";
import { layer } from "./layer.ts";
import { popover, popoverDescription, popoverScroll } from "./popover.ts";

export const dialog = cv({
  extend: [popover],
  class: [
    // A class rather than a variant, so a breakpoint can still move it: an
    // inline style from a variant is out of reach of any media query.
    "[--dialog-inset:--spacing(3)]",
    "fixed inset-(--dialog-inset) m-auto h-fit",
    // Ariakit measures the visual viewport into this property, so a virtual
    // keyboard shrinks the dialog instead of covering it. A native dialog has
    // no such measurement and takes the dynamic viewport.
    "max-h-[calc(var(--dialog-viewport-height,100dvh)-var(--dialog-inset)*2)]",
    "backdrop:backdrop-blur-xs",
  ],
});

export const dialogBackdrop = cv({
  extend: [layer],
  // A translucent wash of the surface it covers. The layer paints that same
  // colour opaque, and these only win over it by sorting later.
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
