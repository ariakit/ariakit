import { cv, cx } from "clava";
import { getPaddingValue, getSpacingValue } from "../utils/styles.ts";
import { frame, frameBase, getFramePaddingClass } from "./frame.ts";
import type { FramePaddingValue } from "./frame.ts";
import { layer } from "./layer.ts";

export type ShellWidth = string | number;

/**
 * A page layout with a header, main content, footer, and up to two sidebars per
 * side. Closed or absent sidebars take no space.
 */
export const shell = cv({
  extend: [frame],
  class: [
    "ui-shell",
    // Stays a class to come after the classes of a caller, so that the reduced
    // motion rule still applies.
    "motion-reduce:[--shell-motion:0]",
    // Stays a class to come after the classes of a caller, so that the print
    // rule still applies.
    "print:h-auto print:min-h-0",
  ],
  variants: {
    /**
     * Sets the base text size. Bar heights, sidebar rows, and spacing follow
     * it; `Prose` stays at 1rem unless `ShellMain` sets `$size`. `auto` uses
     * `sm`, or the outer shell's size in a nested shell. Use another value to
     * change a nested shell's size. Defaults to `auto`.
     */
    // Each size also sets the bar step in rem. Firefox resolves a registered em
    // length against the parent font when the element changes its own size. The
    // shell radius divides the theme radius by the text size, so the corner
    // matches Chrome's macOS window (20px at the default radius) at every size
    // without rounding the shell itself. The leading lets parts inside a sized
    // main return to the shell's line height.
    $size: {
      auto: "ui-shell--size-auto",
      sm: "ui-shell--size-sm text-sm",
      md: "ui-shell--size-md text-base",
      lg: "ui-shell--size-lg text-lg",
    },
    /**
     * Sets what the content of this shell is centered on while main has free
     * space. `shell` counts the sidebars of this shell. `outer` also counts the
     * open sidebars of the outer shell, so a shell in a panel of the outer
     * main, such as a chat with its own settings sidebar in a tab panel, keeps
     * its content on the center of the outer shell. The outer shell is the
     * shell around this one when this shell is directly inside it, or else the
     * shell whose `ShellMain` holds it, through any wrappers. A shell with
     * `outer` centers on that shell only, not on shells further out. Keep the
     * same space between that main and this shell at both sides. The content
     * column of `ShellMainBody` is already centered on the outer shell, so use
     * `outer` for a shell that spans main, such as one in a panel or in
     * `ShellFull`. In that main, the folds of this shell take the timing of the
     * outer shell unless `$duration` sets its own. Defaults to `shell`.
     */
    $center: {
      shell: "",
      outer: "ui-shell-center-outer",
    },
    /**
     * Sets the duration of sidebar folds and content compensation. Numbers are
     * milliseconds. Zero and reduced motion disable these animations.
     */
    $duration(value?: string | number) {
      if (value == null) return;
      const duration = typeof value === "number" ? `${value}ms` : value;
      return { style: { "--shell-duration": duration } };
    },
    /**
     * Sets the default maximum width of the content areas in this shell's
     * header and footer, of a `ShellMain` in this shell, and of a `Shell`
     * directly inside it, where it is the box that holds that shell's sidebars
     * and main. The shell, its bars, and its own sidebars keep the full width.
     * Next to that inner shell, the areas in the bars take this width less the
     * bar's padding on each side, so they start where parts at the bar's edges
     * do, inside the box. With the default space of the bars, that is on the
     * rows of its sidebars. A `$maxWidth` on a bar or on `ShellMain` replaces
     * the default for that part. On the inner `Shell`, it sets the defaults for
     * that shell's parts, and the box keeps this width. `$show` on the inner
     * shell's sidebars measures that shell's full width, so keep it at or below
     * this width. Numbers count quarters of the shell's text size, like the
     * default spacing token. Other values must be CSS lengths, not percentages.
     */
    $maxWidth(value?: ShellWidth) {
      if (value == null) return;
      // The step is in rem, so Firefox doesn't resolve a number against the
      // parent's text when the shell sets its own size.
      const width =
        typeof value === "number"
          ? `calc(var(--shell-header-step) * (${value}))`
          : value;
      return {
        class: "ui-shell--paged",
        style: { "--shell-max-width": width, "--shell-main-max-width": width },
      };
    },
  },
  defaultVariants: {
    $size: "auto",
    $center: "shell",
    $layer: "transparent",
    $rounded: "var(--shell-radius)",
    $p: "none",
  },
});

/**
 * A surface with one facing edge that preserves the nested frame border
 * channel.
 */
