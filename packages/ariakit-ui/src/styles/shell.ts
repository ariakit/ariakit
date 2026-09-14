import { cv, cx } from "clava";
import { getSpacingValue } from "../utils/styles.ts";
import { button } from "./button.ts";
import { frame, frameBase, frameBleed } from "./frame.ts";
import { layer } from "./layer.ts";

export type ShellWidth = string | number;

/**
 * The widths of the two sidebar slots on one side, from the shell's edge
 * inward. Numbers scale the spacing token.
 */
export type ShellWidthPair = readonly [ShellWidth, ShellWidth];

function isWidthPair(
  value: ShellWidth | ShellWidthPair,
): value is ShellWidthPair {
  return typeof value === "object";
}

/**
 * Resolves a side's width prop to its slot tokens. A single width sets the slot
 * next to the shell's edge; a pair sets both slots on that side in the order
 * the sidebars are written.
 */
function getSlotWidthStyle(
  side: "start" | "end",
  value?: ShellWidth | ShellWidthPair,
) {
  if (value == null) return;
  const [first, second] = isWidthPair(value) ? value : [value];
  const style: Record<`--${string}`, string> = {
    [`--shell-${side}-1-width`]: getSpacingValue(first),
  };
  if (second != null) {
    style[`--shell-${side}-2-width`] = getSpacingValue(second);
  }
  return { style };
}

/**
 * The page shell: one grid with two sidebar tracks on each side of a flexible
 * main track, and a header row, a main row and a footer row. Empty tracks are
 * zero wide, so a shell with two parts costs nothing for the parts it does not
 * have. Parts place themselves by kind and side, not by DOM order.
 *
 * The root declares the geometry once: a shared sidebar width, one width per
 * sidebar slot, the header height and the motion tokens. Every part reads them,
 * and the main area uses the slot widths to keep its content column on the
 * shell's center whatever the sidebars are doing. The defaults are classes, so
 * a container rule can move them; caller values go to the style attribute,
 * where they outrank the defaults.
 *
 * The shell scrolls with the page, and only with the page, so anchors,
 * find-in-page and scroll restoration behave.
 */
