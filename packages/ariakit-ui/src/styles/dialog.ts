import { cv } from "clava";
import { button } from "./button.ts";
import { layer } from "./layer.ts";
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
    "backdrop:backdrop-blur-xs",
  ],
});

export const dialogBackdrop = cv({
  extend: [layer],
  class: [
    // A translucent wash of the surface it covers. The layer paints that same
    // colour opaque, and these only win over it by sorting later.
    "bg-(--ak-layer)/10 ak-dark:bg-(--ak-layer)/30",
    "backdrop-blur-xs",
  ],
  variants: {
    /**
     * Selects how the open state is detected for the fade. `data` follows the
     * `data-open` attribute Ariakit sets on the backdrop element it renders,
     * and `none` renders a plain wash with no transition, for previews and
     * for backdrops another library animates.
     */
    $state: {
      none: "",
      data: [
        // The fade the native ::backdrop takes in popover, on the element
        // Ariakit renders in its place. The arbitrary property keeps the
        // browser's default easing, the way that channel does.
        "[transition-property:opacity] duration-250",
        "data-open:starting:opacity-0",
        "not-data-open:opacity-0",
      ],
    },
  },
  defaultVariants: {
    $state: "data",
  },
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