const seam = cv({
  extend: [frame],
  class: "rounded-none! ak-frame-border-0",
  variants: {
    /**
     * Sets the facing edge width in pixels. `true` means 1px; `false` means
     * zero. `inherit` uses the inherited edge color.
     */
    $border(value?: "inherit" | boolean | number) {
      if (value == null) return;
      if (value === "inherit") return "ak-edge-inherit";
      const width = typeof value === "boolean" ? Number(value) : value;
      return { style: { "--border-width": `${width}px` } };
    },
    /**
     * Draws the facing edge as a solid or a dashed border. To draw no edge, set
     * `$border` to `false`, like on other frames.
     */
    $borderType(value?: "border" | "dashed") {
      if (value === "border") {
        return [
          "ui-shell-facing-border",
          "[--shell-facing-border:var(--border-width)]",
        ];
      }
      if (value === "dashed") {
        return cx(
          "ui-shell-facing-border",
          "border-dashed [--shell-facing-border:var(--border-width)]",
        );
      }
      // Another border type of a frame doesn't draw a one-sided edge.
      return "[--shell-facing-border:0px]";
    },
  },
  defaultVariants: {
    // Paint the layer so scrolling content does not show through bars and
    // sidebars.
    $layer: true,
    $border: true,
    $borderType(defaultValue) {
      // Frame's adaptive and inherited defaults do not draw one-sided edges.
      switch (defaultValue) {
        case "border":
        case "dashed":
          return defaultValue;
        default:
          return "border";
      }
    },
  },
});

/**
 * Default padding at the sides of a bar: the space above and below a default
 * control. Each bar reads it from its own space, so a bar that takes its space
 * from the shell header gets that header's space. The space rounds to a whole
 * pixel like the space in the bar's height, so the sides match the space above
 * and below a default control. The default three steps round like the main
 * gutter and the sidebar body's padding, so they all keep one edge.
 */
const barInsetDefault = "var(--shell-bar-inset)";

/** The padding at the sides of a bar, apart from the space that `$p` sets. */
const barPaddingVariants = {
  /**
   * Sets the padding at the sides apart from `$p`, which still sets the height.
   * Numbers scale the spacing token and round to a whole pixel; strings pass
   * through as CSS lengths or expressions. `none` removes the padding. Defaults
   * to the space that `$p` sets.
   */
  $px(value?: FramePaddingValue) {
    return getFramePaddingClass(value);
  },
};

/**
 * Three columns keep the center aligned until a side needs more room. Content
 * minimums come from `1fr`; physical safe-area insets set the minimum side
 * padding. Without a center part, each side track fits its part, so a side part
 * can take the room that the other side part leaves before its content wraps.
 * Other content in the middle track needs a center part to stay centered. A
 * side part with `$grow` keeps its half. With a content area, the columns aim
 * the middle one at main's column instead. Every bar reads the sidebars,
 * because a selector can't let only the bars with an area through the shell's
 * reset without restyling what they hold on each toggle.
 */
const bar = cx(
  "ui-shell-bar ui-shell-slot-state",
  // Stays a class, so that the padding of `shellFooter` still comes after it
  // and replaces it.
  "py-0!",
);

/**
 * The 80% surface keeps text contrast above 7:1. Use an opaque fallback when
 * backdrop filters are unsupported or transparency is reduced. Backdrop filters
 * create stacking and fixed-position contexts; nested filters do not compose.
 */
const blur = cx(
  "backdrop-blur-md",
  // Stays a class to come after the background-color of `layer`, which it
  // replaces.
  "bg-[color-mix(in_oklab,var(--ak-layer)_80%,transparent)]",
  "supports-[not(backdrop-filter:blur(1px))]:bg-(--ak-layer)",
  "[@media(prefers-reduced-transparency:reduce)]:bg-(--ak-layer)",
);

/** The settings of main that a content area in a bar needs to match. */
const barAreaVariants = {
  /**
   * Sets the main gutter that a content area in this bar uses to find main's
   * column. Set it to the same value as `$p` on `ShellMain`. The padding at the
   * bar's sides stays the smallest space at its edge. Numbers scale the spacing
   * token and round to a whole pixel, and they follow the element's text. So
   * when `ShellMain` sets `$size`, set a CSS length on both. Defaults to the
   * default main gutter.
   */
  $gutter(value?: "none" | (string & {}) | number) {
    if (value == null) return;
    return {
      style: {
        "--shell-gutter": getPaddingValue(value === "none" ? 0 : value),
      },
    };
  },
  /**
   * Sets the width of main's column that a content area in this bar aims for.
   * Set it to the same value as `$maxWidth` on `ShellMain`. Numbers scale the
   * spacing token, and they follow the element's text. So when `ShellMain` sets
   * `$size`, set a CSS length on both. Defaults to `$maxWidth` on the shell,
   * less the bar's padding on each side next to a shell directly inside it, or
   * to the shell's column, which follows `$size` on `ShellMain`.
   */
  $maxWidth(value?: ShellWidth) {
    if (value == null) return;
    return { style: { "--shell-main-max-width": getSpacingValue(value) } };
  },
};

/**
 * A shell header with three aligned sections and optional sticky positioning.
 */
