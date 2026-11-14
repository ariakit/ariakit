import { cv, cx } from "clava";
import { focus } from "./focus.ts";
import { frame } from "./frame.ts";
import { tab, tabList, tabPanels, tabSeparator, tabs } from "./tabs.ts";
import { text } from "./text.ts";

// The block fits in the scroll area around it, between its sticky bars, which a
// shell, a dialog, or a popover publishes. Without a height, it fits on the
// screen, or in a size container. Outside one, cqb is the small viewport, so
// the dynamic viewport follows mobile browser bars instead. The space at each
// end is larger than the scroll margin, so a block that scrolls into view fits.
const scrollportHeight = cx(
  "[--code-block-scrollport:var(--scrollport-height,100dvh)]",
  "[@container_(min-height:0px)]:[--code-block-scrollport:var(--scrollport-height,100cqb)]",
  "scroll-mbs-[calc(var(--scrollport-start,0px)+--spacing(3))]",
  "scroll-mbe-[calc(var(--scrollport-end,0px)+--spacing(3))]",
  "[--code-block-max-height:min(var(--code-block-scrollport)-var(--scrollport-start,0px)-var(--scrollport-end,0px)-(--spacing(8)),60rem)]",
);

/**
 * A block of code with the geometry of tabs: a header with a selected folder
 * tab joins the code below it. Put a `codeBlockHeader` first for a title or
 * file tabs, or a `tabListCarousel` around file tabs that scroll, and then one
 * or more `codeBlockCode` parts. A static block, with a title or no header,
 * shows only the edges of the title and the code. A `codeBlockCopy` after the
 * code floats in its top end corner. A `codeBlockExpand` covers collapsed code,
 * and a `codeBlockCollapse` goes in a row under expanded code.
 */
export const codeBlock = cv({
  extend: [tabs],
  class: [
    "code-block",
    // One column, where the copy button and the expand button share the row of
    // the code. The code goes below a header, and the collapse row below the
    // code. The code takes the height that the other rows leave, so it scrolls
    // inside when the block reaches its maximum height. File tabs that scroll
    // are in a carousel, which takes the row of the header.
    "grid grid-cols-1 [&>*]:col-start-1",
    "grid-rows-[minmax(0,1fr)_auto]",
    "has-[>.code-block-header,>.tab-list-carousel]:grid-rows-[auto_minmax(0,1fr)_auto]",
    "[&>.code-block-header,&>.tab-list-carousel]:row-start-1",
    "[&>.code-block-code]:row-start-1",
    "[&>.code-block-header~.code-block-code,&>.tab-list-carousel~.code-block-code]:row-start-2",
    // The space around the copy button: the padding of the block, or a
    // little space when the block has none, so the button never touches the
    // edge.
    "[--code-block-copy-gap:max(var(--tabs-padding),--spacing(1))]",
    scrollportHeight,
  ],
  variants: {
    /**
     * Limits the height of the block, and the code scrolls down inside. The
     * header and the collapse row keep their height. `true` fits the block in
     * the scroll area around it, between its sticky bars, up to `60rem`: the
     * screen below the sticky bars of a shell, or a scroll area that publishes
     * `--scrollport-height`, `--scrollport-start`, and `--scrollport-end`, such
     * as a dialog or a popover. A string sets another limit, and `false` shows
     * all lines. A block whose code wraps has no limit, because wrapped code is
     * not a tab stop, and keyboard users couldn't scroll it down.
     * @default true
     */
    $maxHeight(value?: string | boolean) {
      if (value == null) return;
      if (value === false) return;
      const limit =
        "not-has-[>.code-block-wrap:not([hidden])]:max-h-(--code-block-max-height)";
      if (value === true) return limit;
      return { class: limit, style: { "--code-block-max-height": value } };
    },
  },
  defaultVariants: {
    $maxHeight: true,
    // The block keeps the layer around it instead of a darker strip color, so
    // the strip and the copy, expand, and collapse buttons stand on the page.
    $layer: "transparent",
    // The tabs or the title and the code keep their edges and seams, but not
    // the block around them.
    $outerEdge: false,
  },
});