export const shell = cv({
  extend: [layer],
  class: [
    // The backdrop of an overlay sidebar is positioned against the root, the
    // drawer slides out of view under the root's clipped edge, and the
    // isolation keeps the chrome's z-index ladder below Ariakit's overlays.
    "shell relative isolate grid overflow-x-clip @container/shell",
    // Container units fall back to the small viewport without a size
    // container, so a page-scroll shell is at least one viewport tall.
    "min-h-[100cqb]",
    "grid-cols-[[shell-start]_auto_auto_[main-start]_minmax(0,1fr)_[main-end]_auto_auto_[shell-end]]",
    "grid-rows-[[shell-start_header-start]_auto_[header-end_main-start]_minmax(0,1fr)_[main-end_footer-start]_auto_[footer-end_shell-end]]",
    // The geometry tokens. The width tokens are registered lengths (see
    // ui.css), so an em width is computed here, on the shell, and each slot
    // defaults to the shared width.
    "[--shell-sidebar-width:16rem]",
    "[--shell-start-1-width:var(--shell-sidebar-width)]",
    "[--shell-start-2-width:var(--shell-sidebar-width)]",
    "[--shell-end-1-width:var(--shell-sidebar-width)]",
    "[--shell-end-2-width:var(--shell-sidebar-width)]",
    "[--shell-header-height:3.25rem]",
    "[--shell-main-max-width:48rem] [--shell-gutter:1.5rem]",
    // Every shell motion runs on one duration and easing through the motion
    // multiplier, which reduced motion zeroes here. An inline duration from
    // $duration still goes through the multiplier, so it cannot defeat the
    // preference.
    "[--shell-duration:300ms] [--shell-motion:1] motion-reduce:[--shell-motion:0]",
    "[--shell-time:calc(var(--shell-duration)*var(--shell-motion))]",
    "[--shell-ease:cubic-bezier(0.2,0,0,1)]",
    // The height a sticky header takes from the top of the viewport, which
    // sticky sidebar bodies and anchors in main read. Zero unless the header
    // says it is sticky.
    "[--shell-header-offset:0px]",
    "[&:has(>.shell-header[data-sticky])]:[--shell-header-offset:var(--shell-header-height)]",
    // A nested shell takes the main cell of the shell around it. The shared
    // tokens are inherited explicitly, because the defaults above are
    // re-declared on every shell; the four slot widths are not, so an outer
    // panel never sizes an inner drawer.
    "[.shell>&]:col-[main] [.shell>&]:row-[main] [.shell>&]:min-h-0",
    "[.shell>&]:[--shell-sidebar-width:inherit]",
    "[.shell>&]:[--shell-header-height:inherit]",
    "[.shell>&]:[--shell-duration:inherit] [.shell>&]:[--shell-motion:inherit]",
    "[.shell>&]:[--shell-ease:inherit]",
    "[.shell>&]:[--shell-main-max-width:inherit] [.shell>&]:[--shell-gutter:inherit]",
    // Print releases the viewport minimum and the clipping, so the page flows.
    "print:h-auto print:min-h-0 print:overflow-visible",
  ],
  variants: {
    /**
     * Sets the default width of every sidebar slot. Numbers scale the spacing
     * token, which is em-based, so a shell that must not follow its font size
     * passes a rem string. A percentage is not a length and is rejected.
     */
    $sidebarWidth(value?: ShellWidth) {
      if (value == null) return;
      return { style: { "--shell-sidebar-width": getSpacingValue(value) } };
    },
    /**
     * Sets the width of the start slots. A single width sets the outermost
     * slot, the one at the shell's start edge; a pair sets that slot and the
     * inner one next to main, in the order the sidebars are written.
     */
    $startWidth(value?: ShellWidth | ShellWidthPair) {
      return getSlotWidthStyle("start", value);
    },
    /**
     * Sets the width of the end slots. A single width sets the slot next to
     * main; a pair sets that slot and the outermost one, in the order the
     * sidebars are written.
     */
    $endWidth(value?: ShellWidth | ShellWidthPair) {
      return getSlotWidthStyle("end", value);
    },
    /**
     * Sets the header height token, which the header uses as its minimum height
     * and which sticky sidebar bodies and anchors in main read as the space a
     * sticky header takes. A header taller than the token, one whose parts
     * wrap, hides that much of a sticky sidebar body, so set the token to the
     * taller height in the same container rule. Numbers scale the spacing
     * token.
     */
    $headerHeight(value?: ShellWidth) {
      if (value == null) return;
      return { style: { "--shell-header-height": getSpacingValue(value) } };
    },
    /**
     * Sets the duration of every motion in the shell: the drawer, the main
     * area's compensation and the overlay backdrop. Numbers are milliseconds.
     * Zero switches the motion off. Reduced motion always switches it off.
     */
    $duration(value?: string | number) {
      if (value == null) return;
      const duration = typeof value === "number" ? `${value}ms` : value;
      return { style: { "--shell-duration": duration } };
    },
  },
  defaultVariants: {
    // The root keeps the page's color context for its parts and paints nothing
    // of its own.
    $layer: "transparent",
  },
});

/**
 * The shared geometry of the header and the footer: three columns, with the
 * center part on the bar's middle while both sides fit and moved over when a
 * side needs more than its half. A bare `1fr` is `minmax(auto, 1fr)`, so each
 * side keeps its content minimum. The inline padding is the shell gutter or the
 * device's safe area, whichever is larger; the insets are physical, so the bars
 * use physical padding here and stay logical everywhere else.
 */
const bar = cx(
  "col-[shell] grid grid-cols-[1fr_auto_1fr] items-center gap-2",
  "pl-[max(var(--shell-gutter),env(safe-area-inset-left))]",
  "pr-[max(var(--shell-gutter),env(safe-area-inset-right))]",
  // A growing center part takes a double share of the leftover, so it grows
  // while staying centered as long as both sides fit in a quarter of the bar.
  // The part announces it with data-grow, which the React component sets.
  "[&:has(>.shell-bar-center[data-grow])]:grid-cols-[1fr_minmax(auto,2fr)_1fr]",
);

/**
 * The translucent surface behind a blur step, chosen so that bar text stays
 * above a 7:1 contrast over any backdrop in either theme. Where backdrop
 * filters are unsupported or reduced transparency is requested, the opaque
 * layer color returns. The layer utility paints the opaque color first, and
 * these sort after it.
 */