export const shellHeader = cv({
  extend: [seam],
  class: [bar, "ui-shell-header"],
  variants: {
    ...barAreaVariants,
    ...barPaddingVariants,
    /**
     * Sets the space around the content, in whole steps of the spacing token
     * from 0 to 6. It pads the sides, and it makes the header as tall as a
     * default control plus this space above and below it. The facing edge adds
     * to that height. A taller part takes its extra height from the space. The
     * shell reads the height from this value to place sticky parts, so a CSS
     * length goes to `$px`, which sets only the sides. Defaults to 3.
     */
    $p: {
      0: "ui-shell-header--p-0",
      1: "ui-shell-header--p-1",
      2: "ui-shell-header--p-2",
      3: "ui-shell-header--p-3",
      4: "ui-shell-header--p-4",
      5: "ui-shell-header--p-5",
      6: "ui-shell-header--p-6",
    },
    /**
     * Sets the facing edge width in whole pixels from 0 to 5. `true` means 1px;
     * `false` means zero. `inherit` uses the inherited edge color and width.
     * The edge adds to the height that `$p` sets. The shell reads that sum to
     * place sticky parts, so the width is one of these values.
     */
    $border: {
      true: "ui-shell-header--border-true",
      false: "ui-shell-header--border-false",
      0: "ui-shell-header--border-0",
      1: "ui-shell-header--border-1",
      2: "ui-shell-header--border-2",
      3: "ui-shell-header--border-3",
      4: "ui-shell-header--border-4",
      5: "ui-shell-header--border-5",
      inherit: "ui-shell-header--border-inherit ak-edge-inherit",
    },
    /**
     * Keeps the header in view within its row and reserves its space. Sticky
     * sidebars and anchors use its height as an offset. Defaults to `true`.
     */
    $sticky: "ui-shell-header--sticky",
    /**
     * Blurs the page behind a translucent surface. Uses an opaque surface when
     * backdrop filters are unsupported or transparency is reduced.
     */
    $blur: blur,
    /**
     * Moves the center section to a full-width second row below 40rem. The
     * header grows by that row, but the shell still reads the height that `$p`
     * sets. So parts that stick below a sticky header keep the offset of one
     * row. A center section in a content area keeps its row even when CSS hides
     * it, so render it only where it shows.
     */
    $stackCenter: "ui-shell-header--stack-center",
  },
  defaultVariants: {
    $sticky: true,
    $p: 3,
    $px: barInsetDefault,
  },
});

/**
 * A header or footer section that preserves its content width by default. Next
 * to a content area, tracks have no gaps, so an empty side track doesn't move
 * the area off the column. Each part keeps the space itself.
 */
export const shellBarPart = cv({
  class: "ui-shell-bar-part",
  variants: {
    /**
     * Lets the section shrink below its content width. Use `truncate` on text
     * and `min-w-0` or an explicit width on controls. WebKit clips focus rings
     * at the section edge. Use an overflow menu for controls that must remain
     * reachable.
     */
    $shrink: {
      true: "ui-shell-bar-part--shrink-true",
      false: "ui-shell-bar-part--shrink-false",
    },
    /** Fills the section's track instead of using its resting alignment. */
    $grow: {
      true: "ui-shell-bar-part--grow-true justify-self-stretch",
    },
  },
});

/**
 * A side part alone in a bar spans the bar, not only its side track. So its
 * content wraps only when the bar has no more room.
 */
const loneSidePart = cx(
  // Stays a class, so that the grid-column of `shellStart` still comes after
  // it and replaces it.
  "[.ui-shell-bar>&:only-child]:col-span-full",
);

/** The start section of a shell header, footer, or main header. */
export const shellStart = cv({
  extend: [shellBarPart],
  class: [
    "ui-shell-start",
    // Stays a class to come after the grid-column of `loneSidePart`, which it
    // replaces.
    "[.ui-shell-main-header:has(>.ui-shell-bar-part)>&]:col-1 [.ui-shell-bar>.ui-shell-main-band>&]:col-1",
    loneSidePart,
  ],
  variants: {
    // The track also holds the part's margin, so the cap leaves room for it.
    $shrink: {
      true: "ui-shell-start--shrink-true",
    },
    /** Fills the part's track instead of resting at the bar's start edge. */
    $grow: { false: "justify-self-start" },
  },
});

/** The center section of a shell header, footer, or main header. */
export const shellCenter = cv({
  extend: [shellBarPart],
  class: "ui-shell-center",
  variants: {
    /**
     * Gives the center twice the free width. It stays centered while both sides
     * fit within one quarter. Set `$shrink` on both sides for exact centering.
     * Avoid `$shrink` on this section: it fixes the columns at a 1:2:1 ratio.
     */
    $grow: { false: "justify-self-center" },
  },
});

/** The end section of a shell header, footer, or main header. */
export const shellEnd = cv({
  extend: [shellBarPart],
  class: [
    "ui-shell-end",
    // Stays a class to come after the grid-column of `loneSidePart`, which it
    // replaces.
    "[.ui-shell-main-header:has(>.ui-shell-bar-part)>&]:col-3 [.ui-shell-bar>.ui-shell-main-band>&]:col-3",
    loneSidePart,
  ],
  variants: {
    // The track also holds the part's margin, so the cap leaves room for it.
    $shrink: {
      true: "ui-shell-end--shrink-true",
    },
    /** Fills the part's track instead of resting at the bar's end edge. */
    $grow: { false: "justify-self-end" },
  },
});

/**
 * A shell footer with three aligned sections and device-safe bottom spacing.
 */
