import { cv, cx } from "clava";
import { getPaddingValue, getSpacingValue } from "../utils/styles.ts";
import { frame, frameBase } from "./frame.ts";

export type ShellWidth = string | number;

/**
 * A page layout with a header, main content, footer, and up to two sidebars per
 * side. Closed or absent sidebars take no space.
 */
export const shell = cv({
  extend: [frame],
  class: [
    // A single-axis clip around sticky chrome causes compositor jitter in
    // WebKit. The main intro and body own the horizontal clip instead.
    // https://bugs.webkit.org/show_bug.cgi?id=320439
    "shell shell-state isolate grid @container/shell rounded-none!",
    "min-h-[100cqb]",
    // A page shell keeps its radius for the frames inside it but paints square
    // corners, and fills the viewport or a size container. Inside another
    // frame, such as a dialog, a shell paints its concentric radius and fills
    // only a frame with a definite height.
    "[.ak-frame_&:not(.shell_*)]:rounded-(--ak-frame-radius)!",
    "[.ak-frame_&:not(.shell_*)]:min-h-[min(100cqb,100%)]",
    // The page tracks hold the box of a shell directly inside a shell with
    // `$maxWidth`. They are zero otherwise.
    "grid-cols-[[page-start]_var(--shell-page-track)_[shell-start_start-1-start]_auto_[start-1-end_start-2-start]_auto_[start-2-end_main-start]_minmax(0,1fr)_[main-end_end-1-start]_auto_[end-1-end_end-2-start]_auto_[end-2-end_shell-end]_var(--shell-page-track)_[page-end]]",
    // Each level copies its width to an alternating channel, so a shell reads
    // the width of the shell around it even when it sets its own. These
    // mutually exclusive selectors support three shell levels.
    "[&:not(.shell_*)]:[--shell-max-width-a:var(--shell-max-width)]",
    "[.shell_&:not(.shell_.shell_*)]:[--shell-max-width-b:var(--shell-max-width)]",
    "[.shell_.shell_&]:[--shell-max-width-a:var(--shell-max-width)]",
    // The tracks resolve against this shell's width. The page space stays
    // unresolved until a bar reads it, so its container units measure this
    // shell, not the shell around it.
    "[--shell-page-space:0px]",
    "[.shell-paged>&:not(.shell_.shell_*)]:[--shell-page-track:max(0px,calc((100%-var(--shell-max-width-a))/2))]",
    "[.shell-paged>&:not(.shell_.shell_*)]:[--shell-page-space:max(0px,calc((100cqi-var(--shell-max-width-a))/2))]",
    "[.shell_.shell-paged>&]:[--shell-page-track:max(0px,calc((100%-var(--shell-max-width-b))/2))]",
    "[.shell_.shell-paged>&]:[--shell-page-space:max(0px,calc((100cqi-var(--shell-max-width-b))/2))]",
    "grid-rows-[[shell-start_header-start]_auto_[header-end_main-start_main-header-start]_auto_[main-header-end_intro-start]_auto_[intro-end_body-start]_minmax(0,1fr)_[body-end_footer-start]_auto_[footer-end_shell-end]]",
    "[--shell-start-1-width:0px] [--shell-start-2-width:0px]",
    "[--shell-end-1-width:0px] [--shell-end-2-width:0px]",
    // Without a main size, Prose is 1rem, so this is 42em of its text.
    "[--shell-header-height:0px] [--shell-main-max-width:42rem]",
    // A shell inside a sized main doesn't pass that size on to its Prose.
    "[.shell-main-sized_&]:[--prose-size:initial]",
    "[--shell-duration:300ms] [--shell-motion:1] motion-reduce:[--shell-motion:0]",
    "[--shell-time:calc(var(--shell-duration)*var(--shell-motion))]",
    "[--shell-ease:cubic-bezier(0.2,0,0,1)]",
    "[--shell-local-header-height:calc(var(--shell-header-step)*16)]",
    "[&:has(>.shell-header)]:[--shell-local-header-height:var(--shell-header-height)]",
    "[--shell-main-header-height:var(--shell-local-header-height)] [--shell-main-head:0px]",
    "[--shell-head:0px]",
    "[&:has(>.shell-header-sticky)]:[--shell-head:var(--shell-header-height)]",
    "[&:has(>.shell-footer-sticky)]:[--shell-foot:var(--shell-footer-height)]",
    // Alternating registered lengths avoid same-element custom-property
    // cycles. These mutually exclusive selectors support three shell levels;
    // each further level needs another rule with the opposite channel.
    "[&:not(.shell_*)]:[--shell-top:0px]",
    "[&:not(.shell_*)]:[--shell-below-a:calc(var(--shell-top)+var(--shell-head))]",
    "[.shell_&:not(.shell_.shell_*)]:[--shell-top:var(--shell-below-a)]",
    "[.shell_&:not(.shell_.shell_*)]:[--shell-below-b:calc(var(--shell-top)+var(--shell-head))]",
    "[.shell_.shell_&]:[--shell-top:var(--shell-below-b)]",
    "[.shell_.shell_&]:[--shell-below-a:calc(var(--shell-top)+var(--shell-head))]",
    "[.shell>&]:col-[main] [.shell>&]:row-[body] [.shell>&]:min-h-0",
    "[.shell>&]:[--shell-duration:inherit] [.shell>&]:[--shell-motion:inherit]",
    "[.shell>&]:[--shell-ease:inherit] [.shell>&]:[--shell-main-max-width:inherit]",
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
      auto: [
        "text-sm [--shell-header-step:calc(0.875rem/4)]",
        "[--shell-radius:calc(var(--radius)*5/0.875)]",
        "[--shell-leading:var(--text-sm--line-height)]",
        // A leading utility would set --tw-leading and replace
        // text-* fallbacks.
        "[.shell_&]:[font-size:inherit] [.shell_&]:[line-height:inherit]",
        "[.shell_&]:[--shell-header-step:inherit]",
        "[.shell_&]:[--shell-radius:inherit]",
        "[.shell_&]:[--shell-leading:inherit]",
        // The outer shell's size, not the size of a main around this shell. The
        // extra class outranks the inherited size above.
        "[.shell_.shell-main-sized_&]:text-[calc(var(--shell-header-step)*4)]",
        "[.shell_.shell-main-sized_&]:[line-height:var(--shell-leading)]",
      ],
      sm: [
        "text-sm [--shell-header-step:calc(0.875rem/4)]",
        "[--shell-radius:calc(var(--radius)*5/0.875)]",
        "[--shell-leading:var(--text-sm--line-height)]",
      ],
      md: [
        "text-base [--shell-header-step:calc(1rem/4)]",
        "[--shell-radius:calc(var(--radius)*5)]",
        "[--shell-leading:var(--text-base--line-height)]",
      ],
      lg: [
        "text-lg [--shell-header-step:calc(1.125rem/4)]",
        "[--shell-radius:calc(var(--radius)*5/1.125)]",
        "[--shell-leading:var(--text-lg--line-height)]",
      ],
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
     * do, inside the box. With the default padding and height, that is on the
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
        class: "shell-paged",
        style: { "--shell-max-width": width, "--shell-main-max-width": width },
      };
    },
  },
  defaultVariants: {
    $size: "auto",
    $layer: "transparent",
    $rounded: "var(--shell-radius)",
    $p: "none",
  },
});