/**
 * The strip above the code for a title or file tabs. The strip of a static
 * header is transparent, so the title stands on the page above the code.
 */
export const codeBlockHeader = cv({
  extend: [tabList],
  class: [
    "code-block-header",
    // The strip paints the color of the well, and the title keeps its own
    // layer.
    "not-[[role=tablist]]:[--well-color:transparent]",
  ],
});

// The folder of a file tab or a title. It's half a step lighter than the page,
// like the code below it, and its text is a bit smaller than the code.
const codeBlockFolder = cv({
  extend: [tab],
  class: ["font-sans"],
  defaultVariants: {
    $lighten: 0.5,
    // A number scales with the code in larger or smaller text. Like the code,
    // it keeps its own line ratio, the one of text-sm, so a parent with a
    // taller line, such as prose, doesn't make the header taller.
    $size: 0.875,
    $leading: 20 / 14,
  },
});

/**
 * A folder tab in the header for a file. It's half a step lighter than the
 * page, like the code below it. It has the text size of a title, and more
 * padding for a larger hit area.
 */
export const codeBlockTab = cv({
  extend: [codeBlockFolder],
  defaultVariants: {
    // Like the padding of a folder tab, half a spacing step larger. Padding on
    // the block makes the strip only a little taller, as it does for tabs.
    $p(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      return "round(max(var(--spacing) * 1.5, var(--spacing) * 2.5 - var(--tabs-float, 0px)), 1px)";
    },
  },
});

/**
 * A pipe between file tabs, as tall as the text, so it stays clear of the tab
 * edges. It hides next to the selected, hovered, or focused tab, whose surface
 * would touch it.
 */
export const codeBlockTabSeparator = tabSeparator;

/**
 * The title or file name in the header. It looks like a selected folder tab,
 * but it's not a tab, so `data-selected="true"` marks it as selected instead of
 * `aria-selected`. It names the scroll area of the code.
 */
export const codeBlockTitle = cv({
  // A title isn't a choice between files, so it keeps the padding of a folder
  // tab, and it's shorter than a file tab.
  extend: [codeBlockFolder],
  class: [
    // A title can shrink, so it stays in the block. Its label truncates.
    "min-w-0 shrink",
    // The text can be selected, like other text on the page, and the pointer
    // doesn't suggest a press.
    "cursor-auto not-[button]:select-text",
  ],
});

/**
 * The frame of the copy button in the top end corner of the code. The button
 * inherits its text size and padding, so it lines up with the first line. The
 * frame has the layer of the code, so the code doesn't show around the button,
 * and code that scrolls under it fades out before the frame. Code is always
 * left to right, so the frame goes on its right, on a right-to-left page too.
 */
export const codeBlockCopy = cv({
  extend: [frame, text],
  class: [
    "code-block-copy flex",
    "[.code-block>&]:row-start-1 [.code-block>&]:z-7",
    "[.code-block>&]:self-start [.code-block>&]:[justify-self:right]",
    // Below a header, the frame goes in the row of the code, and it moves up
    // with the code over the seam. The code also moves up by the edge of the
    // block, which is its own top edge, so the frame stops inside that edge.
    // The header in the selector makes the row win over the first row above.
    "[.code-block>.code-block-header~&,.code-block>.tab-list-carousel~&]:row-start-2",
    "[.code-block>.code-block-header~&,.code-block>.tab-list-carousel~&]:mt-[calc(-1*var(--tabs-notch,0px))]",
    // The button has the gap around it as the padding of the frame, and the
    // rest of the padding of the code as its own padding. With the text of the
    // code, the button is centered on the first line, and the icon lines up
    // with its text.
    "[--code-block-copy-p:calc(round(--spacing(2),1px)-var(--code-block-copy-gap))]",
    // No space below the button, so the frame covers less of the second line.
    "pb-0",
    // Code that scrolls under the frame fades into it, instead of ending at a
    // sharp edge. The fade goes before the frame and lets clicks through. The
    // left corners are square, so the fade meets a straight edge.
    "relative rounded-l-none",
    "before:absolute before:inset-y-0 before:right-full before:w-[1lh]",
    "before:pointer-events-none",
    "before:bg-linear-to-r",
    "before:from-transparent before:to-(--ak-layer)",
  ],
  defaultVariants: {
    // The text of the code.
    $size: 0.9375,
    $leading: 1.7,
    $p: "var(--code-block-copy-gap)",
    // The frame goes in the corner inside the edge of the code, which covers
    // the padding of the block.
    $m: "calc(-1 * var(--tabs-padding))",
    // The layer of the code, half a step lighter than the block, like
    // codeBlockCode.
    $layer: "var(--tabs-layer)",
    $lighten: 0.5,
  },
});