export const shellFooter = cv({
  extend: [seam],
  class: [
    bar,
    "ui-shell-footer",
    // Stays a class to come after the padding of `bar`, which it replaces.
    "pbs-0! pbe-[env(safe-area-inset-bottom)]!",
  ],
  variants: {
    ...barAreaVariants,
    ...barPaddingVariants,
    /**
     * Sets the space around the content, in whole steps of the spacing token
     * from 0 to 6. It pads the sides, and it makes the footer as tall as a
     * default control plus this space above and below it. The facing edge adds
     * to that height. A taller part takes its extra height from the space. The
     * shell reads the height from this value to place parts above a sticky
     * footer, so a CSS length goes to `$px`, which sets only the sides.
     * Defaults to 3.
     */
    // The shell reads the space only to place parts above a sticky footer, so
    // only a sticky footer sets it on the shell. See the shell's footer height.
    $p: {
      0: "ui-shell-footer--p-0",
      1: "ui-shell-footer--p-1",
      2: "ui-shell-footer--p-2",
      3: "ui-shell-footer--p-3",
      4: "ui-shell-footer--p-4",
      5: "ui-shell-footer--p-5",
      6: "ui-shell-footer--p-6",
    },
    /**
     * Sets the facing edge width in whole pixels from 0 to 5. `true` means 1px;
     * `false` means zero. `inherit` uses the inherited edge color and width.
     * The edge adds to the height that `$p` sets. The shell reads that sum to
     * place parts above a sticky footer, so the width is one of these values.
     */
    $border: {
      true: "ui-shell-footer--border-true",
      false: "ui-shell-footer--border-false",
      0: "ui-shell-footer--border-0",
      1: "ui-shell-footer--border-1",
      2: "ui-shell-footer--border-2",
      3: "ui-shell-footer--border-3",
      4: "ui-shell-footer--border-4",
      5: "ui-shell-footer--border-5",
      inherit: "ui-shell-footer--border-inherit ak-edge-inherit",
    },
    /**
     * Keeps the footer in view at the bottom of the scroll area. Sticky
     * sidebars stop above it, and main content scrolls focused elements above
     * it. Defaults to `false`.
     */
    $sticky: "ui-shell-footer--sticky",
    /**
     * Blurs the page behind a translucent surface. Uses an opaque surface when
     * backdrop filters are unsupported or transparency is reduced.
     */
    $blur: blur,
  },
  defaultVariants: {
    $p: 3,
    $px: barInsetDefault,
  },
});

/**
 * A sidebar column that folds to zero width while its panel keeps its full
 * width. Reopening animates without an entrance animation on first render.
 * Mirror the panel's `data-open` on the column so it renders in place while the
 * panel is still streaming in.
 */
export const shellSidebar = cv({
  class: "ui-shell-sidebar ui-shell-slot-state flex-col",
  variants: {
    /**
     * Chooses the side. Up to two columns per side follow their DOM order: the
     * first start column is outermost and the first end column is innermost.
     */
    $side: {
      start: "ui-shell-sidebar--side-start",
      end: "ui-shell-sidebar--side-end",
    },
    /**
     * Sets this sidebar's width and publishes it to the shell. `3xs` fits a
     * rail of square icon buttons in a vertical button group at any shell size.
     * Defaults to `md`.
     */
    $width: {
      "3xs": "ui-shell-sidebar--width-3xs",
      xs: "ui-shell-sidebar--width-xs",
      sm: "ui-shell-sidebar--width-sm",
      md: "ui-shell-sidebar--width-md",
      lg: "ui-shell-sidebar--width-lg",
      xl: "ui-shell-sidebar--width-xl",
    },
    /**
     * Shows an open sidebar at or above a named shell-container width. Prefix
     * the name with `max-` to show it only below that width. `true` allows
     * every width; `false` hides it at every width. Defaults to `3xl` (48rem).
     */
    $show: {
      // The extra class outranks the column width, so the column folds outside
      // its range whatever its panel state.
      true: "",
      false: "ui-shell-sidebar--show-false",
      "3xs": "ui-shell-sidebar--show-3xs",
      "2xs": "ui-shell-sidebar--show-2xs",
      xs: "ui-shell-sidebar--show-xs",
      sm: "ui-shell-sidebar--show-sm",
      md: "ui-shell-sidebar--show-md",
      lg: "ui-shell-sidebar--show-lg",
      xl: "ui-shell-sidebar--show-xl",
      "2xl": "ui-shell-sidebar--show-2xl",
      "3xl": "ui-shell-sidebar--show-3xl",
      "4xl": "ui-shell-sidebar--show-4xl",
      "5xl": "ui-shell-sidebar--show-5xl",
      "6xl": "ui-shell-sidebar--show-6xl",
      "7xl": "ui-shell-sidebar--show-7xl",
      "max-3xs": "ui-shell-sidebar--show-max-3xs",
      "max-2xs": "ui-shell-sidebar--show-max-2xs",
      "max-xs": "ui-shell-sidebar--show-max-xs",
      "max-sm": "ui-shell-sidebar--show-max-sm",
      "max-md": "ui-shell-sidebar--show-max-md",
      "max-lg": "ui-shell-sidebar--show-max-lg",
      "max-xl": "ui-shell-sidebar--show-max-xl",
      "max-2xl": "ui-shell-sidebar--show-max-2xl",
      "max-3xl": "ui-shell-sidebar--show-max-3xl",
      "max-4xl": "ui-shell-sidebar--show-max-4xl",
      "max-5xl": "ui-shell-sidebar--show-max-5xl",
      "max-6xl": "ui-shell-sidebar--show-max-6xl",
      "max-7xl": "ui-shell-sidebar--show-max-7xl",
    },
    /**
     * Keeps the panel in place while the column folds, so main uncovers the
     * panel when the sidebar opens and covers it when the sidebar closes. Main
     * also covers the edge of the panel that faces it until the column is fully
     * open, so that edge shows only at rest. A sidebar that main uncovers
     * usually has no edge: set `$border` to `false` on its panel. `zoom` also
     * brings the panel forward: it fades in and grows from 95% to its full
     * size, from its top corner at the outer side of the shell. The panel keeps
     * a scale when it is open, so it is the containing block of fixed elements
     * inside it. Without `$reveal`, the panel moves with the edge that faces
     * main. Defaults to `false`.
     */
    $reveal: {
      true: "ui-shell-sidebar--reveal-place",
      zoom: "ui-shell-sidebar--reveal-place ui-shell-sidebar--reveal-zoom",
    },
    /** Selects the first row the sidebar spans. Defaults to `main`. */
    $from: {
      main: "ui-shell-sidebar--from-main row-[main-start/body-end]",
      intro: "ui-shell-sidebar--from-intro row-[intro-start/body-end]",
      body: "ui-shell-sidebar--from-body row-[body]",
    },
    /** Keeps the panel below the sticky headers that span its column. */
    $sticky: "ui-shell-sidebar--sticky",
  },
  defaultVariants: {
    $side: "start",
    $width: "md",
    $show: "3xl",
    $from: "main",
    $sticky: true,
  },
});