const facingBorder = cx(
  "[.shell-header,.shell-main-header,.shell-sidebar-header]:border-be-(length:--border-width)",
  "[.shell-footer,.shell-sidebar-footer]:border-bs-(length:--border-width)",
  // The column follows the shell direction; the body can have its own dir.
  "[.shell-sidebar-start:dir(ltr)>&]:border-r-(length:--border-width)",
  "[.shell-sidebar-start:dir(rtl)>&]:border-l-(length:--border-width)",
  "[.shell-sidebar-end:dir(ltr)>&]:border-l-(length:--border-width)",
  "[.shell-sidebar-end:dir(rtl)>&]:border-r-(length:--border-width)",
);

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
    /** Draws one facing edge as a solid border, a dashed border, or no edge. */
    $borderType(value?: "border" | "dashed" | "none") {
      if (value === "border") {
        return [facingBorder, "[--shell-facing-border:var(--border-width)]"];
      }
      if (value === "dashed") {
        return cx(
          facingBorder,
          "border-dashed [--shell-facing-border:var(--border-width)]",
        );
      }
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
        case "none":
          return defaultValue;
        default:
          return "border";
      }
    },
  },
});

/**
 * Default bar padding. At the default `md` height, three spacing steps match
 * the space above and below a default control and the default main gutter. Each
 * height step shrinks or grows that space by half a step on each side, so the
 * side insets follow it. The three steps and the height adjustment round to
 * whole pixels separately, like the main gutter and the main header, so they
 * all keep one edge.
 */
const barInsetDefault = "var(--shell-bar-inset)";

/**
 * Three columns keep the center aligned until a side needs more room. Content
 * minimums come from `1fr`; physical safe-area insets set the minimum side
 * padding. With a content area, the columns aim the middle one at main's column
 * instead. Every bar reads the sidebars, because a selector can't let only the
 * bars with an area through the shell's reset without restyling what they hold
 * on each toggle.
 */
const bar = cx(
  "shell-bar shell-slot-state shell-bar-spaces",
  "[&:has(>.shell-band)]:shell-bar-fold [&:has(>.shell-band)]:shell-bar-tracks",
  "[&>.shell-band:has(>.nav.horizontal)]:self-stretch",
  // A horizontal navigation region fills the bar's height, so edge bars in
  // its centered rows meet the bar's edge.
  "[&>.shell-bar-start:has(>.nav.horizontal)]:self-stretch",
  "[&>.shell-bar-center:has(>.nav.horizontal)]:self-stretch",
  "[&>.shell-bar-end:has(>.nav.horizontal)]:self-stretch",
  "[&>*>.nav.horizontal]:self-stretch [&>*>.nav.horizontal]:items-center",
  "[&>*>.nav.horizontal]:my-0 [&>*>.nav.horizontal]:py-0",
  // Without block padding, edge bars measure from the region's height alone.
  "[&>*>.nav.horizontal]:[--nav-bar-gap:0px]",
  // The region scrolls, so rounded corners would clip a bar at its edge.
  "[&>*>.nav.horizontal]:rounded-none",
  // The same goes for a part in a content area, which stretches with its area.
  "[&>.shell-band:has(>.shell-bar-part>.nav.horizontal)]:self-stretch [&>.shell-band>.shell-bar-part:has(>.nav.horizontal)]:self-stretch",
  "[&>.shell-band>.shell-bar-part>.nav.horizontal]:self-stretch [&>.shell-band>.shell-bar-part>.nav.horizontal]:items-center",
  "[&>.shell-band>.shell-bar-part>.nav.horizontal]:my-0 [&>.shell-band>.shell-bar-part>.nav.horizontal]:py-0",
  "[&>.shell-band>.shell-bar-part>.nav.horizontal]:[--nav-bar-gap:0px] [&>.shell-band>.shell-bar-part>.nav.horizontal]:rounded-none",
  "col-[page] grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-0!",
  // Next to a shell inside a shell with `$maxWidth`, a content area starts the
  // bar's padding inside that shell's box, like parts at the bar's edges and in
  // that shell's own bars. With the default padding, that is on the rows of its
  // sidebars at the default bar height. It skips compensation, so an outer
  // sidebar doesn't move it off the box. The
  // bar looks for that shell among its siblings: a `:has()` on the outer shell
  // would restyle the whole page on each sidebar toggle in Chrome.
  "[.shell-paged>&:has(~.shell)]:[--shell-main-max-width:calc(var(--shell-max-width)-2*var(--ak-frame-padding))]",
  "[.shell-paged>.shell~&]:[--shell-main-max-width:calc(var(--shell-max-width)-2*var(--ak-frame-padding))]",
  "[.shell-paged>&:has(~.shell)]:[--shell-comp-start:0px] [.shell-paged>&:has(~.shell)]:[--shell-comp-end:0px]",
  "[.shell-paged>.shell~&]:[--shell-comp-start:0px] [.shell-paged>.shell~&]:[--shell-comp-end:0px]",
  // In that inner shell, the bar spans the shell and its parts start at the
  // box. The safe area stays the smallest space from the screen edge.
  "pl-[max(calc(var(--ak-frame-padding)+var(--shell-page-space)),env(safe-area-inset-left))]",
  "pr-[max(calc(var(--ak-frame-padding)+var(--shell-page-space)),env(safe-area-inset-right))]",
  // A growing center receives twice the free space and stays centered while
  // each side fits within one quarter.
  "[&:has(>.shell-bar-center.shell-bar-grow)]:grid-cols-[1fr_minmax(auto,2fr)_1fr]",
);

/**
 * The 80% surface keeps text contrast above 7:1. Use an opaque fallback when
 * backdrop filters are unsupported or transparency is reduced. Backdrop filters
 * create stacking and fixed-position contexts; nested filters do not compose.
 */
const blur = cx(
  "backdrop-blur-md bg-[color-mix(in_oklab,var(--ak-layer)_80%,transparent)]",
  "supports-[not(backdrop-filter:blur(1px))]:bg-(--ak-layer)",
  "[@media(prefers-reduced-transparency:reduce)]:bg-(--ak-layer)",
);

