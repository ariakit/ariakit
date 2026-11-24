import type { VariantProps } from "clava";
import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button } from "./button.ts";
import {
  popover,
  popoverDescription,
  popoverDismiss,
  popoverScroll,
} from "./popover.ts";
import {
  hasSlotSurface,
  slotFrame,
  slotFrameContent,
  slotFrameSlot,
} from "./slot-frame.ts";
import { text } from "./text.ts";

const sheetClass = cx("ui-dialog-fixed-height ui-dialog--sheet");

/**
 * A centered dialog constrained to the viewport, with the `2xl` corners of a
 * popover.
 */
export const dialog = cv({
  extend: [popover],
  class: [
    "ui-dialog",
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "ui-backdrop:bg-(--ak-layer)/10 ak-dark:ui-backdrop:bg-(--ak-layer)/30",
    "ui-backdrop:backdrop-blur-xs",
  ],
  variants: {
    /**
     * Where the dialog sits in the viewport, inside its insets. `start` and
     * `end` make a side sheet: it takes the full height at that side, with a
     * smaller inset, and it slides in from that side. An edge or a corner suits
     * a non-modal dialog, which leaves the page in view.
     */
    $placement: {
      center: "m-auto",
      start: ["ui-dialog--placement-start", sheetClass],
      end: ["ui-dialog--placement-end", sheetClass],
      top: "ui-dialog--placement-top",
      bottom: "ui-dialog--placement-bottom",
      "top-start": "ui-dialog--placement-top-start",
      "top-end": "ui-dialog--placement-top-end",
      "bottom-start": "ui-dialog--placement-bottom-start",
      "bottom-end": "ui-dialog--placement-bottom-end",
    },
    /**
     * Sets the maximum width. The dialog takes this width when the viewport has
     * room for it. Numbers scale the spacing token, so `100`, the default, is
     * `25rem` in 16px text. Strings are CSS lengths.
     */
    $maxWidth(value?: string | number) {
      if (value == null) return;
      return { style: { "--dialog-max-width": getSpacingValue(value) } };
    },
    /**
     * Sets a height that doesn't follow the content, such as for a dialog that
     * changes its content but not its size. The maximum height still applies.
     * Numbers scale the spacing token; strings are CSS lengths. The dialog is
     * then a flex column, so a `DialogScroll` fills it. By default, the dialog
     * fits its content.
     */
    $height(value?: string | number) {
      if (value == null) return;
      return {
        class: "ui-dialog-fixed-height",
        style: { "--dialog-height": getSpacingValue(value) },
      };
    },
  },
  defaultVariants: {
    $placement: "center",
  },
});

/** A button that opens a dialog. */
export const dialogDisclosure = cv({
  extend: [button],
});

/** Button styles for a dialog dismiss control. */
export const dialogDismiss = popoverDismiss;

// The negative margin of a close button without a surface.
const CLOSE_PULL = "calc(var(--ak-frame-padding,0px)*-1)";

/** Whether a fill, a border, or a bevel shows the box of a button. */
function hasButtonSurface(variants: VariantProps<typeof button>) {
  if (variants.$kind === "bevel") return true;
  return hasSlotSurface(variants);
}

/**
 * A quiet icon button that closes a dialog, such as at the end of a
 * `DialogHeader`. Without a surface, it takes a negative margin as large as its
 * padding, so its layout box is one text row and its icon lines up with the
 * content of the dialog. Its hover surface then takes the room around it, and
 * in a corner, the surface is concentric with the corner of the dialog. A
 * button with a fill, a border, or a bevel keeps its margin.
 */
export const dialogClose = cv({
  extend: [dialogDismiss],
  class: "flex-none",
  defaultVariants: {
    $ink: 60,
    $m(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (hasButtonSurface(variants)) return defaultValue;
      return CLOSE_PULL;
    },
  },
  refine({ variants, addClass }) {
    if (variants.$m !== CLOSE_PULL) return;
    // The start side keeps its margin, so the hover surface stays off the
    // title. In a bar, the top and bottom margins keep the button centered. In
    // a header, the button sits at the top of the row, so the bottom side keeps
    // its margin, and the hover surface stays off the content below. The extra
    // class outranks the frame margin.
    addClass("[&.ak-frame]:ms-0 [.ui-dialog-header>&.ak-frame]:mbe-0");
  },
});

/**
 * A row at the top of a dialog for its title, its description, and a
 * `DialogClose` button. It lays out its parts like a slot frame without
 * padding: an icon in a `DialogHeaderSlot` starts at the content edge of the
 * dialog, and the slots and the close button line up with the first text row.
 * It doesn't open a frame of its own, so its parts take their corners from the
 * dialog.
 */
export const dialogHeader = cv({
  extend: [slotFrame],
  class: "ui-dialog-header items-start",
  variants: {
    /**
     * Sets the vertical gap between the title and the description in a
     * `DialogHeaderContent`. `auto`, the default, is half the gap of the
     * header, so a large title stays apart from the smaller description.
     */
    $gapY(value?: "none" | "auto") {
      // Replace the inherited gap variant instead of adding a competing
      // --gap-y.
      if (value !== "auto") return;
      return "[--gap-y:calc(var(--gap)/2)] gap-y-(--gap-y)";
    },
  },
  defaultVariants: {
    $p: "none",
    $gap: "xl",
    $frame: false,
  },
});

/**
 * An icon, avatar, or picture beside the title of a dialog. Set `$rowSpan` to
 * `2` to span the title and the first line of the description.
 */
export const dialogHeaderSlot = cv({
  extend: [slotFrameSlot],
  defaultVariants: {
    // The dialog padding keeps the slot away from the dialog corner, so the
    // slot has its own radius, not one concentric with the dialog.
    $rounded: "lg",
  },
});

/**
 * The title and the description of a dialog header. It fills the free space in
 * the row, so a `DialogClose` after it sits at the end, and it spaces the title
 * and the description with the gaps of the `DialogHeader`.
 */
export const dialogHeaderContent = cv({
  extend: [slotFrameContent],
});

/**
 * A scrollable dialog region that keeps rounded corners. It covers the padding
 * of the dialog and fills the free height of a dialog with a flex column
 * layout, such as one with `$height` or a side sheet. In those dialogs, it is
 * also a size container, so a sticky shell sidebar inside it fits its height,
 * not the height of the window.
 */
export const dialogScroll = cv({
  extend: [popoverScroll],
  class: "ui-dialog-scroll",
});

/**
 * A semibold heading for a dialog. `$size` sets its font size, `lg` by default,
 * such as `md` for a compact header or `xl` for a large dialog.
 */
export const dialogHeading = cv({
  extend: [text],
  class: "font-semibold",
  defaultVariants: {
    $size: "lg",
    $leading: "tight",
  },
});

/**
 * Secondary text for a dialog description. `$size` sets its font size, `0.875`
 * of the dialog text by default, so it reads as secondary under the heading.
 */
export const dialogDescription = cv({
  extend: [popoverDescription, text],
  defaultVariants: {
    $size: 0.875,
  },
});