/** A sidebar panel that keeps its full width while its column folds. */
export const shellSidebarPanel = cv({
  extend: [seam],
  class: "ui-shell-sidebar-panel flex-col",
  defaultVariants: { $p: "none" },
});

/** A fixed header above the scrollable sidebar body. */
export const shellSidebarHeader = cv({
  extend: [seam],
  class: "ui-shell-sidebar-header",
  variants: {
    ...barPaddingVariants,
    /**
     * Sets the space around the content, in whole steps of the spacing token
     * from 0 to 6. It pads the sides, and it makes the header as tall as a
     * default control plus this space above and below it. The facing edge adds
     * to that height. A taller part takes its extra height from the space.
     * Defaults to the space of the shell header, or to 3 without one. At the
     * default 3, the sides match the default padding of the sidebar body. At
     * another space, set the same `$p` on the sidebar body to keep header and
     * body content on one edge.
     */
    $p: {
      0: "ui-shell-sidebar-header--p-0",
      1: "ui-shell-sidebar-header--p-1",
      2: "ui-shell-sidebar-header--p-2",
      3: "ui-shell-sidebar-header--p-3",
      4: "ui-shell-sidebar-header--p-4",
      5: "ui-shell-sidebar-header--p-5",
      6: "ui-shell-sidebar-header--p-6",
    },
  },
  defaultVariants: {
    $px: barInsetDefault,
    // The body scrolls between the header and the footer, not under them, so
    // they show the surface of the sidebar instead of painting it again. A
    // transparent sidebar then stays transparent. Set `$layer` to paint.
    $layer: "transparent",
  },
});

/**
 * The scrollable center of a sidebar panel. A direct vertical `Nav` with
 * `$cover` spans the body's padding, so edge bars cover the facing edge of the
 * sidebar while the body touches it, and a direct `Nav` with `$fill` takes the
 * body's height.
 */
export const shellSidebarBody = cv({
  extend: [frameBase],
  class: "ui-shell-sidebar-body",
  defaultVariants: { $p: 3 },
});

/** A fixed footer below the scrollable sidebar body. */
export const shellSidebarFooter = cv({
  extend: [seam],
  class: "ui-shell-sidebar-footer flex-none",
  // Shows the surface of the sidebar, like the sidebar header.
  defaultVariants: { $p: 3, $layer: "transparent" },
});

/**
 * A content grid with named columns. Children occupy `content`; use `Prose` for
 * text because grid-item margins do not collapse. Unequal gutters keep content
 * centered in the shell; compensation decreases before the content narrows.
 */
const content = cx(
  "ui-shell-content-grid",
  // A cover child must reach the edge, so this uses the track gutter when the
  // part has one. The bracket form sorts after ak-frame-p-0, so an
  // ak-frame-p-0 class doesn't remove this padding.
  // oxlint-disable-next-line tailwindcss/enforce-canonical -- ak-frame-p-(...) sorts before ak-frame-p-0
  "ak-frame-p-[var(--shell-track-gutter,var(--shell-gutter))]",
  // Stays a class to come after the classes of a caller, so that the print rule
  // still applies.
  "print:overflow-visible",
  // Bands and side parts set their own minimum, so a `min-w-*` class on them
  // can hold. The zero-specificity list keeps this rule at one class.
  // Stays a class to keep its order with the classes of the elements that it
  // styles.
  "*:col-[content] *:not-[:where(.ui-shell-main-band,.ui-shell-bar-part)]:min-w-0",
);