/**
 * The click target over collapsed code, with the expand button in the clear
 * part at the bottom of the fade. A click anywhere on the collapsed code shows
 * all lines, so a pointer over it shows the hover state of the button too.
 */
export const codeBlockExpand = cv({
  class: [
    "code-block-expand flex items-end justify-center pb-1",
    // Over the code, below the copy button.
    "[.code-block>&]:row-start-1 [.code-block>&]:z-2",
    "[.code-block>.code-block-header~&,.code-block>.tab-list-carousel~&]:row-start-2",
    "cursor-pointer hover:*:ak-state-(--hover-offset)",
  ],
});

/**
 * The row under expanded code for the collapse button, with no layer of its
 * own. The code covers the padding and the edge of the block at the bottom, so
 * the row leaves that space above the button too.
 */
export const codeBlockCollapse = cv({
  class: [
    "code-block-collapse flex justify-center",
    "[.code-block>&]:row-start-2",
    "[.code-block>.code-block-header~&,.code-block>.tab-list-carousel~&]:row-start-3",
    "pt-[calc(var(--tabs-padding,0px)+var(--tabs-bordering,0px)+--spacing(2))]",
  ],
});

// Line numbers come from a CSS counter in a gutter at the start of each line,
// so they are never selected or copied. The empty alternative text after the
// slash keeps screen readers from reading them. The gutter hangs before the
// line, so wrapped lines start after it. It takes the width of the largest
// number, plus a gap.
const lineNumbers = cx(
  "[&>code]:[counter-reset:line]",
  "[&_.line]:[counter-increment:line]",
  "[--code-block-gutter:calc(var(--code-block-digits,2)*1ch+2ch)]",
  "[--code-block-start:calc(var(--code-block-px)+var(--code-block-gutter))]",
  "[&_.line]:ps-(--code-block-start) [&_.line]:-indent-(--code-block-start)",
  "[&_.line]:before:inline-block [&_.line]:before:indent-0",
  "[&_.line]:before:w-(--code-block-start) [&_.line]:before:pe-[2ch]",
  "[&_.line]:before:text-end [&_.line]:before:ak-ink-0",
  "[&_.line]:before:select-none",
  "[&_.line]:before:content-[counter(line)_/_'']",
  // The gutter stays in view while the code scrolls sideways. It covers the
  // code that scrolls under it, and it repeats the bar of a marked line.
  "[&_.line]:before:sticky [&_.line]:before:start-0 [&_.line]:before:z-1",
  "[&_.line]:before:bg-(--ak-layer)",
  "[&_.highlighted]:before:shadow-[inset_var(--code-block-bar)_0_var(--ak-edge)]",
);

/**
 * The scroll area of the code, rendered as a `pre` element with the HTML of the
 * lines in a `code` element. It's the panel below the header, half a step
 * lighter than the page. It reads the markup of `highlight`: a `line` class on
 * each line, `highlighted` on marked lines, and `highlighted-word` on marked
 * text. Token colors come from the `--shiki-light` and `--shiki-dark`
 * variables, and follow the layer of each line.
 */