const blurFallback = cx(
  "supports-[not(backdrop-filter:blur(1px))]:bg-(--ak-layer)",
  "[@media(prefers-reduced-transparency:reduce)]:bg-(--ak-layer)",
);

const blurSteps = {
  sm: "backdrop-blur-sm bg-[color-mix(in_oklab,var(--ak-layer)_85%,transparent)]",
  md: "backdrop-blur-md bg-[color-mix(in_oklab,var(--ak-layer)_80%,transparent)]",
  lg: "backdrop-blur-lg bg-[color-mix(in_oklab,var(--ak-layer)_75%,transparent)]",
};

export type ShellBlurValue = keyof typeof blurSteps;

/** Resolves a `$blur` value to its step, with `true` meaning the middle one. */
export function getShellBlurStep(value?: boolean | ShellBlurValue) {
  if (!value) return;
  if (value === true) return "md";
  return value;
}

/**
 * Blurs the page behind the bar. Each step bundles Tailwind's backdrop blur of
 * that size with a translucent surface, and restores the opaque surface where
 * backdrop filters are unsupported or reduced transparency is requested. A
 * backdrop filter creates a stacking context and a containing block for fixed
 * descendants, and nested backdrop filters do not compose.
 */
function getBlurClass(value?: boolean | ShellBlurValue) {
  const step = getShellBlurStep(value);
  if (!step) return;
  return [blurSteps[step], blurFallback];
}

export const shellHeader = cv({
  extend: [frame],
  class: [
    bar,
    // The bar is a query container for its own parts. Its minimum height is
    // the token that the rest of the shell reads as the header's height.
    "shell-header row-[header] min-h-(--shell-header-height) @container/shell-header",
    // A real border on the edge facing main, because shadows vanish in forced
    // colors. Above the sidebars and the footer, so a sticky header covers a
    // sticky sidebar body scrolling under it.
    "border-be z-4",
  ],
  variants: {
    /**
     * Keeps the header in view while its row is in view. It keeps its space, so
     * nothing flows under it. Defaults to `true`.
     */
    $sticky: "sticky inset-bs-0",
    /**
     * Blurs the page behind the bar: `"sm"`, `"md"` or `"lg"`, with `true`
     * meaning `"md"`. Each step bundles the blur radius with a translucent
     * surface, and falls back to the opaque surface where backdrop filters are
     * unsupported or reduced transparency is requested.
     */
    $blur(value?: boolean | ShellBlurValue) {
      return getBlurClass(value);
    },
    /**
     * Moves the center part to a second row spanning the bar when the bar's
     * content is narrower than 40rem. A stacked bar is taller than its height
     * token, so set `$headerHeight` to the stacked height in the same container
     * rule.
     */
    $stackCenter: [
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:col-span-full",
      "@max-[40rem]/shell-header:[&>.shell-bar-center]:row-start-2",
    ],
  },
  defaultVariants: {
    $sticky: true,
    // The gutters come from the bar's own inline padding.
    $p: "none",
    // Half a step off the canvas, like the sidebars and the footer.
    $lightnessOffset: 0.5,
  },
});

/**
 * A bar part: a flex cell that keeps its content minimum by default, so the
 * center part sits on the bar's middle while both sides fit and moves over when
 * a side needs more than its half.
 */
const barPart = cx("flex items-center gap-2");

/**
 * Lets a part lose width. The cap to the track is required, or the part keeps
 * its content width and paints over its neighbor. Text children truncate with
 * the `truncate` utility; a form control keeps its intrinsic minimum unless it
 * gets `min-w-0` or a width. The clip margin keeps focus rings visible; WebKit
 * does not support it, and there the ring is clipped at the part's edge. This
 * is not a way to hide controls: a clipped control cannot be scrolled back into
 * view, and a bar that must drop buttons needs an overflow menu.
 */
const shrink = {
  true: "max-w-full box-border min-w-0 overflow-clip [overflow-clip-margin:0.25rem]",
  false: "min-w-auto",
};