const contentVariants = {
  /**
   * Sets the vertical space between children. Numbers scale the spacing token.
   * Defaults to 6.
   */
  $gap(value?: string | number) {
    if (value == null) return;
    return { style: { "--shell-content-gap": getSpacingValue(value) } };
  },
  /**
   * Sets the maximum width of a centered content column. Numbers scale the
   * spacing token. Defaults to `$maxWidth` on the shell, or to 42rem, or 42em
   * when `ShellMain` sets `$size`.
   */
  $maxWidth(value?: ShellWidth) {
    if (value == null) return;
    return { style: { "--shell-main-max-width": getSpacingValue(value) } };
  },
  /**
   * Sets the minimum content gutter. Unless main sets `$py`, it also sets the
   * space above and below the body without an intro, and below the body after
   * an intro that sets `$py`. After an intro, the body starts three bar steps
   * below it, and the intro sets its own space with `$py`. Numbers scale the
   * spacing token and round to a whole pixel. Inherits from main by default.
   * `none` removes the space; `unset` leaves the CSS gutter unchanged.
   */
  $p(value?: "unset" | "none" | (string & {}) | number) {
    if (value == null) return;
    if (value === "unset") return;
    return {
      style: {
        "--shell-gutter": getPaddingValue(value === "none" ? 0 : value),
      },
    };
  },
};

/**
 * The main landmark, sharing the shell columns and rows without containment.
 * It's a style container named `shell-main`, which a shell inside it with
 * `$center="outer"` queries. A container name of your own replaces that name,
 * so keep `shell-main` in the list, such as `[container-name:shell-main_list]`.
 */
export const shellMain = cv({
  class: "ui-shell-main ui-shell-slot-state",
  variants: {
    /**
     * Sets the text size of main and a column of 42em, and `Prose` inside main
     * follows that text. Bars and sidebars keep the shell's size. `auto` leaves
     * the shell's text and the shell's column, and `Prose` stays at 1rem. `lg`
     * uses `$minSize` when the shell is narrower than 40rem. A shell inside a
     * sized main doesn't pass the size on. Defaults to `md`, the size of
     * reading pages, such as docs and articles. Use `auto` for an app screen
     * that keeps the text of the shell.
     */
    $size: {
      auto: "",
      sm: "ui-shell-main--sized-main ui-shell-main--size-sm text-sm",
      md: "ui-shell-main--sized-main ui-shell-main--size-md text-base",
      lg: "ui-shell-main--sized-main ui-shell-main--size-lg text-lg",
    },
    /**
     * Sets the text size of a `$size="lg"` main when the shell is narrower than
     * 40rem. Use `lg` to keep the large text there. Other sizes don't change.
     * Defaults to `md`.
     */
    $minSize: {
      md: "",
      lg: "",
    },
    /**
     * Sets the shared main gutter. Numbers scale the spacing token, so they
     * follow the text of main, and round to a whole pixel. A CSS length can use
     * container queries on the nearest shell. Defaults to 3, measured at the
     * shell's text size. Use `$py` to set the space above and below the parts
     * apart from it.
     */
    $p(value?: "unset" | "none" | (string & {}) | number) {
      return contentVariants.$p(value);
    },
    /**
     * Sets the space above the intro, or above the body without an intro, and
     * below the body. Numbers scale the spacing token; other values must be CSS
     * lengths, not percentages. Defaults to `gutter`: without an intro, the
     * body uses its gutter on both edges. With an intro, the intro uses its own
     * `$py`. When that is `auto`, the body ends with the space above the intro,
     * so the page ends with the space it starts with. Otherwise, the body ends
     * with its gutter. Any value other than `gutter` sets the space below the
     * body, with or without an intro. `none` removes the space.
     */
    $py(value?: "gutter" | "none" | (string & {}) | number) {
      if (value == null) return;
      if (value === "gutter") return;
      // The registered length resolves relative units at main.
      return {
        style: {
          "--shell-main-py-length": getSpacingValue(
            value === "none" ? 0 : value,
          ),
          "--shell-main-py": "var(--shell-main-py-length)",
        },
      };
    },
    /**
     * Sets the shared maximum content width. Numbers scale the spacing token.
     * Parts can override it with `$maxWidth`. Prefer lengths for alignment:
     * percentages resolve against each part, and header or intro widths can
     * include sidebars. Defaults to `$maxWidth` on the shell, or to 42rem, or
     * 42em with `$size`.
     */
    $maxWidth(value?: ShellWidth) {
      return contentVariants.$maxWidth(value);
    },
  },
  defaultVariants: {
    $size: "md",
    $minSize: "md",
    $py: "gutter",
    // Bars inset three steps of the shell's text, so the default gutter stays
    // on their edge when main sets another size. The step is that text over 4.
    $p(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$size === "auto") return 3;
      return "round(calc(var(--shell-header-step)*3),1px)";
    },
  },
  refine({ variants, addClass }) {
    if (variants.$size !== "lg") return;
    if (variants.$minSize !== "md") return;
    // A small shell can't hold 42em at this text either, so main and the bars
    // stay on the same edges.
    addClass("@max-[40rem]/shell:text-base");
  },
});

/**
 * A main header that spans adjacent unoccupied end columns and can stay in
 * view.
 */