export const codeBlockCode = cv({
  extend: [tabPanels, focus, text],
  class: [
    "code-block-code block min-w-0",
    "tab-2",
    // The frame padding stays at the top and the bottom of the scroll area.
    // The side padding moves to each line, so line backgrounds reach both
    // edges, and the gutter of line numbers can replace it. It's the side
    // padding of textFrame: the frame padding and half the leading around the
    // caps. Glyphs of a monospace font start a bit inside their cell, so a
    // sixth of a character comes off.
    "px-0",
    "[--code-block-px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*0.5-1ch/6)]",
    "[&>code]:block [&>code]:min-w-full",
    // The code is always left to right, but the strip above it follows the
    // page. On a right-to-left page, the start of the strip is on the right, so
    // the top corners that join it swap sides.
    "[.code-block:dir(rtl)>&]:not-first:rounded-tr-[calc(var(--tabs-corner-s)+(var(--tabs-notch,0px)-var(--tabs-corner-s))*var(--tabs-open-s,0))]",
    "[.code-block:dir(rtl)>&]:not-first:rounded-tl-[calc(var(--tabs-corner-e)+(var(--tabs-notch,0px)-var(--tabs-corner-e))*var(--tabs-open-e,0))]",
    // Lines are separated by line feeds, so they stay inline. An empty line
    // still needs the height of a line for its background.
    "[&_.line]:relative [&_.line]:inline-block [&_.line]:min-w-full",
    "[&_.line]:min-h-lh [&_.line]:align-top",
    // Zero specificity, so the gutters of line numbers and prompt signs can
    // replace the start padding.
    "[&_.line]:ui-base:px-(--code-block-px)",
    // The first line leaves room for the frame of a copy button after the
    // code, which is as wide as the line is tall with its padding.
    "[&:has(~.code-block-copy)_.line:first-child]:pe-[calc(var(--code-block-px)+1lh+2*var(--ak-frame-padding))]",
    // Adapt each theme color to the layer of its line, so tokens keep enough
    // contrast on any background. The layer decides which theme applies, not
    // the page color scheme, so a dark block on a light page gets dark colors.
    // Only tokens have a style attribute, not the spans that wrap marked text.
    "[&_.line_span[style]]:ak-text",
    "ak-light:[&_.line_span[style]]:ak-text-color-(--shiki-light)",
    "ak-dark:[&_.line_span[style]]:ak-text-color-(--shiki-dark)",
    // Marked lines are layers, so the tokens on them adapt to their background
    // too. A bar at the start marks them without color alone. Its brand edge
    // keeps 3:1 against the code, or 4.5:1 and a wider bar in high contrast
    // mode.
    "[&_.highlighted]:ak-layer [&_.highlighted]:ak-layer-brand",
    "[&_.highlighted]:ak-layer-mix-15",
    "[&_.highlighted]:ak-edge-brand [&_.highlighted]:ak-edge-raw",
    "[&_.highlighted]:ak-edge-contrast",
    "[--code-block-bar:calc(3px+var(--contrast,0)*0.01px)]",
    "[&_.highlighted]:shadow-[inset_var(--code-block-bar)_0_var(--ak-edge)]",
    // Dotted edges in the brand color mark the top and the bottom of each run
    // of marked lines. They are adaptive, so they show only when contrast
    // increases. A see-through layer resolves their color without painting
    // over the code, and they go over the gutter of sticky line numbers too.
    "[&_.highlighted]:after:pointer-events-none [&_.highlighted]:after:absolute",
    "[&_.highlighted]:after:inset-0 [&_.highlighted]:after:z-1",
    "[&_.highlighted]:after:ak-layer [&_.highlighted]:after:ak-layer-transparent",
    "[&_.highlighted]:after:ak-edge-brand [&_.highlighted]:after:ak-edge-0",
    "[&_.highlighted]:after:border-dotted [&_.highlighted]:after:border-(--ak-edge)",
    "[&_.highlighted:not(.highlighted+.highlighted)]:after:border-t",
    "[&_.highlighted:not(:has(+.highlighted))]:after:border-b",
    // Marked text is a layer with a ring. A mark that spans tokens wraps them,
    // and it's a step off the line. A mark in one token goes inside it, and it
    // mixes the color of the token into the line, with an edge of that color.
    // A negative margin takes back the padding, so the text doesn't move.
    "[&_.highlighted-word]:ak-layer [&_.highlighted-word]:ak-layer-offset-5",
    "[&_.highlighted-word]:ak-edge-25 [&_.highlighted-word]:ring",
    "[&_.highlighted-word]:rounded-sm",
    "[&_.highlighted-word]:-mx-[0.25ch] [&_.highlighted-word]:px-[0.25ch]",
    "[&_.highlighted-word]:py-[0.15em]",
    "[&_.highlighted-word]:[box-decoration-break:clone]",
    // [style] matches a token: each token has its colors in a style attribute,
    // as --shiki-light and --shiki-dark, and the spans that wrap marked text
    // have none. So [style]>.highlighted-word is a mark inside one token, and
    // it inherits the colors of that token.
    "[&_[style]>.highlighted-word]:ak-layer-offset-0",
    "[&_[style]>.highlighted-word]:ak-layer-mix-10",
    "[&_[style]>.highlighted-word]:ak-edge-20",
    "[&_[style]>.highlighted-word]:text-inherit",
    "ak-light:[&_[style]>.highlighted-word]:ak-layer-color-(--shiki-light)",
    "ak-light:[&_[style]>.highlighted-word]:ak-edge-color-(--shiki-light)",
    "ak-dark:[&_[style]>.highlighted-word]:ak-layer-color-(--shiki-dark)",
    "ak-dark:[&_[style]>.highlighted-word]:ak-edge-color-(--shiki-dark)",
    // The scroll area is a tab stop, so keyboard users can scroll it. The ring
    // goes over the edge, outside the content, which would cover it, such as
    // the gutter of line numbers, marked lines, and the copy button. With
    // focus, the code goes up to the layer of the tabs, which it follows in
    // the DOM, so the ring crosses the selected tab. The copy button stays
    // above it.
    "-outline-offset-(--ak-frame-border) ui-focus-visible:z-6",
  ],
  variants: {
    /**
     * Numbers each line in a gutter, which stays in view while the code scrolls
     * sideways. Numbers are not selected or copied. A number is the line count
     * of the code, so the gutter fits the largest number. `true` fits two
     * digits. `CodeBlockCode` passes the line count of its code. Don't combine
     * it with `$prompt`, which takes the same space before each line.
     */
    $lineNumbers(value?: boolean | number) {
      if (!value) return;
      if (value === true) return lineNumbers;
      const digits = `${Math.max(1, Math.trunc(value))}`.length;
      return {
        class: lineNumbers,
        style: { "--code-block-digits": `${digits}` },
      };
    },
    /**
     * Wraps long lines instead of scrolling them. Use it for prose-like code,
     * where a scroll area would hide the end of each line.
     */
    $wrap: {
      true: "code-block-wrap [&>code]:whitespace-pre-wrap [&>code]:wrap-anywhere",
      // The code is as wide as its longest line, so every line background spans
      // the full scroll width.
      false: "overflow-x-auto overscroll-x-contain [&>code]:w-max",
    },
    /**
     * Shows this many lines, and fades out the last ones into the layer of the
     * code. The bottom one and a half lines stay clear, so an expand button can
     * go there. Remove it to show all lines. The `maxLines` prop of the block
     * sets it, with the buttons.
     */
    $maxLines(value?: number) {
      if (value == null) return;
      return {
        class: [
          "overflow-y-hidden",
          "max-h-[calc(var(--code-block-lines)*1lh+var(--ak-frame-padding))]",
          // The mask goes on the code, not on the scroll area, so the code
          // fades into the background of the area. It covers the lines that
          // show, and the code past it is hidden. A plain mask image, not
          // Tailwind's mask utilities. Those made style recalculation about
          // three times slower on every page that loads this CSS, such as
          // when the theme panel opens.
          "[&>code]:[mask-image:linear-gradient(to_bottom,black_calc(100%_-_4.5lh),transparent_calc(100%_-_1.5lh))]",
          "[&>code]:[mask-size:100%_calc(var(--code-block-lines)*1lh)]",
          "[&>code]:[mask-repeat:no-repeat]",
        ],
        style: { "--code-block-lines": `${value}` },
      };
    },
    /**
     * Shows a prompt sign before each line of a terminal command. The sign is
     * not selected or copied. Don't combine it with `$lineNumbers`, which takes
     * the same space before each line.
     */
    $prompt: [
      "[&_.line]:ps-[calc(var(--code-block-px)+2ch)]",
      "[&_.line]:before:absolute [&_.line]:before:start-(--code-block-px)",
      "[&_.line]:before:select-none [&_.line]:before:ak-ink-0",
      "[&_.line]:before:content-['$'_/_'']",
    ],
  },
  defaultVariants: {
    $font: "mono",
    $size: 0.9375,
    $leading: 1.7,
    $lighten: 0.5,
    $p: 2,
    $focus: true,
    $focusOffset: "unset",
    // The code is the last visible frame in the block, even when a copy button
    // or hidden panels come after it.
    $frameEnd: true,
  },
  refine({ variants, addClass }) {
    // Code that doesn't wrap scrolls down inside the height that the block
    // leaves it. Collapsed code hides the rest instead. This depends on two
    // variants, so a map can't add it.
    if (variants.$wrap) return;
    if (variants.$maxLines != null) return;
    addClass("overflow-y-auto");
  },
});

