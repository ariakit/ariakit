import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
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
    "grid-cols-[[shell-start]_auto_auto_[main-start]_minmax(0,1fr)_[main-end]_auto_auto_[shell-end]]",
    "grid-rows-[[shell-start_header-start]_auto_[header-end_main-start_main-header-start]_auto_[main-header-end_intro-start]_auto_[intro-end_body-start]_minmax(0,1fr)_[body-end_footer-start]_auto_[footer-end_shell-end]]",
    "[--shell-start-1-width:0px] [--shell-start-2-width:0px]",
    "[--shell-end-1-width:0px] [--shell-end-2-width:0px]",
    "[--shell-header-height:0px] [--shell-main-max-width:48rem]",
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
     * it; `Prose` keeps its own reading size. `auto` uses `sm`, or the outer
     * shell's size in a nested shell. Use another value to change a nested
     * shell's size. Defaults to `auto`.
     */
    // Each size also sets the bar step in rem. Firefox resolves a registered em
    // length against the parent font when the element changes its own size. The
    // shell radius divides the theme radius by the text size, so the corner
    // matches Chrome's macOS window (20px at the default radius) at every size
    // without rounding the shell itself.
    $size: {
      auto: [
        "text-sm [--shell-header-step:calc(0.875rem/4)]",
        "[--shell-radius:calc(var(--radius)*5/0.875)]",
        "[.shell_&]:[font-size:inherit] [.shell_&]:[line-height:inherit]",
        "[.shell_&]:[--shell-header-step:inherit]",
        "[.shell_&]:[--shell-radius:inherit]",
      ],
      sm: [
        "text-sm [--shell-header-step:calc(0.875rem/4)]",
        "[--shell-radius:calc(var(--radius)*5/0.875)]",
      ],
      md: [
        "text-base [--shell-header-step:calc(1rem/4)]",
        "[--shell-radius:calc(var(--radius)*5)]",
      ],
      lg: [
        "text-lg [--shell-header-step:calc(1.125rem/4)]",
        "[--shell-radius:calc(var(--radius)*5/1.125)]",
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
  },
  defaultVariants: {
    $size: "auto",
    $layer: "transparent",
    $rounded: "var(--shell-radius)",
    $p: "none",
  },
});

const facingBorder = cx(
  "[&:is(.shell-header,.shell-main-header,.shell-sidebar-header)]:border-be-(length:--border-width)",
  "[&:is(.shell-footer,.shell-sidebar-footer)]:border-bs-(length:--border-width)",
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
 * side insets follow it.
 */
const barInsetDefault = "var(--shell-bar-inset)";

/**
 * Three columns keep the center aligned until a side needs more room. Content
 * minimums come from `1fr`; physical safe-area insets set the minimum side
 * padding.
 */
const bar = cx(
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
  "col-[shell] grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-0!",
  "pl-[max(var(--ak-frame-padding),env(safe-area-inset-left))]",
  "pr-[max(var(--ak-frame-padding),env(safe-area-inset-right))]",
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
    "z-4",
    "[--shell-bar-inset:max(0px,calc(var(--spacing)*3+(var(--shell-header-height)-var(--shell-header-step)*16)/2))]",
  ],
  variants: {
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
     * matching `$height` class for the taller layout.
     */
    $stackCenter: [
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:col-span-full",
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:row-start-2",
    ],
  },
  defaultVariants: {
    $sticky: true,
    $height: "md",
    $p: barInsetDefault,
  },
});

/** A header or footer section that preserves its content width by default. */
export const shellBarPart = cv({
  class: "flex items-center gap-2",
  variants: {
    /**
     * Lets the section shrink below its content width. Use `truncate` on text
     * and `min-w-0` or an explicit width on controls. WebKit clips focus rings
     * at the section edge. Use an overflow menu for controls that must remain
     * reachable.
     */
    $shrink: {
      true: "max-w-full box-border min-w-0 overflow-clip [overflow-clip-margin:0.25rem]",
      false: "min-w-auto",
    },
    /** Fills the section's track instead of using its resting alignment. */
    $grow: {
      true: "justify-self-stretch",
    },
  },
});

/** The start section of a shell header or footer. */
export const shellHeaderStart = cv({
  extend: [shellBarPart],
  class: "shell-bar-start col-1",
  variants: {
    /** Fills the part's track instead of resting at the bar's start edge. */
    $grow: { false: "justify-self-start" },
  },
});

/** The center section of a shell header or footer. */
export const shellHeaderCenter = cv({
  extend: [shellBarPart],
  class: "shell-bar-center col-2",
  variants: {
    /**
     * Gives the center twice the free width. It stays centered while both sides
     * fit within one quarter. Set `$shrink` on both sides for exact centering.
     * Avoid `$shrink` on this section: it fixes the columns at a 1:2:1 ratio.
     */
    $grow: { true: "shell-bar-grow", false: "justify-self-center" },
  },
});