export const shellMainHeader = cv({
  extend: [seam],
  class: [content, "ui-shell-main-header"],
  variants: {
    ...contentVariants,
    /**
     * Sets the space above and below the content, in whole steps of the spacing
     * token from 0 to 6. It makes the header as tall as a default control plus
     * this space above and below it. The facing edge adds to that height. A
     * taller part takes its extra height from the space. At the sides, the
     * smallest space at the edge grows or shrinks by the difference from the
     * default 3, and the content keeps the main gutter. The shell reads the
     * height from this value to place sticky parts, so a CSS length goes to
     * `$px`, which sets only the gutter. Defaults to the space of the shell
     * header, or to 3 without one.
     */
    // The shell reads the space and the edge only to place parts below a sticky
    // main header, so only a sticky main header sets them on the shell. A new
    // inherited value on the shell restyles every part inside it.
    $p: {
      0: "ui-shell-main-header--p-0",
      1: "ui-shell-main-header--p-1",
      2: "ui-shell-main-header--p-2",
      3: "ui-shell-main-header--p-3",
      4: "ui-shell-main-header--p-4",
      5: "ui-shell-main-header--p-5",
      6: "ui-shell-main-header--p-6",
    },
    /**
     * Sets the facing edge width in whole pixels from 0 to 5. `true` means 1px;
     * `false` means zero. `inherit` uses the inherited edge color and width.
     * The edge adds to the height that `$p` sets. The shell reads that sum to
     * place sticky parts, so the width is one of these values.
     */
    $border: {
      true: "ui-shell-main-header--border-true",
      false: "ui-shell-main-header--border-false",
      0: "ui-shell-main-header--border-0",
      1: "ui-shell-main-header--border-1",
      2: "ui-shell-main-header--border-2",
      3: "ui-shell-main-header--border-3",
      4: "ui-shell-main-header--border-4",
      5: "ui-shell-main-header--border-5",
      inherit: "ui-shell-main-header--border-inherit ak-edge-inherit",
    },
    /**
     * Sets the minimum content gutter apart from `$p`, which still sets the
     * height. Numbers scale the spacing token and round to a whole pixel.
     * Defaults to the main gutter, with the smallest space at the edge adjusted
     * for the space that `$p` sets. `none` removes the gutter; `unset` keeps
     * the default.
     */
    $px(value?: FramePaddingValue) {
      if (value == null) return;
      if (value === "unset") return;
      const gutter = getPaddingValue(value === "none" ? 0 : value);
      return {
        style: { "--shell-gutter": gutter, "--shell-track-gutter": gutter },
      };
    },
    /**
     * Keeps the main header below the shell's sticky headers. Defaults to true.
     */
    $sticky: "ui-shell-main-header--sticky",
    /**
     * Shows the header at or above a named shell-container width. Prefix the
     * name with `max-` to show it only below that width. `true` keeps it at
     * every width; `false` hides it at every width. A hidden header takes no
     * space and has no sticky offset. Defaults to `true`.
     */
    $show: {
      true: "",
      false: "ui-shell-main-header--show-false hidden",
      "3xs": "ui-shell-main-header--show-3xs @max-3xs/shell:hidden",
      "2xs": "ui-shell-main-header--show-2xs @max-2xs/shell:hidden",
      xs: "ui-shell-main-header--show-xs @max-xs/shell:hidden",
      sm: "ui-shell-main-header--show-sm @max-sm/shell:hidden",
      md: "ui-shell-main-header--show-md @max-md/shell:hidden",
      lg: "ui-shell-main-header--show-lg @max-lg/shell:hidden",
      xl: "ui-shell-main-header--show-xl @max-xl/shell:hidden",
      "2xl": "ui-shell-main-header--show-2xl @max-2xl/shell:hidden",
      "3xl": "ui-shell-main-header--show-3xl @max-3xl/shell:hidden",
      "4xl": "ui-shell-main-header--show-4xl @max-4xl/shell:hidden",
      "5xl": "ui-shell-main-header--show-5xl @max-5xl/shell:hidden",
      "6xl": "ui-shell-main-header--show-6xl @max-6xl/shell:hidden",
      "7xl": "ui-shell-main-header--show-7xl @max-7xl/shell:hidden",
      "max-3xs": "ui-shell-main-header--show-max-3xs @3xs/shell:hidden",
      "max-2xs": "ui-shell-main-header--show-max-2xs @2xs/shell:hidden",
      "max-xs": "ui-shell-main-header--show-max-xs @xs/shell:hidden",
      "max-sm": "ui-shell-main-header--show-max-sm @sm/shell:hidden",
      "max-md": "ui-shell-main-header--show-max-md @md/shell:hidden",
      "max-lg": "ui-shell-main-header--show-max-lg @lg/shell:hidden",
      "max-xl": "ui-shell-main-header--show-max-xl @xl/shell:hidden",
      "max-2xl": "ui-shell-main-header--show-max-2xl @2xl/shell:hidden",
      "max-3xl": "ui-shell-main-header--show-max-3xl @3xl/shell:hidden",
      "max-4xl": "ui-shell-main-header--show-max-4xl @4xl/shell:hidden",
      "max-5xl": "ui-shell-main-header--show-max-5xl @5xl/shell:hidden",
      "max-6xl": "ui-shell-main-header--show-max-6xl @6xl/shell:hidden",
      "max-7xl": "ui-shell-main-header--show-max-7xl @7xl/shell:hidden",
    },
    /** Blurs the page behind the header through a translucent surface. */
    $blur: blur,
  },
  defaultVariants: { $sticky: true, $show: true },
});