/**
 * Placeholder lines for code that loads, in the shapes of code. Put it in a
 * `codeBlockCode` part. Each line holds a row of `codeBlockSkeletonToken`
 * parts, a space apart, in a span after its indent. With `$wrap`, the tokens
 * wrap like words.
 */
export const codeBlockSkeleton = cv({
  class: [
    "code-block-skeleton",
    "[&_.line>span]:inline-flex [&_.line>span]:flex-wrap",
    "[&_.line>span]:gap-x-[1ch] [&_.line>span]:align-top",
  ],
});

// A token mixes the color of its kind into the tint of the skeleton. The layer
// of the code decides which theme applies, as it does for highlighted tokens.
const tokenTint = cx(
  "ak-light:ak-layer-color-(--code-block-token-light)",
  "ak-dark:ak-layer-color-(--code-block-token-dark)",
  "ak-layer-mix-35",
);

/**
 * A token of a `codeBlockSkeleton` line, for a `skeletonLine` part. `$token`
 * sets the color of a kind of token, from the GitHub light and dark themes of
 * the `highlight` helper. `$length` sets the width in characters.
 */
export const codeBlockSkeletonToken = cv({
  variants: {
    $token: {
      text: "",
      keyword: [
        tokenTint,
        "[--code-block-token-light:#D73A49] [--code-block-token-dark:#F97583]",
      ],
      function: [
        tokenTint,
        "[--code-block-token-light:#6F42C1] [--code-block-token-dark:#B392F0]",
      ],
      string: [
        tokenTint,
        "[--code-block-token-light:#032F62] [--code-block-token-dark:#9ECBFF]",
      ],
      constant: [
        tokenTint,
        "[--code-block-token-light:#005CC5] [--code-block-token-dark:#79B8FF]",
      ],
    },
    $length(value?: number) {
      if (value == null) return;
      return {
        class: "w-[calc(var(--code-block-token-length)*1ch)]",
        style: { "--code-block-token-length": `${value}` },
      };
    },
  },
  defaultVariants: {
    $token: "text",
  },
});