export const shellHeaderStart = cv({
  class: [barPart, "shell-bar-start col-1"],
  variants: {
    /**
     * Lets the part lose width instead of pushing the center part over. Its
     * text children truncate with the `truncate` utility.
     */
    $shrink: shrink,
    /**
     * Fills the part's track instead of sitting at its edge.
     */
    $grow: { true: "justify-self-stretch", false: "justify-self-start" },
  },
});

export const shellHeaderCenter = cv({
  class: [barPart, "shell-bar-center col-2"],
  variants: {
    /**
     * Lets the part lose width. Paired with `$grow`, the bar becomes a fixed
     * one-two-one split in which the center truncates while the sides still
     * have room, so avoid that pair.
     */
    $shrink: shrink,
    /**
     * Takes a double share of the bar's leftover width, growing while staying
     * centered as long as both sides fit in a quarter of the bar. Beside a very
     * wide side part it sits further off center than a plain part; `$shrink` on
     * both sides keeps it exactly centered.
     */
    $grow: { true: "justify-self-stretch", false: "justify-self-center" },
  },
});

export const shellHeaderEnd = cv({
  class: [barPart, "shell-bar-end col-3"],
  variants: {
    /**
     * Lets the part lose width instead of pushing the center part over. Its
     * text children truncate with the `truncate` utility.
     */
    $shrink: shrink,
    /**
     * Fills the part's track instead of sitting at its edge.
     */
    $grow: { true: "justify-self-stretch", false: "justify-self-end" },
  },
});

export const shellFooter = cv({
  extend: [frame],
  class: [
    bar,
    // Always static and as tall as its content: a sticky sidebar body may
    // never leave its column, which ends where the footer row begins, so a
    // footer of any height pushes the body up on its own.
    "shell-footer row-[footer] @container/shell-footer",
    "border-bs z-3",
    "pb-[env(safe-area-inset-bottom)]",
  ],
  variants: {
    /**
     * Blurs the page behind the bar: `"sm"`, `"md"` or `"lg"`, with `true`
     * meaning `"md"`. Each step bundles the blur radius with a translucent
     * surface, and falls back to the opaque surface where backdrop filters are
     * unsupported or reduced transparency is requested.
     */
    $blur(value?: boolean | ShellBlurValue) {
      return getBlurClass(value);
    },
  },
  defaultVariants: {
    $p: "none",
    $lightnessOffset: 0.5,
  },
});

export const shellFooterStart = shellHeaderStart;
export const shellFooterCenter = shellHeaderCenter;
export const shellFooterEnd = shellHeaderEnd;

/**
 * The rules that put a sidebar column in overlay mode: the column reserves
 * nothing and stays open so the body can slide inside it, floating over main
 * from the zero-width column, above the bars so the backdrop dims them too. The
 * flag is what the backdrop and the body read through container style queries,
 * and what the React component reads to swap the body into a modal dialog. The
 * important border reset wins over the side border, which has the same
 * specificity and can sort after it.
 */
const overlay = cx(
  "[--shell-overlay:1] z-5 w-0 overflow-visible bg-transparent border-x-0!",
);

/**
 * The same rules under a container query on the shell's width, so an outer
 * sidebar can make an inner shell narrow without the window changing. The steps
 * follow Tailwind's breakpoint scale. Container query sizes cannot use custom
 * properties, so each step is written out, here and again in the slot flags of
 * main, which the recipe test holds to one table.
 */
const overlayBelow = {
  none: "",
  sm: cx(
    "@max-[40rem]/shell:[--shell-overlay:1] @max-[40rem]/shell:z-5",
    "@max-[40rem]/shell:w-0 @max-[40rem]/shell:overflow-visible",
    "@max-[40rem]/shell:bg-transparent @max-[40rem]/shell:border-x-0!",
  ),
  md: cx(
    "@max-[48rem]/shell:[--shell-overlay:1] @max-[48rem]/shell:z-5",
    "@max-[48rem]/shell:w-0 @max-[48rem]/shell:overflow-visible",
    "@max-[48rem]/shell:bg-transparent @max-[48rem]/shell:border-x-0!",
  ),
  lg: cx(
    "@max-[64rem]/shell:[--shell-overlay:1] @max-[64rem]/shell:z-5",
    "@max-[64rem]/shell:w-0 @max-[64rem]/shell:overflow-visible",
    "@max-[64rem]/shell:bg-transparent @max-[64rem]/shell:border-x-0!",
  ),
};