/** The end section of a shell header or footer. */
export const shellHeaderEnd = cv({
  extend: [shellBarPart],
  class: "shell-bar-end col-3",
  variants: {
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
    "z-3",
    "pbs-0! pbe-[env(safe-area-inset-bottom)]!",
    "[--shell-bar-inset:max(0px,calc(var(--spacing)*3+(var(--shell-footer-height)-var(--shell-header-step)*16)/2))]",
  ],
  variants: {
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

/** A footer part aligned to the start edge. */
export const shellFooterStart = shellHeaderStart;

/** A footer part centered while both side parts fit. */
export const shellFooterCenter = shellHeaderCenter;

/** A footer part aligned to the end edge. */
export const shellFooterEnd = shellHeaderEnd;

/**
 * A sidebar column that folds to zero width while its panel keeps its full
 * width. Reopening animates without an entrance animation on first render.
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
    "[&:not(:has(>.shell-sidebar-panel[data-open]))]:w-0",
    "[&>.shell-sidebar-panel:not([data-open])]:hidden",
    "transition-[width] duration-(--shell-time) ease-(--shell-ease)",
  ],
  variants: {
    /**
     * Chooses the side. Up to two columns per side follow their DOM order: the
     * first start column is outermost and the first end column is innermost.
     */
    $side: {
      start: "shell-sidebar-start col-1 [.shell-sidebar-start~&]:col-2",
      end: "shell-sidebar-end col-4 [.shell-sidebar-end~&]:col-5",
    },
    /**
     * Sets this sidebar's width and publishes it to the shell. `3xs` fits a
     * rail of square icon buttons in a vertical button group at any shell size.
     * Defaults to `md`.
     */
    $width: {
      // A default button is one line tall. The body, group, and button padding
      // add 1.5em on each side, and the facing edge adds 1px.
      "3xs": [
        "[--shell-slot-width:calc(1lh+3em+1px)]",
        "[.shell:has(>&.shell-sidebar-start:not(.shell-sidebar-start~*))]:[--shell-start-1-width:calc(1lh+3em+1px)]",
        "[.shell:has(>.shell-sidebar-start~&.shell-sidebar-start)]:[--shell-start-2-width:calc(1lh+3em+1px)]",
        "[.shell:has(>&.shell-sidebar-end:not(.shell-sidebar-end~*))]:[--shell-end-1-width:calc(1lh+3em+1px)]",
        "[.shell:has(>.shell-sidebar-end~&.shell-sidebar-end)]:[--shell-end-2-width:calc(1lh+3em+1px)]",
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
      true: "",
      false:
        "shell-sidebar-hidden [&:has(>.shell-sidebar-panel[data-open])]:w-0 [&>.shell-sidebar-panel]:hidden",
      "3xs":
        "shell-sidebar-show-3xs @max-3xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-3xs/shell:[&>.shell-sidebar-panel]:hidden",
      "2xs":
        "shell-sidebar-show-2xs @max-2xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-2xs/shell:[&>.shell-sidebar-panel]:hidden",
      xs: "shell-sidebar-show-xs @max-xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-xs/shell:[&>.shell-sidebar-panel]:hidden",
      sm: "shell-sidebar-show-sm @max-sm/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-sm/shell:[&>.shell-sidebar-panel]:hidden",
      md: "shell-sidebar-show-md @max-md/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-md/shell:[&>.shell-sidebar-panel]:hidden",
      lg: "shell-sidebar-show-lg @max-lg/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-lg/shell:[&>.shell-sidebar-panel]:hidden",
      xl: "shell-sidebar-show-xl @max-xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-xl/shell:[&>.shell-sidebar-panel]:hidden",
      "2xl":
        "shell-sidebar-show-2xl @max-2xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-2xl/shell:[&>.shell-sidebar-panel]:hidden",
      "3xl":
        "shell-sidebar-show-3xl @max-3xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-3xl/shell:[&>.shell-sidebar-panel]:hidden",
      "4xl":
        "shell-sidebar-show-4xl @max-4xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-4xl/shell:[&>.shell-sidebar-panel]:hidden",
      "5xl":
        "shell-sidebar-show-5xl @max-5xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-5xl/shell:[&>.shell-sidebar-panel]:hidden",
      "6xl":
        "shell-sidebar-show-6xl @max-6xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-6xl/shell:[&>.shell-sidebar-panel]:hidden",
      "7xl":
        "shell-sidebar-show-7xl @max-7xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-7xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-3xs":
        "shell-sidebar-show-max-3xs @3xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @3xs/shell:[&>.shell-sidebar-panel]:hidden",
      "max-2xs":
        "shell-sidebar-show-max-2xs @2xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @2xs/shell:[&>.shell-sidebar-panel]:hidden",
      "max-xs":
        "shell-sidebar-show-max-xs @xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @xs/shell:[&>.shell-sidebar-panel]:hidden",
      "max-sm":
        "shell-sidebar-show-max-sm @sm/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @sm/shell:[&>.shell-sidebar-panel]:hidden",
      "max-md":
        "shell-sidebar-show-max-md @md/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @md/shell:[&>.shell-sidebar-panel]:hidden",
      "max-lg":
        "shell-sidebar-show-max-lg @lg/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @lg/shell:[&>.shell-sidebar-panel]:hidden",
      "max-xl":
        "shell-sidebar-show-max-xl @xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-2xl":
        "shell-sidebar-show-max-2xl @2xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @2xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-3xl":
        "shell-sidebar-show-max-3xl @3xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @3xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-4xl":
        "shell-sidebar-show-max-4xl @4xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @4xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-5xl":
        "shell-sidebar-show-max-5xl @5xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @5xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-6xl":
        "shell-sidebar-show-max-6xl @6xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @6xl/shell:[&>.shell-sidebar-panel]:hidden",
      "max-7xl":
        "shell-sidebar-show-max-7xl @7xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @7xl/shell:[&>.shell-sidebar-panel]:hidden",
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
      "[&>.shell-sidebar-panel]:max-h-[calc(100cqb-var(--shell-top)-var(--shell-head)-var(--shell-sidebar-head)-var(--shell-foot))]",
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

// Limit sidebar compensation to free space, but keep the minimum gutter. `auto`
// tracks grow by equal amounts, preserving the offset; `1fr` loses it.
const centered = cx(
  "[--shell-free:calc(100%-var(--shell-content-end-space)-var(--shell-main-max-width)-var(--shell-gutter)-2*var(--shell-popout)-2*var(--shell-feature))]",
  "[--shell-track-start:clamp(var(--shell-gutter),var(--shell-free),calc(var(--shell-gutter)+var(--shell-comp-start)))]",
  "[--shell-track-end:calc(var(--shell-content-end-space)+clamp(var(--shell-gutter),var(--shell-free),calc(var(--shell-gutter)+var(--shell-comp-end))))]",
  "grid-cols-[[full-start]_minmax(var(--shell-track-start),auto)_[feature-start]_minmax(0,var(--shell-feature))_[popout-start]_minmax(0,var(--shell-popout))_[content-start]_minmax(min(var(--shell-main-max-width),max(0px,calc(100%-var(--shell-content-end-space)-2*var(--shell-gutter)))),var(--shell-main-max-width))_[content-end]_minmax(0,var(--shell-popout))_[popout-end]_minmax(0,var(--shell-feature))_[feature-end]_minmax(var(--shell-track-end),auto)_[full-end]]",
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
  "shell-content grid justify-stretch min-w-0 rounded-none!",
  // Grid items do not collapse margins, so the grid spaces its children.
  "gap-y-(--shell-content-gap) [--shell-content-gap:--spacing(6)]",
  // Keep focused content above a sticky footer when it scrolls into view.
  "[:where(&)_*]:[scroll-margin-block-end:var(--shell-foot)]",
  // Keep controls at their content width instead of stretching to the column.
  "[&>.control]:justify-self-start",
  // A leading or trailing full band touches the bars around the section.
  "[&:has(>.shell-main-full:first-child)]:pbs-0",
  "[&:has(>.shell-main-full:last-child)]:pbe-0",
  // Publish gutter spacing as frame padding so nested frame corners remain
  // concentric.
  "[--shell-popout:1rem] [--shell-feature:3.5rem]",
  "ak-frame-p-(--shell-gutter) px-0",
  "print:overflow-visible",
  "*:col-[content] *:min-w-0",
  "[&_[id]]:[scroll-margin-block-start:calc(var(--shell-top)+var(--shell-head)+var(--shell-main-head)+1rem)]",
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
   * spacing token. Defaults to 48rem.
   */
  $maxWidth(value?: ShellWidth) {
    if (value == null) return;
    return { style: { "--shell-main-max-width": getSpacingValue(value) } };
  },
  /**
   * Sets the minimum content gutter and block padding. Numbers scale the
   * spacing token. Inherits from main by default. `none` removes the space;
   * `unset` leaves the CSS gutter unchanged.
   */
  $p(value?: "unset" | "none" | (string & {}) | number) {
    if (value == null) return;
    if (value === "unset") return;
    return {
      style: {
        "--shell-gutter": getSpacingValue(value === "none" ? 0 : value),
      },
    };
  },
};

/**
 * The main landmark, sharing the shell columns and rows without containment.
 */
export const shellMain = cv({
  class: [
    "shell-main col-[main-start/shell-end] row-[main-start/body-end] grid grid-cols-subgrid grid-rows-subgrid min-w-0",
    "shell-slot-state",
    // The main header derives its own gutter from this one.
    "[--shell-main-gutter:var(--shell-gutter)]",
    // Nested shells inside main also clear its sticky local header. Only the
    // first two levels publish offsets: the supported third level consumes them.
    "[.shell:not(.shell_*)>&]:[--shell-below-a:calc(var(--shell-top)+var(--shell-head)+var(--shell-main-head))]",
    "[.shell_.shell:not(.shell_.shell_.shell)>&]:[--shell-below-b:calc(var(--shell-top)+var(--shell-head)+var(--shell-main-head))]",
  ],
  variants: {
    /**
     * Sets the shared main gutter. Numbers scale the spacing token. A CSS
     * length can use container queries on the nearest shell. Defaults to 3.
     */
    $p(value?: "unset" | "none" | (string & {}) | number) {
      return contentVariants.$p(value);
    },
    /**
     * Sets the shared maximum content width. Numbers scale the spacing token.
     * Parts can override it with `$maxWidth`. Prefer lengths for alignment:
     * percentages resolve against each part, and header or intro widths can
     * include sidebars.
     */
    $maxWidth(value?: ShellWidth) {
      return contentVariants.$maxWidth(value);
    },
  },
  defaultVariants: { $p: 3 },
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
    "[--shell-content-end-space:calc(max(0px,var(--shell-end-1-space))*var(--shell-header-free-1)+max(0px,var(--shell-end-2-space))*var(--shell-header-free-1)*var(--shell-header-free-2))]",
    // Like other bars, a shorter or taller header than `md` shrinks or grows
    // its side insets with the space around its controls. A centered column
    // still lines up with the body once both side tracks have room to spare.
    "[--shell-gutter:max(0px,calc(var(--shell-main-gutter)+(var(--shell-main-header-height)-var(--shell-header-step)*16)/2))]",
  ],
  variants: {
    ...contentVariants,
    /**
     * Sets the minimum content gutter. Numbers scale the spacing token.
     * Defaults to the main gutter, adjusted by half the height difference from
     * an `md` header. `none` removes the space; `unset` keeps the default.
     */
    $p(value?: "unset" | "none" | (string & {}) | number) {
      return contentVariants.$p(value);
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
    // Separate the title from the bars above.
    "pbs-[calc(var(--shell-gutter)*3)]",
  ],
  variants: contentVariants,
  defaultVariants: { $p: "unset" },
});

/** The main content grid, excluding the end sidebar columns. */
export const shellMainBody = cv({
  extend: [frameBase],
  class: [
    content,
    "shell-main-body content-start col-[main] row-[body] overflow-x-clip",
    "[--shell-content-end-space:0px]",
  ],
  variants: contentVariants,
  defaultVariants: { $p: "unset" },
});

/**
 * A band across named main columns. Children fill its width. Limit nesting to
 * two levels to avoid WebKit hangs. Query containers, auto margins, and inline
 * padding break column alignment.
 * https://bugs.webkit.org/show_bug.cgi?id=268595
 */
const mainBand = cv({
  extend: [frame],
  class: [
    "shell-main-band grid grid-cols-subgrid min-w-0 rounded-none! px-0!",
    "[.shell-content>&]:contain-inline-size [.shell-main-band>&]:contain-inline-size",
    "*:col-span-full *:min-w-0",
  ],
  defaultVariants: { $p: "none" },
});

/** The centered content column, including inside a wider main band. */
export const shellMainContent = cv({
  extend: [mainBand],
  class:
    "shell-main-content [.shell-content>&]:col-[content] [.shell-main-band>&]:col-[content]",
});

/** Extends one step beyond the centered content column. */
export const shellMainPopout = cv({
  extend: [mainBand],
  class:
    "shell-main-popout [.shell-content>&]:col-[popout] [.shell-main-band>&]:col-[popout]",
});

/** Extends beyond the popout column while leaving the outer gutters. */
export const shellMainFeature = cv({
  extend: [mainBand],
  class:
    "shell-main-feature [.shell-content>&]:col-[feature] [.shell-main-band>&]:col-[feature]",
});

/** Fills the main section width, including its outer gutters. */
export const shellMainFull = cv({
  extend: [mainBand],
  class:
    "shell-main-full [.shell-content>&]:col-[full] [.shell-main-band>&]:col-[full]",
});
