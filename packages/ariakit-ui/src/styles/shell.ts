import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { frame, frameBase } from "./frame.ts";

export type ShellWidth = string | number;

/**
 * A page-scroll grid with a header, an intro, a body and a footer, and up to
 * two sidebar tracks per side. Each part publishes its own geometry; absent or
 * closed sidebars take no space.
 */
export const shell = cv({
  extend: [frame],
  class: [
    // A single-axis clip around sticky chrome causes compositor jitter in
    // WebKit. The main intro and body own the horizontal clip instead.
    // https://bugs.webkit.org/show_bug.cgi?id=320439
    "shell isolate grid @container/shell rounded-none!",
    "min-h-[100cqb]",
    "grid-cols-[[shell-start]_auto_auto_[main-start]_minmax(0,1fr)_[main-end]_auto_auto_[shell-end]]",
    "grid-rows-[[shell-start_header-start]_auto_[header-end_main-start_main-header-start]_auto_[main-header-end_intro-start]_auto_[intro-end_body-start]_minmax(0,1fr)_[body-end_footer-start]_auto_[footer-end_shell-end]]",
    // Match Chrome's macOS window corner without rounding the shell itself.
    "[--shell-radius:20px]",
    "[--shell-start-1-width:0px] [--shell-start-2-width:0px]",
    "[--shell-end-1-width:0px] [--shell-end-2-width:0px]",
    "[--shell-header-height:0px] [--shell-main-max-width:48rem]",
    "[--shell-duration:300ms] [--shell-motion:1] motion-reduce:[--shell-motion:0]",
    "[--shell-time:calc(var(--shell-duration)*var(--shell-motion))]",
    "[--shell-ease:cubic-bezier(0.2,0,0,1)]",
    "[--shell-header-step:--spacing(1)]",
    "[--shell-local-header-height:calc(var(--shell-header-step)*16)]",
    "[&:has(>.shell-header)]:[--shell-local-header-height:var(--shell-header-height)]",
    "[--shell-main-header-height:var(--shell-local-header-height)] [--shell-main-head:0px]",
    "[--shell-head:0px]",
    "[&:has(>.shell-header-sticky)]:[--shell-head:var(--shell-header-height)]",
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
 * A single facing edge that does not change the nested frame border channel.
 */
const seam = cv({
  extend: [frame],
  class: "rounded-none! ak-frame-border-0",
  variants: {
    /**
     * Sets the facing edge width in pixels. `true` means 1px; `false` means
     * zero.
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
 * The shared geometry of the header and the footer: three columns, with the
 * center part on the bar's middle while both sides fit and moved over when a
 * side needs more than its half. A bare `1fr` is `minmax(auto, 1fr)`, so each
 * side keeps its content minimum. The inline padding is the bar padding or the
 * device's safe area, whichever is larger; the insets are physical, so the bars
 * use physical padding here and stay logical everywhere else.
 */
const bar = cx(
  "col-[shell] grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-0!",
  "pl-[max(var(--ak-frame-padding),env(safe-area-inset-left))]",
  "pr-[max(var(--ak-frame-padding),env(safe-area-inset-right))]",
  // A growing center part takes a double share of the leftover, so it grows
  // while staying centered as long as both sides fit in a quarter of the bar.
  // The part announces it with the class its $grow variant emits.
  "[&:has(>.shell-bar-center.shell-bar-grow)]:grid-cols-[1fr_minmax(auto,2fr)_1fr]",
);

/**
 * Blurs the page behind a bar: a medium backdrop blur with a translucent
 * surface, chosen so that bar text stays above a 7:1 contrast over any backdrop
 * in either theme. Where backdrop filters are unsupported or reduced
 * transparency is requested, the opaque layer color returns; the layer utility
 * paints the opaque color first, and the fallbacks sort after it. A backdrop
 * filter creates a stacking context and a containing block for fixed
 * descendants, and nested backdrop filters do not compose.
 */
const blur = cx(
  "backdrop-blur-md bg-[color-mix(in_oklab,var(--ak-layer)_80%,transparent)]",
  "supports-[not(backdrop-filter:blur(1px))]:bg-(--ak-layer)",
  "[@media(prefers-reduced-transparency:reduce)]:bg-(--ak-layer)",
);

export const shellHeader = cv({
  extend: [seam],
  class: [
    bar,
    // The bar is a query container for its own parts. Its minimum height is
    // the token that the rest of the shell reads as the header's height.
    "shell-header row-[header] box-border min-h-(--shell-header-height) @container/shell-header",
    "z-4",
  ],
  variants: {
    /**
     * Keeps the header in view while its row is in view. It keeps its space, so
     * nothing flows under it. The shell reads the class this emits to publish
     * the header's height as the offset sticky sidebar bodies and anchors keep.
     * Defaults to `true`.
     */
    $sticky: "shell-header-sticky sticky inset-bs-(--shell-top)",
    /**
     * Sets the outer height, including the border. Defaults to `md`.
     */
    $height: {
      sm: "[.shell:has(>&)]:[--shell-header-height:calc(var(--shell-header-step)*14)] [--shell-header-height:calc(var(--shell-header-step)*14)]",
      md: "[.shell:has(>&)]:[--shell-header-height:calc(var(--shell-header-step)*16)] [--shell-header-height:calc(var(--shell-header-step)*16)]",
      lg: "[.shell:has(>&)]:[--shell-header-height:calc(var(--shell-header-step)*18)] [--shell-header-height:calc(var(--shell-header-step)*18)]",
    },
    /**
     * Blurs the page behind the bar through a translucent surface, which falls
     * back to the opaque one where backdrop filters are unsupported or reduced
     * transparency is requested.
     */
    $blur: blur,
    /**
     * Moves the center part to a second row spanning the bar when the bar's
     * content is narrower than 40rem. A stacked bar is taller than its height
     * token, so use a matching `$height` class for the stacked state.
     */
    $stackCenter: [
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:col-span-full",
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:row-start-2",
    ],
  },
  defaultVariants: {
    $sticky: true,
    $height: "md",
    $p: 3,
  },
});

/**
 * A bar part: a flex cell that keeps its content minimum by default, so the
 * center part sits on the bar's middle while both sides fit and moves over when
 * a side needs more than its half. The three parts extend it with their column
 * and their resting alignment.
 */
export const shellBarPart = cv({
  class: "flex items-center gap-2",
  variants: {
    /**
     * Lets the part lose width instead of pushing its neighbors over. The cap
     * to the track is required, or the part keeps its content width and paints
     * over its neighbor. Text children truncate with the `truncate` utility; a
     * form control keeps its intrinsic minimum unless it gets `min-w-0` or a
     * width. The clip margin keeps focus rings visible; WebKit does not support
     * it, and there the ring is clipped at the part's edge. This is not a way
     * to hide controls: a clipped control cannot be scrolled back into view,
     * and a bar that must drop buttons needs an overflow menu.
     */
    $shrink: {
      true: "max-w-full box-border min-w-0 overflow-clip [overflow-clip-margin:0.25rem]",
      false: "min-w-auto",
    },
    /**
     * Fills the part's track instead of resting at its edge or on its middle.
     * Each part adds the resting alignment it leaves, and the center part the
     * class the bar reads.
     */
    $grow: {
      true: "justify-self-stretch",
    },
  },
});

export const shellHeaderStart = cv({
  extend: [shellBarPart],
  class: "shell-bar-start col-1",
  variants: {
    /**
     * Fills the part's track instead of resting at the bar's start edge.
     */
    $grow: { false: "justify-self-start" },
  },
});

export const shellHeaderCenter = cv({
  extend: [shellBarPart],
  class: "shell-bar-center col-2",
  variants: {
    /**
     * Takes a double share of the bar's leftover width, growing while staying
     * centered as long as both sides fit in a quarter of the bar: the bar reads
     * the class this emits. Beside a very wide side part it sits further off
     * center than a plain part; `$shrink` on both sides keeps it exactly
     * centered. Paired with `$shrink` on this part, the bar becomes a fixed
     * one-two-one split in which the center truncates while the sides still
     * have room, so avoid that pair.
     */
    $grow: { true: "shell-bar-grow", false: "justify-self-center" },
  },
});

export const shellHeaderEnd = cv({
  extend: [shellBarPart],
  class: "shell-bar-end col-3",
  variants: {
    /**
     * Fills the part's track instead of resting at the bar's end edge.
     */
    $grow: { false: "justify-self-end" },
  },
});

export const shellFooter = cv({
  extend: [seam],
  class: [
    bar,
    // Always static and as tall as its content: a sticky sidebar body may
    // never leave its column, which ends where the footer row begins, so a
    // footer of any height pushes the body up on its own.
    "shell-footer row-[footer] @container/shell-footer",
    "z-3",
    "pbs-0! pbe-[env(safe-area-inset-bottom)]!",
  ],
  variants: {
    /** Sets the interior height plus its facing border. Defaults to `md`. */
    $height: {
      sm: "min-h-[calc(--spacing(14)+var(--shell-facing-border))]",
      md: "min-h-[calc(--spacing(16)+var(--shell-facing-border))]",
      lg: "min-h-[calc(--spacing(18)+var(--shell-facing-border))]",
    },
    /**
     * Blurs the page behind the bar through a translucent surface, which falls
     * back to the opaque one where backdrop filters are unsupported or reduced
     * transparency is requested.
     */
    $blur: blur,
  },
  defaultVariants: {
    $p: 3,
    $height: "md",
  },
});

export const shellFooterStart = shellHeaderStart;
export const shellFooterCenter = shellHeaderCenter;
export const shellFooterEnd = shellHeaderEnd;

/**
 * A folding column around the public sidebar panel. The column stays rendered
 * at zero width while the panel is removed from layout, so reopening animates
 * without a starting style or an entrance animation on the initial render.
 */
export const shellSidebar = cv({
  class: [
    "shell-slot-state",
    "[--shell-sidebar-head:0px]",
    // Keep the panel's offset while its own column closes or collapses.
    "[&.shell-sidebar-end]:[--shell-sidebar-head:calc(var(--shell-main-head)*(1-var(--shell-end-1-from-main)))]",
    "[.shell-sidebar-end~&.shell-sidebar-end]:[--shell-sidebar-head:calc(var(--shell-main-head)*var(--shell-header-free-1)*(1-var(--shell-end-2-from-main)))]",
    "shell-sidebar flex flex-col box-border @container/shell-sidebar rounded-none!",
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
     * Sets this sidebar's width and publishes it to the shell. Defaults to
     * `md`.
     */
    $width: {
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
     * Folds the sidebar below a named shell-container width. Defaults to `3xl`
     * (48rem). Use `false` for a sidebar that stays open at any width.
     */
    $collapse: {
      false: "",
      "3xs":
        "shell-sidebar-c-3xs @max-3xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-3xs/shell:[&>.shell-sidebar-panel]:hidden",
      "2xs":
        "shell-sidebar-c-2xs @max-2xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-2xs/shell:[&>.shell-sidebar-panel]:hidden",
      xs: "shell-sidebar-c-xs @max-xs/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-xs/shell:[&>.shell-sidebar-panel]:hidden",
      sm: "shell-sidebar-c-sm @max-sm/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-sm/shell:[&>.shell-sidebar-panel]:hidden",
      md: "shell-sidebar-c-md @max-md/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-md/shell:[&>.shell-sidebar-panel]:hidden",
      lg: "shell-sidebar-c-lg @max-lg/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-lg/shell:[&>.shell-sidebar-panel]:hidden",
      xl: "shell-sidebar-c-xl @max-xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-xl/shell:[&>.shell-sidebar-panel]:hidden",
      "2xl":
        "shell-sidebar-c-2xl @max-2xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-2xl/shell:[&>.shell-sidebar-panel]:hidden",
      "3xl":
        "shell-sidebar-c-3xl @max-3xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-3xl/shell:[&>.shell-sidebar-panel]:hidden",
      "4xl":
        "shell-sidebar-c-4xl @max-4xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-4xl/shell:[&>.shell-sidebar-panel]:hidden",
      "5xl":
        "shell-sidebar-c-5xl @max-5xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-5xl/shell:[&>.shell-sidebar-panel]:hidden",
      "6xl":
        "shell-sidebar-c-6xl @max-6xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-6xl/shell:[&>.shell-sidebar-panel]:hidden",
      "7xl":
        "shell-sidebar-c-7xl @max-7xl/shell:[&:has(>.shell-sidebar-panel[data-open])]:w-0 @max-7xl/shell:[&>.shell-sidebar-panel]:hidden",
    },
    /** Selects the first row the sidebar spans. Defaults to `main`. */
    $from: {
      main: "shell-sidebar-from-main row-[main-start/body-end]",
      intro: "shell-sidebar-from-intro row-[intro-start/body-end]",
      body: "shell-sidebar-from-body row-[body]",
    },
    /**
     * Keeps the panel below the sticky headers that span its column.
     */
    $sticky: [
      "[&>.shell-sidebar-panel]:sticky",
      "[&>.shell-sidebar-panel]:inset-bs-[calc(var(--shell-top)+var(--shell-head)+var(--shell-sidebar-head))]",
      "[&>.shell-sidebar-panel]:max-h-[calc(100cqb-var(--shell-top)-var(--shell-head)-var(--shell-sidebar-head))]",
    ],
  },
  defaultVariants: {
    $side: "start",
    $width: "md",
    $collapse: "3xl",
    $from: "main",
    $sticky: true,
  },
});

/** The public sidebar element keeps its full width while its column folds. */
export const shellSidebarPanel = cv({
  extend: [seam],
  class: [
    "shell-sidebar-panel box-border w-(--shell-slot-width) min-h-0 flex-auto flex flex-col",
    // Supporting browsers defer removal until the fold ends. Others hide at once.
    "transition-[display] transition-discrete duration-(--shell-time)",
    // Unlike auto margins, end alignment also handles an overflowing panel,
    // keeping its facing border against the column while the column folds.
    "[.shell-sidebar-start>&]:self-end",
    "[.shell-sidebar-end>&]:self-start",
  ],
  defaultVariants: { $p: "none" },
});

/** A fixed header above the sidebar's scrollable body. */
export const shellSidebarHeader = cv({
  extend: [seam],
  class:
    "shell-sidebar-header flex flex-none items-center box-border min-h-(--shell-local-header-height) py-0!",
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
  defaultVariants: { $p: 3 },
});

/** The scrollable center of a sidebar panel. */
export const shellSidebarBody = cv({
  extend: [frameBase],
  class: "shell-sidebar-body min-h-0 flex-auto overflow-y-auto rounded-none!",
  defaultVariants: { $p: 3 },
});

/** A fixed footer below the sidebar's scrollable body. */
export const shellSidebarFooter = cv({
  extend: [seam],
  class: "shell-sidebar-footer flex-none",
  defaultVariants: { $p: 3 },
});

/**
 * The gutter track of a centered main: at least the gutter, at most the free
 * space beyond the content's maximum width, and in between the gutter plus the
 * compensation for the other side's sidebars. The tracks are `auto`, which the
 * grid stretches by equal amounts, so the offset between them survives; `1fr`
 * gutters would collapse it. Below the width that fits everything, the
 * compensation gives way first and the content column keeps its width.
 */
const slotSpaces = cx(
  // The occupied widths animate with each column. Main uses them for
  // centering; the intro also reserves the end columns that it spans.
  "[--shell-start-1-space:calc(var(--shell-start-1-width)*var(--shell-start-1-open)*var(--shell-start-1-fit))]",
  "[--shell-start-2-space:calc(var(--shell-start-2-width)*var(--shell-start-2-open)*var(--shell-start-2-fit))]",
  "[--shell-end-1-space:calc(var(--shell-end-1-width)*var(--shell-end-1-open)*var(--shell-end-1-fit))]",
  "[--shell-end-2-space:calc(var(--shell-end-2-width)*var(--shell-end-2-open)*var(--shell-end-2-fit))]",
  "transition-[--shell-start-1-space,--shell-start-2-space,--shell-end-1-space,--shell-end-2-space]",
  "duration-(--shell-time) ease-(--shell-ease)",
  // Each space is clamped at zero when the sides are summed: an overshooting
  // easing can take a length below zero while the column stops at zero.
  "[--shell-start-total:calc(max(0px,var(--shell-start-1-space))+max(0px,var(--shell-start-2-space)))]",
  "[--shell-end-total:calc(max(0px,var(--shell-end-1-space))+max(0px,var(--shell-end-2-space)))]",
);

const compensation = cx(
  "[--shell-comp-end:max(0px,calc(var(--shell-start-total)-var(--shell-end-total)))]",
  "[--shell-comp-start:max(0px,calc(var(--shell-end-total)-var(--shell-start-total)))]",
);

const centered = cx(
  "[--shell-free:calc(100%-var(--shell-content-end-space)-var(--shell-main-max-width)-var(--shell-gutter)-2*var(--shell-popout)-2*var(--shell-feature))]",
  "[--shell-track-start:clamp(var(--shell-gutter),var(--shell-free),calc(var(--shell-gutter)+var(--shell-comp-start)))]",
  "[--shell-track-end:calc(var(--shell-content-end-space)+clamp(var(--shell-gutter),var(--shell-free),calc(var(--shell-gutter)+var(--shell-comp-end))))]",
  "grid-cols-[[full-start]_minmax(var(--shell-track-start),auto)_[feature-start]_minmax(0,var(--shell-feature))_[popout-start]_minmax(0,var(--shell-popout))_[content-start]_minmax(min(var(--shell-main-max-width),max(0px,calc(100%-var(--shell-content-end-space)-2*var(--shell-gutter)))),var(--shell-main-max-width))_[content-end]_minmax(0,var(--shell-popout))_[popout-end]_minmax(0,var(--shell-feature))_[feature-end]_minmax(var(--shell-track-end),auto)_[full-end]]",
);

/**
 * The main area: a named-lines grid (`full` spans the gutters, `content` sits
 * between them) and a query container, so its content reacts to the width it
 * has rather than the window's. Every direct child is a grid item in the
 * content column, so margins do not collapse; `Prose` is the text container to
 * use. Anchors inside land below a sticky header.
 *
 * With `$centered`, the content column stays on the shell's center whatever the
 * sidebars are doing: each slot's declared width times its open flag is a
 * transitioned length, and the difference between the sides is spent as the
 * emptier gutter, in step with the drawer that is folding. Full centering needs
 * the shell to be at least as wide as the open sidebars plus the content
 * maximum plus two gutters plus the difference between the sides; below that
 * the content column drifts toward the sidebar by up to half its width before
 * it gives up width.
 */
const content = cx(
  "shell-content grid justify-stretch min-w-0 rounded-none!",
  // The inset is a grid track. Publish it to the frame padding channel
  // so nested frames still compute a concentric radius from that distance.
  "[--shell-popout:1rem] [--shell-feature:3.5rem]",
  "ak-frame-p-(--shell-gutter) px-0!",
  "print:overflow-visible",
  "[&>*]:col-[content] [&>*]:min-w-0",
  // A fragment link lands below a sticky header.
  "[&_[id]]:[scroll-margin-block-start:calc(var(--shell-top)+var(--shell-head)+var(--shell-main-head)+1rem)]",
);

const contentVariants = {
  /**
   * Centers the content column: on the shell's center, compensating for the
   * sidebars, or with `"main"` within main only, with no compensation. The
   * full-width template lives in the same variant, so each render emits one
   * template and the two never compete.
   */
  $centered: {
    true: [centered, compensation],
    // No compensation: the same template with both offsets at zero.
    main: [centered, "[--shell-comp-start:0px] [--shell-comp-end:0px]"],
    false:
      "grid-cols-[[full-start]_var(--shell-gutter)_[feature-start]_0_[popout-start]_0_[content-start]_minmax(0,1fr)_[content-end]_0_[popout-end]_0_[feature-end]_calc(var(--shell-gutter)+var(--shell-content-end-space))_[full-end]]",
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
 * The main landmark shares the shell's columns and rows without containment.
 */
export const shellMain = cv({
  class: [
    "shell-main col-[main-start/shell-end] row-[main-start/body-end] grid grid-cols-subgrid grid-rows-subgrid min-w-0",
    "shell-slot-state",
    slotSpaces,
    // Resolve registered slot lengths here; the parts inherit the totals.
    "[--shell-header-end-space:calc(max(0px,var(--shell-end-1-space))*var(--shell-header-free-1)+max(0px,var(--shell-end-2-space))*var(--shell-header-free-1)*var(--shell-header-free-2))]",
    "[--shell-intro-end-space:calc(max(0px,var(--shell-end-1-space))*var(--shell-intro-free-1)+max(0px,var(--shell-end-2-space))*var(--shell-intro-free-1)*var(--shell-intro-free-2))]",
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
     * Sets the shared maximum content width. Numbers scale the main's spacing
     * token. Parts inherit this value unless they set their own `$maxWidth`.
     * Use a number or length to keep parts aligned. Percentages resolve against
     * each part's width; the header and intro can span end columns.
     */
    $maxWidth(value?: ShellWidth) {
      return contentVariants.$maxWidth(value);
    },
  },
  defaultVariants: { $p: 3 },
});

/** The sticky main header spans the contiguous unoccupied end columns. */
export const shellMainHeader = cv({
  extend: [seam],
  class: [
    content,
    "shell-main-header col-start-1 col-end-[calc(2+var(--shell-header-free-1)+var(--shell-header-free-1)*var(--shell-header-free-2))] row-[main-header]",
    "box-border min-h-(--shell-main-header-height) content-center py-0! z-3",
    "[--shell-content-end-space:var(--shell-header-end-space)]",
  ],
  variants: {
    ...contentVariants,
    /**
     * Keeps the main header below the shell's sticky headers. Defaults to true.
     */
    $sticky:
      "shell-main-header-sticky sticky inset-bs-[calc(var(--shell-top)+var(--shell-head))]",
    /**
     * Hides the header below a named shell-container width and removes its
     * sticky offset. Defaults to `false`, keeping it at every width.
     */
    $collapse: {
      false: "",
      "3xs": "shell-main-header-c-3xs @max-3xs/shell:hidden",
      "2xs": "shell-main-header-c-2xs @max-2xs/shell:hidden",
      xs: "shell-main-header-c-xs @max-xs/shell:hidden",
      sm: "shell-main-header-c-sm @max-sm/shell:hidden",
      md: "shell-main-header-c-md @max-md/shell:hidden",
      lg: "shell-main-header-c-lg @max-lg/shell:hidden",
      xl: "shell-main-header-c-xl @max-xl/shell:hidden",
      "2xl": "shell-main-header-c-2xl @max-2xl/shell:hidden",
      "3xl": "shell-main-header-c-3xl @max-3xl/shell:hidden",
      "4xl": "shell-main-header-c-4xl @max-4xl/shell:hidden",
      "5xl": "shell-main-header-c-5xl @max-5xl/shell:hidden",
      "6xl": "shell-main-header-c-6xl @max-6xl/shell:hidden",
      "7xl": "shell-main-header-c-7xl @max-7xl/shell:hidden",
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
  defaultVariants: { $p: "unset", $sticky: true },
});

/** The introduction inside the main landmark, above its body. */
export const shellMainIntro = cv({
  extend: [frameBase],
  class: [
    content,
    "shell-main-intro content-start col-start-1 col-end-[calc(2+var(--shell-intro-free-1)+var(--shell-intro-free-1)*var(--shell-intro-free-2))] row-[intro] @container/shell-main-intro overflow-x-clip",
    "[--shell-content-end-space:var(--shell-intro-end-space)]",
  ],
  variants: contentVariants,
  defaultVariants: { $p: "unset" },
});

/** The main content grid, excluding the end sidebar columns. */
export const shellMainBody = cv({
  extend: [frameBase],
  class: [
    content,
    "shell-main-body content-start col-[main] row-[body] @container/shell-main-body overflow-x-clip",
    "[--shell-content-end-space:0px]",
  ],
  variants: contentVariants,
  defaultVariants: { $p: "unset" },
});

/**
 * A band across named content columns. Children return to the content column,
 * and a narrower breakout can nest inside it. Keep nesting to two levels:
 * deeply nested subgrids can hang WebKit. Do not add a query container, auto
 * margins, or inline padding: each breaks the inherited column alignment.
 * https://bugs.webkit.org/show_bug.cgi?id=268595
 */
export const shellBreakout = cv({
  extend: [frame],
  class: [
    "shell-breakout grid grid-cols-subgrid rounded-none! px-0!",
    "[.shell-content>&]:contain-inline-size [.shell-breakout>&]:contain-inline-size",
    "[&>*]:col-[content] [&>*]:min-w-0",
  ],
  variants: {
    /** Chooses how far the band extends past content. Defaults to `full`. */
    $span: {
      popout:
        "[.shell-content>&]:col-[popout] [.shell-breakout>&]:col-[popout]",
      feature:
        "[.shell-content>&]:col-[feature] [.shell-breakout>&]:col-[feature]",
      full: "[.shell-content>&]:col-[full] [.shell-breakout>&]:col-[full]",
    },
  },
  defaultVariants: { $span: "full", $p: "none" },
});