export type ShellOverlayBelowValue = keyof typeof overlayBelow;

/**
 * A sidebar: a column that the grid sizes and that animates its width, with two
 * children: a backdrop, painted only in overlay mode, and a body that keeps the
 * full width, scrolls on its own and sticks below the header. Closing the
 * sidebar folds the column to zero while the body stays glued to the edge next
 * to main, so the panel slides out under the shell's edge.
 *
 * The column is never `display: none`, so a state change transitions and a
 * first render does not. It is not positioned: the backdrop inside it is
 * positioned against the shell root, and container units inside the column
 * would resolve against the column's own zero width in overlay mode.
 *
 * The React component sets `data-side`, `data-open`, `data-sticky`,
 * `data-overlay` and `data-overlay-below` on the column; static markup declares
 * them itself. The selectors here and in the main recipe read them.
 */
export const shellSidebar = cv({
  extend: [frame],
  class: [
    "shell-sidebar row-[main] flex flex-col box-border @container/shell-sidebar",
    // The width folds on the shell's duration. No visibility here: the body
    // hides itself once the motion ends, in both modes.
    "transition-[width] duration-(--shell-time) ease-(--shell-ease)",
    // Closed, the column reserves nothing and drops its border. The state
    // selector outranks the width and the border of the open column.
    "ui-closed:w-0 ui-closed:border-x-0",
  ],
  variants: {
    /**
     * The side of the shell the sidebar sits on. Among sidebars on the same
     * side, DOM order is the visual order from the shell's edge: the first
     * start sidebar sits at the edge, the first end sidebar sits next to main.
     * A sibling's `data-side` says which slot this one takes.
     */
    $side: {
      start: [
        "col-1 border-e",
        "[--shell-slot-width:var(--shell-start-1-width)]",
        "[.shell-sidebar[data-side=start]~&]:col-2",
        "[.shell-sidebar[data-side=start]~&]:[--shell-slot-width:var(--shell-start-2-width)]",
      ],
      end: [
        "col-4 border-s",
        "[--shell-slot-width:var(--shell-end-1-width)]",
        "[.shell-sidebar[data-side=end]~&]:col-5",
        "[.shell-sidebar[data-side=end]~&]:[--shell-slot-width:var(--shell-end-2-width)]",
      ],
    },
    /**
     * Keeps the body in view below a sticky header while the column is in view.
     * A static footer of any height pushes it up at the end of the page.
     * Defaults to `true`.
     */
    $sticky: [
      "[&>.shell-sidebar-body]:sticky",
      "[&>.shell-sidebar-body]:inset-bs-(--shell-header-offset)",
      "[&>.shell-sidebar-body]:max-h-[calc(100cqb-var(--shell-header-offset))]",
    ],
    /**
     * Puts the sidebar in overlay mode at every width: the column reserves no
     * space, the body floats over main and a backdrop covers the shell. With
     * JavaScript, the body is a modal dialog. The inline column's width,
     * clipping and stacking live in the same variant, so each render emits one
     * rule for each and the overlay rules never compete with them.
     */
    $overlay: {
      true: overlay,
      // Clip rather than hide: hidden would make the column a scroll container
      // and kill the sticky body.
      false: "z-2 w-(--shell-slot-width) overflow-clip",
    },
    /**
     * Puts the sidebar in overlay mode when the shell is narrower than a step
     * of Tailwind's breakpoint scale: `"sm"` (40rem), `"md"` (48rem) or `"lg"`
     * (64rem). The step is a container query on the shell, not on the window.
     * `"none"` keeps the sidebar inline at every width. Defaults to `"md"`.
     */
    $overlayBelow: overlayBelow,
  },
  defaultVariants: {
    $side: "start",
    $sticky: true,
    $overlayBelow: "md",
    // The body brings the padding.
    $p: "none",
    $lightnessOffset: 0.5,
  },
});

/**
 * The backdrop of an overlay sidebar, the body's previous sibling. Positioned
 * against the shell root, so it covers the whole shell, header included, and
 * painted only while the column is in overlay mode. The React component renders
 * it through the Dialog's `backdrop` prop, so a click on it closes the drawer;
 * it overrides the fixed position Ariakit writes inline.
 */