/** The settings of main that a content area in a bar needs to match. */
const barAreaVariants = {
  /**
   * Sets the main gutter that a content area in this bar uses to find main's
   * column. Set it to the same value as `$p` on `ShellMain`. `$p` stays the
   * smallest space at the bar's edge. Numbers scale the spacing token and round
   * to a whole pixel, and they follow the element's text. So when `ShellMain`
   * sets `$size`, set a CSS length on both. Defaults to the default main
   * gutter.
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
  class: [
    bar,
    "shell-header row-[header] box-border min-h-(--shell-header-height) @container/shell-header",
    // Let edge bars in a centered navigation row reach the inner edge.
    "[&>*>.nav.horizontal]:[--nav-block-size:calc(var(--shell-header-height)-var(--shell-facing-border,0px))]",
    "[&>.shell-band>.shell-bar-part>.nav.horizontal]:[--nav-block-size:calc(var(--shell-header-height)-var(--shell-facing-border,0px))]",
    "z-6",
    "[--shell-bar-inset:max(0px,calc(round(--spacing(3),1px)+round((var(--shell-header-height)-var(--shell-header-step)*16)/2,1px)))]",
  ],
  variants: {
    ...barAreaVariants,
    /**
     * Keeps the header in view within its row and reserves its space. Sticky
     * sidebars and anchors use its height as an offset. Defaults to `true`.
     */
    $sticky: "shell-header-sticky sticky inset-bs-(--shell-top)",
    /** Sets the outer height, including the border. Defaults to `md`. */
    $height: {
      sm: "[.shell:has(>&)]:[--shell-header-height:calc(var(--shell-header-step)*14)] [--shell-header-height:calc(var(--shell-header-step)*14)]",
      md: "[.shell:has(>&)]:[--shell-header-height:calc(var(--shell-header-step)*16)] [--shell-header-height:calc(var(--shell-header-step)*16)]",
      lg: "[.shell:has(>&)]:[--shell-header-height:calc(var(--shell-header-step)*18)] [--shell-header-height:calc(var(--shell-header-step)*18)]",
    },
    /**
     * Blurs the page behind a translucent surface. Uses an opaque surface when
     * backdrop filters are unsupported or transparency is reduced.
     */
    $blur: blur,
    /**
     * Moves the center section to a full-width second row below 40rem. Supply a
     * matching `$height` class for the taller layout. A center section in a
     * content area keeps its row even when CSS hides it, so render it only
     * where it shows.
     */
    $stackCenter: [
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:col-span-full",
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:row-start-2",
      // In a content area, the extra class outranks the row of its parts. The
      // area spans both rows of the header, so parts outside it stay on the
      // first row with its start and end parts.
      "@max-[40rem]/shell-header:[&>.shell-band>.shell-bar-center.shell-bar-part]:col-span-full",
      "@max-[40rem]/shell-header:[&>.shell-band>.shell-bar-center.shell-bar-part]:row-start-2",
      "@max-[40rem]/shell-header:[&>.shell-band:has(>.shell-bar-center)]:row-end-[span_2]",
      "@max-[40rem]/shell-header:[&>.shell-band:has(>.shell-bar-center)]:grid-rows-subgrid",
    ],
  },
  defaultVariants: {
    $sticky: true,
    $height: "md",
    $p: barInsetDefault,
  },
});

/**
 * A header or footer section that preserves its content width by default. Next
 * to a content area, tracks have no gaps, so an empty side track doesn't move
 * the area off the column. Each part keeps the space itself.
 */
export const shellBarPart = cv({
  class:
    "shell-bar-part flex items-center gap-2 [.shell-main-header>&]:row-start-1 [.shell-bar>.shell-band>&]:row-start-1",
  variants: {
    /**
     * Lets the section shrink below its content width. Use `truncate` on text
     * and `min-w-0` or an explicit width on controls. WebKit clips focus rings
     * at the section edge. Use an overflow menu for controls that must remain
     * reachable.
     */
    $shrink: {
      true: "max-w-full box-border min-w-0 overflow-clip [overflow-clip-margin:0.25rem]",
      // A side track can be narrower than its part, and the part must not wrap
      // to fit. It takes room from the area instead. With a center part, a main
      // header has the tracks of a plain bar, so text can wrap like in a bar.
      false:
        "min-w-auto [&:has(~.shell-band)]:min-w-max [.shell-band~&]:min-w-max [.shell-main-header:not(:has(>.shell-bar-center))>&]:min-w-max",
    },
    /** Fills the section's track instead of using its resting alignment. */
    $grow: {
      true: "justify-self-stretch",
    },
  },
});

/** The start section of a shell header, footer, or main header. */
export const shellStart = cv({
  extend: [shellBarPart],
  class:
    "shell-bar-start col-1 [&:has(~.shell-band)]:me-2 [.shell-main-header>&]:me-2 [.shell-main-header:has(>.shell-bar-part)>&]:col-1 [.shell-bar>.shell-band>&]:col-1",
  variants: {
    // The track also holds the part's margin, so the cap leaves room for it.
    $shrink: {
      true: "[&:has(~.shell-band)]:max-w-[calc(100%-(--spacing(2)))] [.shell-main-header>&]:max-w-[calc(100%-(--spacing(2)))]",
    },
    /** Fills the part's track instead of resting at the bar's start edge. */
    $grow: { false: "justify-self-start" },
  },
});

/** The center section of a shell header, footer, or main header. */
export const shellCenter = cv({
  extend: [shellBarPart],
  class: "shell-bar-center col-2 [.shell-bar>.shell-band>&]:col-2",
  variants: {
    /**
     * Gives the center twice the free width. It stays centered while both sides
     * fit within one quarter. Set `$shrink` on both sides for exact centering.
     * Avoid `$shrink` on this section: it fixes the columns at a 1:2:1 ratio.
     */
    $grow: { true: "shell-bar-grow", false: "justify-self-center" },
  },
});