/** The introduction inside the main landmark, above its body. */
export const shellMainIntro = cv({
  extend: [frameBase],
  class: [content, "ui-shell-main-intro"],
  variants: {
    ...contentVariants,
    /**
     * Sets the space above and below the intro. Before a body, which always
     * starts three bar steps lower, the intro ends that much earlier, so the
     * space below the intro is the same up to the body's content. A space
     * smaller than three bar steps leaves those three steps. Numbers scale the
     * spacing token; other values must be CSS lengths, not percentages.
     * Defaults to `auto`, the same space on both edges, which grows with the
     * width of the intro: open sidebars beside it reduce the space, and
     * adjacent end sidebars that start at the body don't. With `auto`, the body
     * ends with the same space, `$py` on main replaces the space above the
     * intro and below the body when set, and fragment targets in the intro
     * otherwise clear the largest space. Other values don't reach the body,
     * which then ends with `$py` on main, or with its gutter, so set the same
     * value on `ShellMain`. `gutter` uses the gutter on both edges. `none`
     * removes the space, so `py-*`, `pt-*`, and `pb-*` can set it. The body
     * still adds its three bar steps below `pb-*`. These classes don't reach
     * the body or move fragment targets, so set `pb-*` on the body to match the
     * space above, and use a value when the intro has targets.
     */
    $py(value?: "auto" | "gutter" | "none" | (string & {}) | number) {
      if (value == null) return;
      if (value === "auto") return;
      const space =
        value === "gutter"
          ? "var(--shell-gutter)"
          : getSpacingValue(value === "none" ? 0 : value);
      return {
        // The body after this intro can't read the value, so it keeps its own
        // end instead of the fluid space.
        class: "ui-shell-main-intro--py",
        style: {
          // The registered length resolves relative units at the intro, and it
          // replaces the space above that main sets.
          "--shell-main-py-length": space,
          "--shell-main-py": "var(--shell-main-py-length)",
          "--shell-main-intro-space": "var(--shell-main-py-length)",
        },
      };
    },
  },
  defaultVariants: { $p: "unset", $py: "auto" },
});

/** The main content grid, excluding the end sidebar columns. */
export const shellMainBody = cv({
  extend: [frameBase],
  class: [content, "ui-shell-main-body"],
  variants: {
    ...contentVariants,
    /**
     * Sets what the content column is centered on while the body has free
     * space. `shell` counts the sidebars of the shell when the body is directly
     * inside `ShellMain`. Behind a wrapper in `ShellMain`, such as in a tab
     * panel, the body can't read the sidebars, so it centers the column on the
     * wrapper. `outer` makes that body ask the nearest `ShellMain` for its open
     * sidebars, so the column stays on the center of the shell. Keep the same
     * space between that main and the body at both sides. It has no effect on a
     * body directly inside `ShellMain`. Defaults to `shell`.
     */
    $center: {
      shell: "",
      outer: "ui-shell-main-body--center-outer",
    },
  },
  defaultVariants: { $p: "unset", $center: "shell" },
});

/**
 * A band across named main columns. Children fill its width. Limit nesting to
 * two levels to avoid WebKit hangs. Query containers, auto margins, and inline
 * padding break column alignment. In a bar, or a main header with side parts,
 * the band is a content area in the middle track, which has no named columns,
 * so it can't hold other bands. Its width doesn't depend on its content, so a
 * side part can take room from it. A `min-w-*` class stops it.
 * https://bugs.webkit.org/show_bug.cgi?id=268595
 *
 * A band is a layer, not a frame. Its children sit in grid columns, not inside
 * frame padding, so a frame in a band takes its corners from the frame around
 * the band, such as the main body. A `$cover` frame would cover that frame too,
 * past the columns of the band, so put it in a frame inside the band.
 */
const mainBand = cv({
  extend: [layer],
  class: [
    "ui-shell-main-band",
    // Parts keep their content minimum unless they set `$shrink`.
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:col-span-full *:not-[:where(.ui-shell-bar-part)]:min-w-0",
  ],
  variants: {
    /**
     * Sets the padding above and below the band. Numbers scale the spacing
     * token and round to a whole pixel; strings pass through as raw lengths or
     * expressions. The band has no inline padding, which would move its
     * columns.
     */
    $py(value?: string | number) {
      if (value == null) return;
      return {
        class: "py-(--shell-band-py)",
        style: { "--shell-band-py": getPaddingValue(value) },
      };
    },
  },
  // Open a color context without painting over the parent surface.
  defaultVariants: { $layer: "transparent" },
});

/** The centered content column, including inside a wider main band. */
export const shellContent = cv({
  extend: [mainBand],
  class: "ui-shell-content",
});

/** Extends one step beyond the centered content column. */
export const shellPopout = cv({
  extend: [mainBand],
  class: "ui-shell-popout",
});

/** Extends beyond the popout column while leaving the outer gutters. */
export const shellFeature = cv({
  extend: [mainBand],
  class: "ui-shell-feature",
});

/**
 * Extends beyond the feature column to the widest span centered on the content
 * column. Sidebar compensation stays outside it, so it matches the full band
 * when no sidebar offsets the content.
 */
export const shellWide = cv({
  extend: [mainBand],
  class: "ui-shell-wide",
});

/** Fills the main section width, including its outer gutters. */
export const shellFull = cv({
  extend: [mainBand],
  class: "ui-shell-full",
});