export const shellSidebarBackdrop = cv({
  class: [
    "shell-sidebar-backdrop hidden absolute inset-0 bg-black/45",
    // It fades on the shell's duration and hides once the fade ends. The
    // visibility flip has no duration of its own: it waits out the fade when
    // hiding and lands at once when showing, so the backdrop is never hidden
    // at the first frame of an opening.
    "invisible opacity-0",
    "transition-[opacity,visibility] ease-(--shell-ease)",
    "[transition-duration:var(--shell-time),0s]",
    "[transition-delay:0s,var(--shell-time)]",
    "[@container_style(--shell-overlay:_1)]:block",
    "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-open]>&]:visible",
    "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-open]>&]:opacity-100",
    "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-open]>&]:[transition-delay:0s,0s]",
    // Under the same container query as the rule that shows it, so it sorts
    // after that rule: a plain print rule would lose to it.
    "[@container_style(--shell-overlay:_1)]:print:hidden",
  ],
});

/**
 * The body of a sidebar: the element that scrolls, sticks below the header and,
 * in overlay mode, becomes the dialog. It keeps the slot's full width while the
 * column folds, so nothing reflows, glued to the edge next to main. Once the
 * fold ends it is hidden, which takes its content out of the tab order and the
 * accessibility tree.
 *
 * The transition is declared for both modes, and only the animated values
 * change with state: Ariakit detects the leave animation of the dialog from the
 * computed transition duration.
 */
export const shellSidebarBody = cv({
  extend: [frameBase],
  class: [
    "shell-sidebar-body box-border w-(--shell-slot-width) min-h-0 flex-auto",
    "overflow-y-auto overscroll-contain",
    "[.shell-sidebar[data-side=start]>&]:ms-auto",
    "[.shell-sidebar[data-side=end]>&]:me-auto",
    // The visibility flip has no duration of its own: it waits out the motion
    // when hiding and lands at once when showing. A duration there would keep
    // the body hidden for the first frame of an opening, when the dialog moves
    // focus into it.
    "transition-[translate,visibility] ease-(--shell-ease)",
    "[transition-duration:var(--shell-time),0s]",
    "[transition-delay:0s,var(--shell-time)]",
    "[.shell-sidebar[data-open]>&]:[transition-delay:0s,0s]",
    "[.shell-sidebar:not([data-open])>&]:invisible",
    // Overlay mode, read from the column's flag: the body floats over main
    // with sticky positioning inside the zero-width column, paints the
    // column's layer with a shadow, and slides from its edge. The end side
    // pulls the body back over main by its own width.
    "[@container_style(--shell-overlay:_1)]:sticky",
    "[@container_style(--shell-overlay:_1)]:inset-bs-(--shell-header-offset)",
    "[@container_style(--shell-overlay:_1)]:max-h-[calc(100cqb-var(--shell-header-offset))]",
    "[@container_style(--shell-overlay:_1)]:bg-(--ak-layer)",
    "[@container_style(--shell-overlay:_1)]:shadow-[0_0_0_1px_var(--ak-edge),0_24px_48px_-12px_rgb(0_0_0/0.5)]",
    "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-side=end]>&]:-ms-(--shell-slot-width)",
    "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-side=start]:not([data-open])>&]:-translate-x-full",
    "[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-side=end]:not([data-open])>&]:translate-x-full",
    // Right to left mirrors the slide. The variant adds no specificity, and
    // sorts after the rules above.
    "rtl:[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-side=start]:not([data-open])>&]:translate-x-full",
    "rtl:[@container_style(--shell-overlay:_1)]:[.shell-sidebar[data-side=end]:not([data-open])>&]:-translate-x-full",
    // An overlay drawer is chrome, not content.
    "[@container_style(--shell-overlay:_1)]:print:hidden",
  ],
  defaultVariants: {
    $p: 4,
  },
});

/**
 * The button that opens and closes a sidebar. An Ariakit Disclosure, so it gets
 * `aria-expanded`, the link to the sidebar body and the focus return when the
 * drawer closes. With no children, or only nullish or boolean ones, it renders
 * an icon and names itself "Toggle sidebar".
 */
export const shellSidebarToggle = cv({
  extend: [button],
});