/** The end section of a shell header, footer, or main header. */
export const shellEnd = cv({
  extend: [shellBarPart],
  class:
    "shell-bar-end col-3 [.shell-band~&]:ms-2 [.shell-main-header>&]:ms-2 [.shell-main-header:has(>.shell-bar-part)>&]:col-3 [.shell-bar>.shell-band>&]:col-3",
  variants: {
    // The track also holds the part's margin, so the cap leaves room for it.
    $shrink: {
      true: "[.shell-band~&]:max-w-[calc(100%-(--spacing(2)))] [.shell-main-header>&]:max-w-[calc(100%-(--spacing(2)))]",
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
    // The footer ends the sidebar columns, pushing sticky sidebar bodies up
    // without a fixed footer height.
    "shell-footer row-[footer] box-border min-h-(--shell-footer-height) @container/shell-footer",
    // Let edge bars in a centered navigation row reach the inner edge.
    // The bottom safe area pads the footer, so it doesn't hold the row.
    "[&>*>.nav.horizontal]:[--nav-block-size:calc(var(--shell-footer-height)-var(--shell-facing-border,0px)-env(safe-area-inset-bottom))]",
    "[&>.shell-band>.shell-bar-part>.nav.horizontal]:[--nav-block-size:calc(var(--shell-footer-height)-var(--shell-facing-border,0px)-env(safe-area-inset-bottom))]",
    "z-5",
    "pbs-0! pbe-[env(safe-area-inset-bottom)]!",
    "[--shell-bar-inset:max(0px,calc(round(--spacing(3),1px)+round((var(--shell-footer-height)-var(--shell-header-step)*16)/2,1px)))]",
  ],
  variants: {
    ...barAreaVariants,
    /**
     * Keeps the footer in view at the bottom of the scroll area. Sticky
     * sidebars stop above it, and main content scrolls focused elements above
     * it. Defaults to `false`.
     */
    $sticky: "shell-footer-sticky sticky inset-be-0",
    /** Sets the outer height, including the border. Defaults to `md`. */
    $height: {
      sm: "[.shell:has(>&)]:[--shell-footer-height:calc(var(--shell-header-step)*14)] [--shell-footer-height:calc(var(--shell-header-step)*14)]",
      md: "[.shell:has(>&)]:[--shell-footer-height:calc(var(--shell-header-step)*16)] [--shell-footer-height:calc(var(--shell-header-step)*16)]",
      lg: "[.shell:has(>&)]:[--shell-footer-height:calc(var(--shell-header-step)*18)] [--shell-footer-height:calc(var(--shell-header-step)*18)]",
    },
    /**
     * Blurs the page behind a translucent surface. Uses an opaque surface when
     * backdrop filters are unsupported or transparency is reduced.
     */
    $blur: blur,
  },
  defaultVariants: {
    $p: barInsetDefault,
    $height: "md",
  },
});

/**
 * A sidebar column that folds to zero width while its panel keeps its full
 * width. Reopening animates without an entrance animation on first render.
 * Mirror the panel's `data-open` on the column so it renders in place while the
 * panel is still streaming in.
 */
export const shellSidebar = cv({
  class: [
    "shell-slot-state",
    "[--shell-sidebar-head:0px]",
    // Keep the panel's offset while its own column closes or collapses.
    "[&.shell-sidebar-end]:[--shell-sidebar-head:calc(var(--shell-main-head)*(1-var(--shell-end-1-from-main)))]",
    "[.shell-sidebar-end~&.shell-sidebar-end]:[--shell-sidebar-head:calc(var(--shell-main-head)*var(--shell-header-free-1)*(1-var(--shell-end-2-from-main)))]",
    "shell-sidebar flex flex-col box-border rounded-none!",
    "z-2 w-(--shell-slot-width) overflow-clip",
    // The main header spans a closing column at once, so a column that starts
    // at main folds above it. An open column stays below the header's popovers.
    "[&.shell-sidebar-end]:z-[calc(2+2*var(--shell-end-1-from-main)*var(--shell-header-free-1))]",
    "[.shell-sidebar-end~&.shell-sidebar-end]:z-[calc(2+2*var(--shell-end-2-from-main)*var(--shell-header-free-2))]",
    // Fold beside a closed panel. While HTML streams in, the parser can pause
    // before the panel, so the column's own data-open stands in until then.
    // https://github.com/ariakit/ariakit/issues/8147
    "[&:has(>.shell-sidebar-panel:not([data-open]))]:w-0",
    "[&:not([data-open]):not(:has(>.shell-sidebar-panel))]:w-0",
    "[&>.shell-sidebar-panel:not([data-open])]:hidden",
    "transition-[width] duration-(--shell-time) ease-(--shell-ease)",
  ],
  variants: {
    /**
     * Chooses the side. Up to two columns per side follow their DOM order: the
     * first start column is outermost and the first end column is innermost.
     */
    $side: {
      start:
        "shell-sidebar-start col-[start-1] [.shell-sidebar-start~&]:col-[start-2]",
      end: "shell-sidebar-end col-[end-1] [.shell-sidebar-end~&]:col-[end-2]",
    },
    /**
     * Sets this sidebar's width and publishes it to the shell. `3xs` fits a
     * rail of square icon buttons in a vertical button group at any shell size.
     * Defaults to `md`.
     */
    $width: {
      // A default button is one line tall. The body, group, and button padding
      // each round to a whole pixel per side, and the facing edge adds 1px.
      "3xs": [
        "[--shell-slot-width:calc(1lh+2*(round(--spacing(3),1px)+round(--spacing(1),1px)+round(--spacing(2),1px))+1px)]",
        "[.shell:has(>&.shell-sidebar-start:not(.shell-sidebar-start~*))]:[--shell-start-1-width:calc(1lh+2*(round(--spacing(3),1px)+round(--spacing(1),1px)+round(--spacing(2),1px))+1px)]",
        "[.shell:has(>.shell-sidebar-start~&.shell-sidebar-start)]:[--shell-start-2-width:calc(1lh+2*(round(--spacing(3),1px)+round(--spacing(1),1px)+round(--spacing(2),1px))+1px)]",
        "[.shell:has(>&.shell-sidebar-end:not(.shell-sidebar-end~*))]:[--shell-end-1-width:calc(1lh+2*(round(--spacing(3),1px)+round(--spacing(1),1px)+round(--spacing(2),1px))+1px)]",
        "[.shell:has(>.shell-sidebar-end~&.shell-sidebar-end)]:[--shell-end-2-width:calc(1lh+2*(round(--spacing(3),1px)+round(--spacing(1),1px)+round(--spacing(2),1px))+1px)]",
      ],
      xs: [
        "[--shell-slot-width:10rem]",
        "[.shell:has(>&.shell-sidebar-start:not(.shell-sidebar-start~*))]:[--shell-start-1-width:10rem]",
        "[.shell:has(>.shell-sidebar-start~&.shell-sidebar-start)]:[--shell-start-2-width:10rem]",
        "[.shell:has(>&.shell-sidebar-end:not(.shell-sidebar-end~*))]:[--shell-end-1-width:10rem]",
        "[.shell:has(>.shell-sidebar-end~&.shell-sidebar-end)]:[--shell-end-2-width:10rem]",
      ],
      sm: [
        "[--shell-slot-width:12rem]",
        "[.shell:has(>&.shell-sidebar-start:not(.shell-sidebar-start~*))]:[--shell-start-1-width:12rem]",
        "[.shell:has(>.shell-sidebar-start~&.shell-sidebar-start)]:[--shell-start-2-width:12rem]",
        "[.shell:has(>&.shell-sidebar-end:not(.shell-sidebar-end~*))]:[--shell-end-1-width:12rem]",
        "[.shell:has(>.shell-sidebar-end~&.shell-sidebar-end)]:[--shell-end-2-width:12rem]",
      ],
      md: [
        "[--shell-slot-width:16rem]",
        "[.shell:has(>&.shell-sidebar-start:not(.shell-sidebar-start~*))]:[--shell-start-1-width:16rem]",
        "[.shell:has(>.shell-sidebar-start~&.shell-sidebar-start)]:[--shell-start-2-width:16rem]",
        "[.shell:has(>&.shell-sidebar-end:not(.shell-sidebar-end~*))]:[--shell-end-1-width:16rem]",
        "[.shell:has(>.shell-sidebar-end~&.shell-sidebar-end)]:[--shell-end-2-width:16rem]",
      ],
      lg: [
        "[--shell-slot-width:20rem]",
        "[.shell:has(>&.shell-sidebar-start:not(.shell-sidebar-start~*))]:[--shell-start-1-width:20rem]",
        "[.shell:has(>.shell-sidebar-start~&.shell-sidebar-start)]:[--shell-start-2-width:20rem]",
        "[.shell:has(>&.shell-sidebar-end:not(.shell-sidebar-end~*))]:[--shell-end-1-width:20rem]",
        "[.shell:has(>.shell-sidebar-end~&.shell-sidebar-end)]:[--shell-end-2-width:20rem]",
      ],
      xl: [
        "[--shell-slot-width:24rem]",
        "[.shell:has(>&.shell-sidebar-start:not(.shell-sidebar-start~*))]:[--shell-start-1-width:24rem]",
        "[.shell:has(>.shell-sidebar-start~&.shell-sidebar-start)]:[--shell-start-2-width:24rem]",
        "[.shell:has(>&.shell-sidebar-end:not(.shell-sidebar-end~*))]:[--shell-end-1-width:24rem]",
        "[.shell:has(>.shell-sidebar-end~&.shell-sidebar-end)]:[--shell-end-2-width:24rem]",
      ],
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
      false:
        "shell-sidebar-hidden [&.shell-sidebar]:w-0 [&>.shell-sidebar-panel]:hidden",
      "3xs":
        "shell-sidebar-show-3xs @max-3xs/shell:[&.shell-sidebar]:w-0 @max-3xs/shell:[&>.shell-sidebar-panel]:hidden",
      "2xs":
        "shell-sidebar-show-2xs @max-2xs/shell:[&.shell-sidebar]:w-0 @max-2xs/shell:[&>.shell-sidebar-panel]:hidden",
      xs: "shell-sidebar-show-xs @max-xs/shell:[&.shell-sidebar]:w-0 @max-xs/shell:[&>.shell-sidebar-panel]:hidden",
      sm: "shell-sidebar-show-sm @max-sm/shell:[&.shell-sidebar]:w-0 @max-sm/shell:[&>.shell-sidebar-panel]:hidden",
      md: "shell-sidebar-show-md @max-md/shell:[&.shell-sidebar]:w-0 @max-md/shell:[&>.shell-sidebar-panel]:hidden",
      lg: "shell-sidebar-show-lg @max-lg/shell:[&.shell-sidebar]:w-0 @max-lg/shell:[&>.shell-sidebar-panel]:hidden",
      xl: "shell-sidebar-show-xl @max-xl/shell:[&.shell-sidebar]:w-0 @max-xl/shell:[&>.shell-sidebar-panel]:hidden",
      "2xl":
        "shell-sidebar-show-2xl @max-2xl/shell:[&.shell-sidebar]:w-0 @max-2xl/shell:[&>.shell-sidebar-panel]:hidden",
      "3xl":
        "shell-sidebar-show-3xl @max-3xl/shell:[&.shell-sidebar]:w-0 @max-3xl/shell:[&>.shell-sidebar-panel]:hidden",
      "4xl":
        "shell-sidebar-show-4xl @max-4xl/shell:[&.shell-sidebar]:w-0 @max-4xl/shell:[&>.shell-sidebar-panel]:hidden",
      "5xl":
        "shell-sidebar-show-5xl @max-5xl/shell:[&.shell-sidebar]:w-0 @max-5xl/shell:[&>.shell-sidebar-panel]:hidden",
      "6xl":
        "shell-sidebar-show-6xl @max-6xl/shell:[&.shell-sidebar]:w-0 @max-6xl/shell:[&>.shell-sidebar-panel]:hidden",
      "7xl":
        "shell-sidebar-show-7xl @max-7xl/shell:[&.shell-sidebar]:w-0 @max-7xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-3xs":
        "shell-sidebar-show-max-3xs @3xs/shell:[&.shell-sidebar]:w-0 @3xs/shell:[&>.shell-sidebar-panel]:hidden",
      "max-2xs":
        "shell-sidebar-show-max-2xs @2xs/shell:[&.shell-sidebar]:w-0 @2xs/shell:[&>.shell-sidebar-panel]:hidden",
      "max-xs":
        "shell-sidebar-show-max-xs @xs/shell:[&.shell-sidebar]:w-0 @xs/shell:[&>.shell-sidebar-panel]:hidden",
      "max-sm":
        "shell-sidebar-show-max-sm @sm/shell:[&.shell-sidebar]:w-0 @sm/shell:[&>.shell-sidebar-panel]:hidden",
      "max-md":
        "shell-sidebar-show-max-md @md/shell:[&.shell-sidebar]:w-0 @md/shell:[&>.shell-sidebar-panel]:hidden",
      "max-lg":
        "shell-sidebar-show-max-lg @lg/shell:[&.shell-sidebar]:w-0 @lg/shell:[&>.shell-sidebar-panel]:hidden",
      "max-xl":
        "shell-sidebar-show-max-xl @xl/shell:[&.shell-sidebar]:w-0 @xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-2xl":
        "shell-sidebar-show-max-2xl @2xl/shell:[&.shell-sidebar]:w-0 @2xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-3xl":
        "shell-sidebar-show-max-3xl @3xl/shell:[&.shell-sidebar]:w-0 @3xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-4xl":
        "shell-sidebar-show-max-4xl @4xl/shell:[&.shell-sidebar]:w-0 @4xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-5xl":
        "shell-sidebar-show-max-5xl @5xl/shell:[&.shell-sidebar]:w-0 @5xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-6xl":
        "shell-sidebar-show-max-6xl @6xl/shell:[&.shell-sidebar]:w-0 @6xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-7xl":
        "shell-sidebar-show-max-7xl @7xl/shell:[&.shell-sidebar]:w-0 @7xl/shell:[&>.shell-sidebar-panel]:hidden",
    },
    /** Selects the first row the sidebar spans. Defaults to `main`. */
    $from: {
      main: "shell-sidebar-from-main row-[main-start/body-end]",
      intro: "shell-sidebar-from-intro row-[intro-start/body-end]",
      body: "shell-sidebar-from-body row-[body]",
    },
    /** Keeps the panel below the sticky headers that span its column. */
    $sticky: [
      "[&>.shell-sidebar-panel]:sticky",
      "[&>.shell-sidebar-panel]:inset-bs-[calc(var(--shell-top)+var(--shell-head)+var(--shell-sidebar-head))]",
      // Without a size container, cqb falls back to the small viewport, which
      // stops short of the bottom once mobile browser bars collapse. The
      // dynamic viewport follows the bars; a size container keeps cqb.
      "[&>.shell-sidebar-panel]:max-h-[calc(100dvh-var(--shell-top)-var(--shell-head)-var(--shell-sidebar-head)-var(--shell-foot))]",
      "[@container_(min-height:0px)]:[&>.shell-sidebar-panel]:max-h-[calc(100cqb-var(--shell-top)-var(--shell-head)-var(--shell-sidebar-head)-var(--shell-foot))]",
    ],
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
  class: [
    "shell-sidebar-panel box-border w-(--shell-slot-width) min-h-0 flex-auto flex flex-col",
    // The panel keeps its width while the column folds, so its queries hold
    // their results. WebKit restyles everything inside query containers that
    // change size, and lays out the page again, on each step of the fold.
    "@container/shell-sidebar",
    // Supporting browsers defer removal until the fold ends. Others hide at once.
    "transition-[display] transition-discrete duration-(--shell-time)",
    // End alignment keeps an overflowing panel against its facing edge while
    // the column folds.
    "[.shell-sidebar-start>&]:self-end",
    "[.shell-sidebar-end>&]:self-start",
  ],
  defaultVariants: { $p: "none" },
});

/** A fixed header above the scrollable sidebar body. */
export const shellSidebarHeader = cv({
  extend: [seam],
  class: [
    "shell-sidebar-header flex flex-none items-center box-border min-h-(--shell-local-header-height) py-0!",
  ],
  variants: {
    /**
     * Sets the outer height, including the border. Defaults to the shell
     * header.
     */
    $height: {
      sm: "[--shell-local-header-height:calc(var(--shell-header-step)*14)]",
      md: "[--shell-local-header-height:calc(var(--shell-header-step)*16)]",
      lg: "[--shell-local-header-height:calc(var(--shell-header-step)*18)]",
    },
  },
  // Unlike other bars, the padding keeps the sidebar body's default, so header
  // and body content share one edge at any height.
  defaultVariants: { $p: 3 },
});

/**
 * The scrollable center of a sidebar panel. A `Nav` with `$cover` spans the
 * body's padding, so edge bars meet the sidebar edge, and a direct `Nav` with
 * `$fill` takes the body's height.
 */
export const shellSidebarBody = cv({
  extend: [frameBase],
  class: [
    "shell-sidebar-body min-h-0 flex-auto overflow-y-auto rounded-none!",
    // A flex column fits a filling navigation to the body's height.
    "[&:has(>.nav-fill)]:flex [&:has(>.nav-fill)]:flex-col",
  ],
  defaultVariants: { $p: 3 },
});

/** A fixed footer below the scrollable sidebar body. */
export const shellSidebarFooter = cv({
  extend: [seam],
  class: "shell-sidebar-footer flex-none",
  defaultVariants: { $p: 3 },
});

/**
 * Sidebars use registered lengths so content centering follows their animation.
 * Clamp each length to zero before summing: easing can overshoot after the
 * column reaches zero width. Each content grid animates its own lengths, and
 * the values derived from them do not inherit, so each animation frame restyles
 * the grids but not the content inside them. A `transition` utility on a main
 * header, intro, or body replaces this transition, so keep the slot spaces in
 * its transition properties.
 */
const slotSpaces = cx(
  "[--shell-start-1-space:calc(var(--shell-start-1-width)*var(--shell-start-1-open)*var(--shell-start-1-fit))]",
  "[--shell-start-2-space:calc(var(--shell-start-2-width)*var(--shell-start-2-open)*var(--shell-start-2-fit))]",
  "[--shell-end-1-space:calc(var(--shell-end-1-width)*var(--shell-end-1-open)*var(--shell-end-1-fit))]",
  "[--shell-end-2-space:calc(var(--shell-end-2-width)*var(--shell-end-2-open)*var(--shell-end-2-fit))]",
  "transition-[--shell-start-1-space,--shell-start-2-space,--shell-end-1-space,--shell-end-2-space]",
  "duration-(--shell-time) ease-(--shell-ease)",
  "[--shell-start-total:calc(max(0px,var(--shell-start-1-space))+max(0px,var(--shell-start-2-space)))]",
  "[--shell-end-total:calc(max(0px,var(--shell-end-1-space))+max(0px,var(--shell-end-2-space)))]",
);

const compensation = cx(
  "[--shell-comp-end:max(0px,calc(var(--shell-start-total)-var(--shell-end-total)))]",
  "[--shell-comp-start:max(0px,calc(var(--shell-end-total)-var(--shell-start-total)))]",
);

// Limit sidebar compensation to free space, but keep the minimum gutter. The
// offsets sit outside the wide lines, so the wide span stays centered on the
// content. `auto` tracks grow by equal amounts, preserving that center; `1fr`
// loses it. Only a main header sets a track gutter: its tracks keep their bar
// inset as a minimum, while the offsets use the same gutter as the body.
const centered = cx(
  "[--shell-free:calc(100%-var(--shell-content-end-space)-var(--shell-main-max-width)-var(--shell-gutter)-2*var(--shell-popout)-2*var(--shell-feature))]",
  "[--shell-offset-start:clamp(0px,calc(var(--shell-free)-var(--shell-gutter)),var(--shell-comp-start))]",
  "[--shell-offset-end:calc(var(--shell-content-end-space)+clamp(0px,calc(var(--shell-free)-var(--shell-gutter)),var(--shell-comp-end)))]",
  "grid-cols-[[full-start]_var(--shell-offset-start)_[wide-start]_minmax(var(--shell-track-gutter,var(--shell-gutter)),auto)_[feature-start]_minmax(0,var(--shell-feature))_[popout-start]_minmax(0,var(--shell-popout))_[content-start]_minmax(min(var(--shell-main-max-width),max(0px,calc(100%-var(--shell-content-end-space)-2*var(--shell-track-gutter,var(--shell-gutter))))),var(--shell-main-max-width))_[content-end]_minmax(0,var(--shell-popout))_[popout-end]_minmax(0,var(--shell-feature))_[feature-end]_minmax(var(--shell-track-gutter,var(--shell-gutter)),auto)_[wide-end]_var(--shell-offset-end)_[full-end]]",
);

/**
 * A content grid with named columns. Children occupy `content`; use `Prose` for
 * text because grid-item margins do not collapse. Unequal gutters keep content
 * centered in the shell; compensation decreases before the content narrows.
 */
const content = cx(
  slotSpaces,
  centered,
  compensation,
  "shell-content-grid grid justify-stretch min-w-0 rounded-none!",
  // Grid items do not collapse margins, so the grid spaces its children.
  "gap-y-(--shell-content-gap) [--shell-content-gap:--spacing(6)]",
  // Keep focused content above a sticky footer when it scrolls into view.
  "**:ui-base:scroll-mbe-(--shell-foot)",
  // Keep controls and badges at their content width instead of stretching to
  // the column.
  "[&>:is(.control,.badge)]:justify-self-start",
  // A leading or trailing wide or full band touches the bars around the
  // section. The space between the intro and the body stays.
  "[&:not(.shell-main-intro~*):has(>:is(.shell-wide,.shell-full):first-child)]:pbs-0",
  "[&:not(.shell-main-intro):has(>:is(.shell-wide,.shell-full):last-child)]:pbe-0",
  // Publish gutter spacing as frame padding so nested frame corners remain
  // concentric.
  "[--shell-popout:1rem] [--shell-feature:3.5rem]",
  // A cover child must reach the edge, so this uses the track gutter when the
  // part has one. The bracket form sorts after ak-frame-p-0, so an
  // ak-frame-p-0 class doesn't remove this padding.
  // oxlint-disable-next-line tailwindcss/enforce-canonical -- ak-frame-p-(...) sorts before ak-frame-p-0
  "ak-frame-p-[var(--shell-track-gutter,var(--shell-gutter))] px-0",
  "print:overflow-visible",
  // Bands and side parts set their own minimum, so a `min-w-*` class on them can
  // hold. The zero-specificity list keeps this rule at one class.
  "*:col-[content] *:not-[:where(.shell-band,.shell-bar-part)]:min-w-0",
  // Fragment targets clear the space above the parts, and at least 1rem, so a
  // table of contents marks the first heading current at the top of the page.
  "[&_[id]]:scroll-mbs-[calc(var(--shell-top)+var(--shell-head)+var(--shell-main-head)+max(1rem,var(--shell-main-intro-pbs,var(--shell-main-py,var(--shell-gutter)))))]",
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
   * space above the body without an intro and below the body. The body keeps
   * three steps after an intro, and the intro sets its own space with `$py`.
   * Numbers scale the spacing token and round to a whole pixel. Inherits from
   * main by default. `none` removes the space; `unset` leaves the CSS gutter
   * unchanged.
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

// The registered width resolves against main's own text, so every part keeps
// the same column. An unregistered 1em follows the parent where Prose reads it.
const sizedMain = cx(
  "shell-main-sized [--prose-size:1em] [--shell-main-max-width:42em]",
);

/**
 * The main landmark, sharing the shell columns and rows without containment.
 */
export const shellMain = cv({
  class: [
    "shell-main col-[main-start/shell-end] row-[main-start/body-end] grid grid-cols-subgrid grid-rows-subgrid min-w-0",
    // The shell's `$maxWidth` sets the column unless main sets its own.
    "[.shell-paged>&]:[--shell-main-max-width:var(--shell-max-width)]",
    "shell-slot-state",
    // Without `$py`, the body spends its own gutter on its edges next to the
    // bars, and the intro its own `$py`. A nested main doesn't take the space
    // set on an outer one or on an intro around it.
    "[--shell-main-py:initial] [--shell-main-intro-pbs:initial]",
    // Nested shells inside main also clear its sticky local header. Only the
    // first two levels publish offsets: the supported third level consumes them.
    "[.shell:not(.shell_*)>&]:[--shell-below-a:calc(var(--shell-top)+var(--shell-head)+var(--shell-main-head))]",
    "[.shell_.shell:not(.shell_.shell_.shell)>&]:[--shell-below-b:calc(var(--shell-top)+var(--shell-head)+var(--shell-main-head))]",
  ],
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
      // Bars read the column from the shell, in rem, because they keep the
      // shell's text. Each value is 42em at that size's text. The doubled class
      // wins over the rule that resets this value on a nested shell.
      sm: [
        sizedMain,
        "text-sm",
        "[.shell.shell:has(>&)]:[--shell-main-max-width:36.75rem]",
      ],
      md: [
        sizedMain,
        "text-base",
        "[.shell.shell:has(>&)]:[--shell-main-max-width:42rem]",
      ],
      lg: [
        sizedMain,
        "text-lg",
        "[.shell.shell:has(>&)]:[--shell-main-max-width:47.25rem]",
      ],
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
     * lengths, not percentages. Defaults to `gutter`: the body uses its gutter,
     * and the intro uses its own `$py`. `none` removes the space.
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
  class: [
    content,
    "shell-main-header col-start-1 col-end-[calc(2+var(--shell-header-free-1)+var(--shell-header-free-1)*var(--shell-header-free-2))] row-[main-header]",
    "box-border min-h-(--shell-main-header-height) content-center py-0! z-3",
    // A bar keeps the shell's text inside a sized main. Zero specificity lets
    // caller text-* classes win.
    "[.shell-main-sized>&]:ui-base:text-[calc(var(--shell-header-step)*4)]",
    "[.shell-main-sized>&]:ui-base:[line-height:var(--shell-leading)]",
    "[--shell-content-end-space:calc(max(0px,var(--shell-end-1-space))*var(--shell-header-free-1)+max(0px,var(--shell-end-2-space))*var(--shell-header-free-1)*var(--shell-header-free-2))]",
    // Like other bars, a shorter or taller header than `md` shrinks or grows
    // its side insets with the space around its controls. This is only the
    // smallest space at the edge. The column keeps the main gutter, so it
    // matches the body until the edge reaches it, with no query. Round only the
    // height adjustment, so a raw main gutter still matches the body. The bar
    // inset rounds the same adjustment, so a header over a default main gutter
    // stays on the edge of the bars.
    "[--shell-track-gutter:max(0px,calc(var(--shell-gutter)+round((var(--shell-main-header-height)-var(--shell-header-step)*16)/2,1px)))]",
    // With a Start, Center, or End part, the header uses the tracks of a bar.
    // Other children share the middle track, and aim for the same column.
    "[&:has(>.shell-bar-part)]:shell-bar-tracks",
    "[&:has(>.shell-bar-part)]:[--shell-bar-end-space:var(--shell-content-end-space)]",
    "[&:has(>.shell-bar-part)]:[--shell-bar-padding-start:var(--shell-track-gutter)] [&:has(>.shell-bar-part)]:[--shell-bar-padding-end:var(--shell-track-gutter)]",
    "[&:has(>.shell-bar-part)]:[--shell-bar-edge-start:var(--shell-track-gutter)] [&:has(>.shell-bar-part)]:[--shell-bar-edge-end:var(--shell-track-gutter)]",
    "[&:has(>.shell-bar-part)]:px-(--shell-track-gutter) [&:has(>.shell-bar-part)]:items-center [&:has(>.shell-bar-part)]:content-stretch",
    "[&:has(>.shell-bar-part)>*]:col-2",
    "[&:has(>.shell-bar-part):has(>.shell-bar-center)]:grid-cols-[1fr_auto_1fr]",
    "[&:has(>.shell-bar-part):has(>.shell-bar-center.shell-bar-grow)]:grid-cols-[1fr_minmax(auto,2fr)_1fr]",
    // A horizontal navigation region fills the header's height, like in a bar.
    "[&:has(>.shell-bar-part)>:has(>.nav.horizontal)]:self-stretch",
    "[&:has(>.shell-bar-part)>*>.nav.horizontal]:self-stretch [&:has(>.shell-bar-part)>*>.nav.horizontal]:items-center",
    "[&:has(>.shell-bar-part)>*>.nav.horizontal]:my-0 [&:has(>.shell-bar-part)>*>.nav.horizontal]:py-0",
    "[&:has(>.shell-bar-part)>*>.nav.horizontal]:[--nav-bar-gap:0px]",
    "[&:has(>.shell-bar-part)>*>.nav.horizontal]:rounded-none",
    "[&:has(>.shell-bar-part)>*>.nav.horizontal]:[--nav-block-size:calc(var(--shell-main-header-height)-var(--shell-facing-border,0px))]",
  ],
  variants: {
    ...contentVariants,
    /**
     * Sets the minimum content gutter. Numbers scale the spacing token and
     * round to a whole pixel. Defaults to the main gutter, with the smallest
     * space at the edge adjusted by half the height difference from an `md`
     * header. `none` removes the space; `unset` keeps the default.
     */
    $p(value?: "unset" | "none" | (string & {}) | number) {
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
    $sticky:
      "shell-main-header-sticky sticky inset-bs-[calc(var(--shell-top)+var(--shell-head))]",
    /**
     * Shows the header at or above a named shell-container width. Prefix the
     * name with `max-` to show it only below that width. `true` keeps it at
     * every width; `false` hides it at every width. A hidden header takes no
     * space and has no sticky offset. Defaults to `true`.
     */
    $show: {
      true: "",
      false: "shell-main-header-hidden hidden",
      "3xs": "shell-main-header-show-3xs @max-3xs/shell:hidden",
      "2xs": "shell-main-header-show-2xs @max-2xs/shell:hidden",
      xs: "shell-main-header-show-xs @max-xs/shell:hidden",
      sm: "shell-main-header-show-sm @max-sm/shell:hidden",
      md: "shell-main-header-show-md @max-md/shell:hidden",
      lg: "shell-main-header-show-lg @max-lg/shell:hidden",
      xl: "shell-main-header-show-xl @max-xl/shell:hidden",
      "2xl": "shell-main-header-show-2xl @max-2xl/shell:hidden",
      "3xl": "shell-main-header-show-3xl @max-3xl/shell:hidden",
      "4xl": "shell-main-header-show-4xl @max-4xl/shell:hidden",
      "5xl": "shell-main-header-show-5xl @max-5xl/shell:hidden",
      "6xl": "shell-main-header-show-6xl @max-6xl/shell:hidden",
      "7xl": "shell-main-header-show-7xl @max-7xl/shell:hidden",
      "max-3xs": "shell-main-header-show-max-3xs @3xs/shell:hidden",
      "max-2xs": "shell-main-header-show-max-2xs @2xs/shell:hidden",
      "max-xs": "shell-main-header-show-max-xs @xs/shell:hidden",
      "max-sm": "shell-main-header-show-max-sm @sm/shell:hidden",
      "max-md": "shell-main-header-show-max-md @md/shell:hidden",
      "max-lg": "shell-main-header-show-max-lg @lg/shell:hidden",
      "max-xl": "shell-main-header-show-max-xl @xl/shell:hidden",
      "max-2xl": "shell-main-header-show-max-2xl @2xl/shell:hidden",
      "max-3xl": "shell-main-header-show-max-3xl @3xl/shell:hidden",
      "max-4xl": "shell-main-header-show-max-4xl @4xl/shell:hidden",
      "max-5xl": "shell-main-header-show-max-5xl @5xl/shell:hidden",
      "max-6xl": "shell-main-header-show-max-6xl @6xl/shell:hidden",
      "max-7xl": "shell-main-header-show-max-7xl @7xl/shell:hidden",
    },
    /**
     * Sets the outer height, including the border. Defaults to the shell
     * header.
     */
    $height: {
      sm: "[.shell:has(>.shell-main>&)]:[--shell-main-header-height:calc(var(--shell-header-step)*14)] [--shell-main-header-height:calc(var(--shell-header-step)*14)]",
      md: "[.shell:has(>.shell-main>&)]:[--shell-main-header-height:calc(var(--shell-header-step)*16)] [--shell-main-header-height:calc(var(--shell-header-step)*16)]",
      lg: "[.shell:has(>.shell-main>&)]:[--shell-main-header-height:calc(var(--shell-header-step)*18)] [--shell-main-header-height:calc(var(--shell-header-step)*18)]",
    },
    /** Blurs the page behind the header through a translucent surface. */
    $blur: blur,
  },
  defaultVariants: { $p: "unset", $sticky: true, $show: true },
});

/** The introduction inside the main landmark, above its body. */
export const shellMainIntro = cv({
  extend: [frameBase],
  class: [
    content,
    "shell-main-intro content-start col-start-1 col-end-[calc(2+var(--shell-intro-free-1)+var(--shell-intro-free-1)*var(--shell-intro-free-2))] row-[intro] overflow-x-clip",
    "[--shell-content-end-space:calc(max(0px,var(--shell-end-1-space))*var(--shell-intro-free-1)+max(0px,var(--shell-end-2-space))*var(--shell-intro-free-1)*var(--shell-intro-free-2))]",
    // By default, the intro starts `$py` from main, or a space that follows the
    // width of the intro, below the header. It ends with that same space,
    // whatever main sets. A percentage resolves against the grid area, which
    // sidebars beside the intro reduce and adjacent end sidebars that start at
    // the body don't. Whole pixels keep a fluid value from leaving the page at a
    // fractional height. The sidebar alignment with the body depends only on the
    // three bar steps above the body. The padding-block utility sorts before
    // py-*.
    // Don't use a container unit here: in Chrome, one such unit under a stretched
    // grid container restyles each element with a container query on every
    // relayout of that container, such as each frame of a sidebar fold.
    "[--shell-main-intro-space:round(clamp(calc(var(--shell-header-step)*5),5%,calc(var(--shell-header-step)*14)),1px)]",
    // oxlint-disable-next-line tailwindcss/enforce-canonical -- py-[...] sorts after py-*
    "[padding-block:var(--shell-main-py,var(--shell-main-intro-space))_var(--shell-main-intro-space)]",
    // Fragment targets can't read a percentage, so they clear the largest space.
    // A table of contents still marks a target current at the top of the page.
    "[--shell-main-intro-pbs:var(--shell-main-py,round(calc(var(--shell-header-step)*14),1px))]",
  ],
  variants: {
    ...contentVariants,
    /**
     * Sets the space above and below the intro. Numbers scale the spacing
     * token; other values must be CSS lengths, not percentages. Defaults to
     * `auto`, the same space on both edges, which grows with the width of the
     * intro: open sidebars beside it reduce the space, and adjacent end
     * sidebars that start at the body don't. With `auto`, `$py` on main
     * replaces the space above when set, and fragment targets in the intro
     * otherwise clear the largest space. `gutter` uses the gutter on both
     * edges. `none` removes the space, so `py-*`, `pt-*`, and `pb-*` can set
     * it. These classes don't move fragment targets, so use a value when the
     * intro has targets.
     */
    $py(value?: "auto" | "gutter" | "none" | (string & {}) | number) {
      if (value == null) return;
      if (value === "auto") return;
      const space =
        value === "gutter"
          ? "var(--shell-gutter)"
          : getSpacingValue(value === "none" ? 0 : value);
      return {
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
  class: [
    content,
    "shell-main-body content-start col-[main] row-[body] overflow-x-clip",
    "[--shell-content-end-space:0px]",
    // The body keeps `$py` from main, or its own gutter, above and below it.
    // After an intro, it starts three bar steps below the intro.
    "[--shell-main-pbs:var(--shell-main-py,var(--shell-gutter))]",
    "[.shell-main-intro~&]:[--shell-main-pbs:round(calc(var(--shell-header-step)*3),1px)]",
    // oxlint-disable-next-line tailwindcss/enforce-canonical -- py-[...] sorts after py-*
    "[padding-block:var(--shell-main-pbs)_var(--shell-main-py,var(--shell-gutter))]",
  ],
  variants: contentVariants,
  defaultVariants: { $p: "unset" },
});

/**
 * A band across named main columns. Children fill its width. Limit nesting to
 * two levels to avoid WebKit hangs. Query containers, auto margins, and inline
 * padding break column alignment. In a bar, or a main header with side parts,
 * the band is a content area in the middle track, which has no named columns,
 * so it can't hold other bands. Its width doesn't depend on its content, so a
 * side part can take room from it. A `min-w-*` class stops it.
 * https://bugs.webkit.org/show_bug.cgi?id=268595
 */
const mainBand = cv({
  extend: [frame],
  class: [
    "shell-band grid grid-cols-subgrid min-w-0 rounded-none! px-0!",
    "[.shell-content-grid>&]:contain-inline-size [.shell-band>&]:contain-inline-size",
    "[:is(.shell-bar,.shell-main-header:has(>.shell-bar-part))>&]:col-2 [:is(.shell-bar,.shell-main-header:has(>.shell-bar-part))>&]:row-start-1",
    "[:is(.shell-bar,.shell-main-header:has(>.shell-bar-part))>&]:contain-inline-size [:is(.shell-bar,.shell-main-header:has(>.shell-bar-part))>&]:grid-cols-1",
    // In a bar, the band holds start, center, and end parts in the tracks of a
    // bar, so they line up with the area. The extra class outranks the single
    // track above.
    "[.shell-bar>&.shell-band:has(>.shell-bar-part)]:grid-cols-[1fr_auto_1fr] [.shell-bar>&.shell-band:has(>.shell-bar-part)]:items-center [.shell-bar>&.shell-band:has(>.shell-bar-part)]:gap-2",
    "[.shell-bar>&.shell-band:has(>.shell-bar-center.shell-bar-grow)]:grid-cols-[1fr_minmax(auto,2fr)_1fr]",
    // Parts keep their content minimum unless they set `$shrink`.
    "*:col-span-full *:not-[:where(.shell-bar-part)]:min-w-0",
  ],
  defaultVariants: { $p: "none" },
});

/** The centered content column, including inside a wider main band. */
export const shellContent = cv({
  extend: [mainBand],
  class:
    "shell-content [.shell-content-grid>&]:col-[content] [.shell-band>&]:col-[content]",
});

/** Extends one step beyond the centered content column. */
export const shellPopout = cv({
  extend: [mainBand],
  class:
    "shell-popout [.shell-content-grid>&]:col-[popout] [.shell-band>&]:col-[popout]",
});

/** Extends beyond the popout column while leaving the outer gutters. */
export const shellFeature = cv({
  extend: [mainBand],
  class:
    "shell-feature [.shell-content-grid>&]:col-[feature] [.shell-band>&]:col-[feature]",
});

/**
 * Extends beyond the feature column to the widest span centered on the content
 * column. Sidebar compensation stays outside it, so it matches the full band
 * when no sidebar offsets the content.
 */
export const shellWide = cv({
  extend: [mainBand],
  class:
    "shell-wide [.shell-content-grid>&]:col-[wide] [.shell-band>&]:col-[wide]",
});

/** Fills the main section width, including its outer gutters. */
export const shellFull = cv({
  extend: [mainBand],
  class:
    "shell-full [.shell-content-grid>&]:col-[full] [.shell-band>&]:col-[full]",
});
