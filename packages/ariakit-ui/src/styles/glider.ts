import { cv, cx } from "clava";

/**
 * The element that holds the parts of a glider. It sits at the start of the
 * scrollable content of its group, so the parts scroll with the items.
 */
export const glider = cv({
  class: "glider absolute top-0 left-0 size-0 pointer-events-none",
});

/**
 * Holds one box and the window that travels with it. It sits behind the items,
 * so the text of the items shows over the box.
 */
export const gliderTrack = cv({
  class: [
    "glider-track absolute top-0 left-0 size-0 -z-1",
    // A track fades when it shows or hides.
    "transition-opacity duration-150 data-hidden:opacity-0",
    "data-instant:transition-none",
    // While it travels, the box covers the items under it, and the window shows
    // a copy of those items in the state of the box. Items can set their own
    // place in the stack, as tabs do, so the track goes above them.
    "data-traveling:z-10",
  ],
});

/**
 * An element that travels. The `Glider` style component writes its place and
 * its size as registered properties, which the browser animates. Each mover has
 * its own values, so a frame of the travel changes the styles of the mover
 * only, and not of the elements inside it.
 */
export const gliderMover = cv({
  class: [
    // The browser places the mover on whole pixels, like the item, so the box
    // has the same sharp edges at rest. A move with translate would not.
    "glider-mover absolute top-(--glider-y) left-(--glider-x)",
    "w-(--glider-width) h-(--glider-height)",
    "[transition-property:--glider-x,--glider-y,--glider-width,--glider-height]",
    "duration-(--glider-duration,200ms) ease-[cubic-bezier(0.3,0,0,1)]",
    // A track with no place to travel from goes to its item at once.
    "[[data-instant]_&]:[transition-property:none]",
  ],
});

/**
 * A box that fills its mover. The `Glider` style component gives it the classes
 * of the item that it copies, so each rule here has `!` to win over the rules
 * of the item.
 */
export const gliderBox = cv({
  class: [
    "glider-box absolute! inset-0! block! box-border! m-0! p-0!",
    "w-auto! h-auto! min-w-0! min-h-0! max-w-none! max-h-none!",
    "translate-none! scale-none!",
    "pointer-events-none! opacity-100!",
    // The item keeps its own focus ring. The box shows only a focus state that
    // the item draws on its surface, such as the edge of a folder tab.
    "outline-none!",
    // The box knows how far it is from each end of the group, so a rule of its
    // item can shape it from its place, as a folder tab does with its curves.
    // Only those distances change with the travel. The box takes the look of
    // the item that it travels to at once.
    "[transition-property:--glider-start,--glider-end]!",
    "duration-(--glider-duration,200ms)! ease-[cubic-bezier(0.3,0,0,1)]!",
    "[[data-instant]_&]:[transition-property:none]!",
  ],
});

/**
 * A mover that clips the copies of the items to the box while the box travels.
 * The `Glider` style component gives it the corner radius of the box.
 */
export const gliderWindow = cv({
  extend: [gliderMover],
  class: "glider-window overflow-clip",
});

/**
 * Holds copies of items at the places of the items. In a window, it travels
 * against the window, so the copies stay over the items.
 */
export const gliderLayer = cv({
  class: [
    "glider-layer absolute top-0 left-0 size-0",
    "[.glider-window>&]:-left-(--glider-x)",
    "[.glider-window>&]:-top-(--glider-y)",
    "[.glider-window>&]:[transition-property:--glider-x,--glider-y]",
    "[.glider-window>&]:duration-(--glider-duration,200ms)",
    "[.glider-window>&]:ease-[cubic-bezier(0.3,0,0,1)]",
    "[[data-instant]_&]:[transition-property:none]",
  ],
  variants: {
    /** Puts the copies behind the items, like a box at rest. */
    $behind: "-z-1",
  },
});

/**
 * The classes of an element that follows the selected box of a glider, such as
 * the panel of folder tabs. The `Glider` style component finds the elements
 * with the `glider-follower` class in the nearest element with the
 * `glider-scope` class around its group. It writes `--glider-start` and
 * `--glider-end` to them, the distances of the box from the start and from the
 * end of its group, and sets `data-glider-following` on them while it is on.
 */
export const gliderFollower = cx(
  "glider-follower",
  "[transition-property:--glider-start,--glider-end]",
  "duration-(--glider-duration,200ms) ease-[cubic-bezier(0.3,0,0,1)]",
  "data-glider-instant:transition-none",
);

/** A copy of an item, which has the classes of the item too. */
export const gliderCopy = cv({
  class: "glider-copy absolute! m-0! box-border! pointer-events-none!",
});

/**
 * The classes of a group while a glider is on. The `Glider` style component
 * adds them to the element around the items after hydration, so the items paint
 * their own state on the server, with forced colors, and with reduced motion.
 */
export const gliderGroup = cv({
  class: [
    // Keeps the boxes, which sit behind the items, above the group surface.
    "glider-group isolate",
    // The selected box paints the surface that the selected item painted.
    "[&_.control:not(.glider-box)]:ui-selected:bg-transparent!",
    "[&_.control:not(.glider-box)]:ui-selected:bg-none!",
    "[&_.control:not(.glider-box)]:ui-selected:[box-shadow:none]!",
    "[&_.control:not(.glider-box)]:ui-selected:border-transparent!",
    // A folder tab draws its curves on pseudo-elements, and the box draws them
    // too.
    "[&_.ui-folder:not(.glider-box)]:ui-selected:before:hidden!",
    "[&_.ui-folder:not(.glider-box)]:ui-selected:after:hidden!",
    // The item that the box travels to keeps its place and its clicks, and a
    // copy shows its content in the idle state until the box arrives.
    "[&_.control[data-glider-masked]]:text-transparent!",
    "[&_.control[data-glider-masked]>:not(input)]:opacity-0!",
  ],
  variants: {
    /**
     * Makes the group the place that the boxes are measured from. The `Glider`
     * style component sets it for a group with no position of its own.
     */
    $positioned: "relative",
    /**
     * Adds a second box that follows the hovered item, and paints the hover
     * surface of the items.
     */
    $hover: [
      "[&_.control:not(.glider-box)]:ui-hover:bg-transparent!",
      "[&_.control:not(.glider-box)]:ui-hover:bg-none!",
      "[&_.control:not(.glider-box)]:ui-hover:[box-shadow:none]!",
      "[&_.control:not(.glider-box)]:ui-hover:border-transparent!",
      // An unselected folder tab paints its hover surface on a pseudo-element.
      "[&_.ui-folder:not(.glider-box)]:ui-hover:after:bg-transparent!",
    ],
  },
});