/**
 * The flags main reads to know which slot takes space, from `:has()` chains on
 * the shell: 1 when the slot's sidebar is open and takes space, 0 when it is
 * closed, absent or an overlay. The setters sit in `:where()` and the overlay
 * overrides repeat the full chain, so the overrides win by specificity
 * regardless of order. An overlay below a step is overridden under the same
 * container query as the sidebar's own rules.
 */
const slotFlags = cx(
  // The first start sidebar: not preceded by another start sidebar.
  "[.shell:where(:has(>.shell-sidebar[data-side=start][data-open]:not(.shell-sidebar[data-side=start]~*)))>&]:[--shell-start-1-open:1]",
  "[.shell:has(>.shell-sidebar[data-side=start][data-overlay]:not(.shell-sidebar[data-side=start]~*))>&]:[--shell-start-1-open:0]",
  "@max-[40rem]/shell:[.shell:has(>.shell-sidebar[data-side=start][data-overlay-below=sm]:not(.shell-sidebar[data-side=start]~*))>&]:[--shell-start-1-open:0]",
  "@max-[48rem]/shell:[.shell:has(>.shell-sidebar[data-side=start][data-overlay-below=md]:not(.shell-sidebar[data-side=start]~*))>&]:[--shell-start-1-open:0]",
  "@max-[64rem]/shell:[.shell:has(>.shell-sidebar[data-side=start][data-overlay-below=lg]:not(.shell-sidebar[data-side=start]~*))>&]:[--shell-start-1-open:0]",
  // The second start sidebar: preceded by another start sidebar.
  "[.shell:where(:has(>.shell-sidebar[data-side=start]~.shell-sidebar[data-side=start][data-open]))>&]:[--shell-start-2-open:1]",
  "[.shell:has(>.shell-sidebar[data-side=start]~.shell-sidebar[data-side=start][data-overlay])>&]:[--shell-start-2-open:0]",
  "@max-[40rem]/shell:[.shell:has(>.shell-sidebar[data-side=start]~.shell-sidebar[data-side=start][data-overlay-below=sm])>&]:[--shell-start-2-open:0]",
  "@max-[48rem]/shell:[.shell:has(>.shell-sidebar[data-side=start]~.shell-sidebar[data-side=start][data-overlay-below=md])>&]:[--shell-start-2-open:0]",
  "@max-[64rem]/shell:[.shell:has(>.shell-sidebar[data-side=start]~.shell-sidebar[data-side=start][data-overlay-below=lg])>&]:[--shell-start-2-open:0]",
  // The first end sidebar, next to main.
  "[.shell:where(:has(>.shell-sidebar[data-side=end][data-open]:not(.shell-sidebar[data-side=end]~*)))>&]:[--shell-end-1-open:1]",
  "[.shell:has(>.shell-sidebar[data-side=end][data-overlay]:not(.shell-sidebar[data-side=end]~*))>&]:[--shell-end-1-open:0]",
  "@max-[40rem]/shell:[.shell:has(>.shell-sidebar[data-side=end][data-overlay-below=sm]:not(.shell-sidebar[data-side=end]~*))>&]:[--shell-end-1-open:0]",
  "@max-[48rem]/shell:[.shell:has(>.shell-sidebar[data-side=end][data-overlay-below=md]:not(.shell-sidebar[data-side=end]~*))>&]:[--shell-end-1-open:0]",
  "@max-[64rem]/shell:[.shell:has(>.shell-sidebar[data-side=end][data-overlay-below=lg]:not(.shell-sidebar[data-side=end]~*))>&]:[--shell-end-1-open:0]",
  // The second end sidebar, at the shell's end edge.
  "[.shell:where(:has(>.shell-sidebar[data-side=end]~.shell-sidebar[data-side=end][data-open]))>&]:[--shell-end-2-open:1]",
  "[.shell:has(>.shell-sidebar[data-side=end]~.shell-sidebar[data-side=end][data-overlay])>&]:[--shell-end-2-open:0]",
  "@max-[40rem]/shell:[.shell:has(>.shell-sidebar[data-side=end]~.shell-sidebar[data-side=end][data-overlay-below=sm])>&]:[--shell-end-2-open:0]",
  "@max-[48rem]/shell:[.shell:has(>.shell-sidebar[data-side=end]~.shell-sidebar[data-side=end][data-overlay-below=md])>&]:[--shell-end-2-open:0]",
  "@max-[64rem]/shell:[.shell:has(>.shell-sidebar[data-side=end]~.shell-sidebar[data-side=end][data-overlay-below=lg])>&]:[--shell-end-2-open:0]",
);

