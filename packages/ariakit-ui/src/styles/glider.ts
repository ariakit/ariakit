import { cv, cx } from "clava";

/**
 * The element that holds the parts of a glider. It sits at the start of the
 * scrollable content of its group, so the parts scroll with the items.
 */
export const glider = cv({
  class: "ui-glider",
});

/**
 * Holds the scale probe of a glider. It has no size and clips the probe, so the
 * probe adds nothing to the scrollable content of the group.
 */
export const gliderScale = cv({
  class: "ui-glider-scale",
});

/**
 * An element with a fixed size at the start of the scrollable content of the
 * group. The `Glider` style component compares its box on the screen with its
 * size to find the scale of CSS zoom or a transform on the group or its
 * ancestors, and measures the boxes of the items from it.
 */
export const gliderScaleProbe = cv({
  class: "ui-glider-scale-probe",
});

/**
 * Holds one box and the window that travels with it. It sits behind the items,
 * so the text of the items shows over the box.
 */
export const gliderTrack = cv({
  class: "ui-glider-track",
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
  class: "ui-glider-mover",
});

/**
 * A box that fills its mover. The `Glider` style component gives it the classes
 * of the item that it copies, so each rule here has `!` to win over the rules
 * of the item.
 */
export const gliderBox = cv({
  class: [
    "ui-glider-box",
    // The box knows how far it is from each end of the group, so a rule of its
    // item can shape it from its place, as a folder tab does with its curves.
    // Only those distances change with the travel. The box takes the look of
    // the item that it travels to at once.
    "ui-glider-place",
  ],
});

/**
 * A mover that clips the copies of the items to the box while the box travels.
 * The `Glider` style component gives it the corner radius of the box.
 */
export const gliderWindow = cv({
  extend: [gliderMover],
  class: "ui-glider-window overflow-clip",
});

/**
 * Holds copies of items at the places of the items. In a window, it travels
 * against the window, so the copies stay over the items.
 */
export const gliderLayer = cv({
  class: "ui-glider-layer",
  variants: {
    /** Puts the copies behind the items, like a box at rest. */
    $behind: "-z-1",
  },
});

/**
 * The classes of an element that follows the selected box of a glider, such as
 * the panel of folder tabs. The `Glider` style component finds the elements
 * with the `ui-glider-follower` class in the nearest element with the
 * `ui-glider-scope` class around its group. They get `--glider-start` and
 * `--glider-end`, the distances of the box from the start and from the end of
 * its group, and the `Glider` sets `data-glider-following` on them while it is
 * on. In a row with the `ui-glider-row` class, the distances reach the ends of
 * the row.
 */
export const gliderFollower = cx("ui-glider-follower ui-glider-place");

/**
 * The classes of a follower that is the parent of the group of its glider, such
 * as a sticky tab row around its strip. The glider of that group still finds
 * the followers in the scope around the holder, unlike a group directly in
 * another follower, such as a navigation in the panels, which has no followers.
 */
export const gliderHolder = cx(gliderFollower, "ui-glider-holder");

/** A copy of an item, which has the classes of the item too. */
export const gliderCopy = cv({
  class: "ui-glider-copy",
});

/**
 * The classes of a group while a glider is on. The `Glider` style component
 * adds them to the element around the items after hydration, so the items paint
 * their own state on the server, with forced colors, and with reduced motion.
 */
export const gliderGroup = cv({
  class: "ui-glider-group",
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
    $hover: "ui-glider-group--hover",
  },
});
