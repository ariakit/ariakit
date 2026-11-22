import { cv, cx } from "clava";

/**
 * The element that holds the parts of a glider. It sits at the start of the
 * scrollable content of its group, so the parts scroll with the items.
 */
export const glider = cv({
  class: "glider absolute top-0 left-0 size-0 pointer-events-none",
});

/**
 * Holds the scale probe of a glider. It has no size and clips the probe, so the
 * probe adds nothing to the scrollable content of the group.
 */
export const gliderScale = cv({
  class: "glider-scale absolute top-0 left-0 size-0 overflow-clip",
});

/**
 * An element with a fixed size at the start of the scrollable content of the
 * group. The `Glider` style component compares its box on the screen with its
 * size to find the scale of CSS zoom or a transform on the group or its
 * ancestors, and measures the boxes of the items from it.
 */
export const gliderScaleProbe = cv({
  class: "glider-scale-probe absolute top-0 left-0 size-[100px]",
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
 * its size as registered properties, and the shift from its last place. The
 * mover goes to its place at once, and the shift travels to zero. The browser
 * animates the shift off the main thread, so the travel stays smooth while the
 * page works. It animates the size with the layout. Each mover has its own
 * values, so a frame of the travel changes the styles of the mover only, and
 * not of the elements inside it.
 */
export const gliderMover = cv({
  class: [
    // The browser places the mover on whole pixels, like the item, so the box
    // has the same sharp edges at rest. A place that only a shift sets would
    // not. At rest, the shift is zero.
    "glider-mover absolute top-(--glider-y) left-(--glider-x)",
    "w-(--glider-width) h-(--glider-height)",
    "translate-x-(--glider-shift-x,0px) translate-y-(--glider-shift-y,0px)",
    "[transition-property:translate,--glider-width,--glider-height]",
    "duration-(--glider-duration,200ms) ease-[cubic-bezier(0.3,0,0,1)]",
    // A track with no place to travel from goes to its item at once.
    "[[data-instant]_&]:[transition-property:none]",
    // The shift from the last place applies at once, and then travels. The size
    // keeps its travel.
    "[[data-shifting]_&]:[transition-property:--glider-width,--glider-height]",
  ],
});

// The distances of the selected box from the ends of its group, which travel
// with the box, plus the distances of the group from the ends of its row, which
// change at once, such as while a part of the row folds. The Glider style
// component writes both parts.
const gliderPlace = cx(
  "[--glider-start:calc(var(--glider-travel-start)+var(--glider-row-start))]",
  "[--glider-end:calc(var(--glider-travel-end)+var(--glider-row-end))]",
);

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
    gliderPlace,
    "[transition-property:--glider-travel-start,--glider-travel-end]!",
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
    "[.glider-window>&]:-translate-x-(--glider-shift-x,0px)",
    "[.glider-window>&]:-translate-y-(--glider-shift-y,0px)",
    "[.glider-window>&]:[transition-property:translate]",
    "[.glider-window>&]:duration-(--glider-duration,200ms)",
    "[.glider-window>&]:ease-[cubic-bezier(0.3,0,0,1)]",
    "[[data-instant]_&]:[transition-property:none]",
    // The selector also names the window, so this rule wins over the rule
    // above that names it.
    "[[data-shifting]_.glider-window>&]:transition-none",
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
 * `glider-scope` class around its group. They get `--glider-start` and
 * `--glider-end`, the distances of the box from the start and from the end of
 * its group, and the `Glider` sets `data-glider-following` on them while it is
 * on. In a row with the `glider-row` class, the distances reach the ends of the
 * row.
 */
export const gliderFollower = cx(
  "glider-follower",
  gliderPlace,
  "[transition-property:--glider-travel-start,--glider-travel-end]",
  "duration-(--glider-duration,200ms) ease-[cubic-bezier(0.3,0,0,1)]",
  "data-glider-instant:transition-none",
);

/**
 * The classes of a follower that is the parent of the group of its glider, such
 * as a sticky tab row around its strip. The glider of that group still finds
 * the followers in the scope around the holder, unlike a group directly in
 * another follower, such as a navigation in the panels, which has no followers.
 */
export const gliderHolder = cx(gliderFollower, "glider-holder");

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
    // A separator that hides beside the item that the box travels to fades with
    // the travel, so it is gone when the box arrives. A transition takes the
    // timing of the new state, so a hover or focus fade keeps its own timing.
    "[&_.control-separator]:ui-adjacent-selected:duration-(--glider-duration,200ms)",
    "[&_.control-separator]:ui-adjacent-selected:ease-[cubic-bezier(0.3,0,0,1)]",
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