/**
 * The gutter track of a centered main: at least the gutter, at most the free
 * space beyond the content's maximum width, and in between the gutter plus the
 * compensation for the other side's sidebars. The tracks are `auto`, which the
 * grid stretches by equal amounts, so the offset between them survives; `1fr`
 * gutters would collapse it. Below the width that fits everything, the
 * compensation gives way first and the content column keeps its width.
 */
const compensation = cx(
  // The space each slot takes, transitioned on the shell's duration. Only a
  // centered main reads them, so only a centered main animates them.
  "[--shell-start-1-space:calc(var(--shell-start-1-width)*var(--shell-start-1-open))]",
  "[--shell-start-2-space:calc(var(--shell-start-2-width)*var(--shell-start-2-open))]",
  "[--shell-end-1-space:calc(var(--shell-end-1-width)*var(--shell-end-1-open))]",
  "[--shell-end-2-space:calc(var(--shell-end-2-width)*var(--shell-end-2-open))]",
  "transition-[--shell-start-1-space,--shell-start-2-space,--shell-end-1-space,--shell-end-2-space]",
  "duration-(--shell-time) ease-(--shell-ease)",
  // Each space is clamped at zero when the sides are summed: an overshooting
  // easing can take a length below zero while the column stops at zero.
  "[--shell-start-total:calc(max(0px,var(--shell-start-1-space))+max(0px,var(--shell-start-2-space)))]",
  "[--shell-end-total:calc(max(0px,var(--shell-end-1-space))+max(0px,var(--shell-end-2-space)))]",
  "[--shell-comp-end:max(0px,calc(var(--shell-start-total)-var(--shell-end-total)))]",
  "[--shell-comp-start:max(0px,calc(var(--shell-end-total)-var(--shell-start-total)))]",
);

const centered =
  "grid-cols-[[full-start]_minmax(clamp(var(--shell-gutter),calc(100%-var(--shell-main-max-width)-var(--shell-gutter)),calc(var(--shell-gutter)+var(--shell-comp-start))),auto)_[content-start]_minmax(0,var(--shell-main-max-width))_[content-end]_minmax(clamp(var(--shell-gutter),calc(100%-var(--shell-main-max-width)-var(--shell-gutter)),calc(var(--shell-gutter)+var(--shell-comp-end))),auto)_[full-end]]";

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
export const shellMain = cv({
  extend: [frameBase],
  class: [
    "shell-main col-[main] row-[main] @container/shell-main",
    "grid content-start justify-stretch min-w-0 py-(--shell-gutter)",
    // The slot flags are declared here, so a nested shell's main never
    // inherits an outer shell's flags.
    "[--shell-start-1-open:0] [--shell-start-2-open:0]",
    "[--shell-end-1-open:0] [--shell-end-2-open:0]",
    slotFlags,
    "[&>*]:col-[content] [&>*]:min-w-0",
    // A fragment link lands below a sticky header.
    "[&_[id]]:[scroll-margin-block-start:calc(var(--shell-header-offset)+1rem)]",
  ],
  variants: {
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
        "grid-cols-[[full-start]_var(--shell-gutter)_[content-start]_minmax(0,1fr)_[content-end]_var(--shell-gutter)_[full-end]]",
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
     * Sets the minimum space beside the content column, which is also main's
     * padding above and below it. Numbers scale the spacing token. Defaults to
     * 1.5rem.
     */
    $gutter(value?: ShellWidth) {
      if (value == null) return;
      return { style: { "--shell-gutter": getSpacingValue(value) } };
    },
  },
  defaultVariants: {
    // Main paints nothing and pads itself through the gutter.
    $p: "none",
  },
});

/**
 * A direct child of main that spans the gutters. Inline-size containment keeps
 * a wide table or an embedded shell from stretching the gutter tracks. Both
 * rules apply only there; anywhere else the element keeps its content size. The
 * `$bleed` variant on `Frame` does the same.
 */
export const shellBleed = cv({
  class: frameBleed,
});
