import { cv, cx } from "clava";
import { focus } from "./focus.ts";
import { frame, frameBase } from "./frame.ts";
import { skeletonLine } from "./skeleton.ts";
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
 * shows only the edges of the title and the code. Each `codeBlockCode` panel
 * holds a `codeBlockScroll` part with the code, and a `codeBlockCopy` after the
 * code in it sticks to the top end corner of the panel. A `codeBlockExpand` in
 * the panel covers collapsed code, and a `codeBlockCollapse` goes in a row
 * under the panel.
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
    // edge. A whole pixel keeps the button on the pixel grid at text sizes
    // where the em step isn't one.
    "[--code-block-copy-gap:round(max(var(--tabs-padding),--spacing(1)),1px)]",
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
      // The marker of wrapped code is on the scroll area of a panel that shows.
      const limit =
        "not-has-[>.code-block-code:not([hidden])>.code-block-wrap]:max-h-(--code-block-max-height)";
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
    // Half a step, not the step of the folder tabs that this extends, which a
    // color or another modifier replaces.
    $lighten(defaultValue, variants) {
      if (variants.$kind !== "folder") return defaultValue;
      if (defaultValue === true) return 0.5;
      return defaultValue;
    },
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
 * The frame of the copy button in the top end corner of a `codeBlockScroll`,
 * after the code. It sticks there while the code scrolls, under the scrollbars
 * of the scroll area. It inherits the text of the code, so the button lines up
 * with the first line. It takes the layer of the panel, so the code doesn't
 * show around the button, and code that scrolls under it fades out before the
 * frame. Code is always left to right, so the frame goes on its right, on a
 * right-to-left page too.
 */
export const codeBlockCopy = cv({
  extend: [frame, text],
  class: [
    "code-block-copy flex",
    // Over the code, in the corner inside the edge of the panel.
    "z-2 self-start [justify-self:right]",
    // Sticky offsets start inside the padding of the scroll area, so the top
    // one takes it back. The scroll area has no side padding to cover.
    "sticky right-0 -top-(--code-block-padding) mx-0",
    // Wrapped code isn't a scroll area, so the frame would stick to the scroll
    // area around the block instead.
    "[.code-block-wrap>&]:relative [.code-block-wrap>&]:inset-auto",
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
    "rounded-l-none",
    "before:absolute before:inset-y-0 before:right-full before:w-[1lh]",
    "before:pointer-events-none",
    "before:bg-linear-to-r",
    "before:from-transparent before:to-(--ak-layer)",
  ],
  defaultVariants: {
    $p: "var(--code-block-copy-gap)",
    // The frame goes over the padding of the scroll area, like the code, and
    // its corners follow the panel.
    $m: "calc(-1 * var(--code-block-padding))",
    // The layer of the panel, which paints over the code that scrolls under the
    // frame. A frame is transparent by default.
    $layer: true,
  },
});

/**
 * The click target over collapsed code, with the expand button in the clear
 * part at the bottom of the fade. A click anywhere on the collapsed code shows
 * all lines, so a pointer over it shows the hover state of the button too.
 */
export const codeBlockExpand = cv({
  extend: [frameBase],
  class: [
    "code-block-expand flex items-end justify-center",
    // Over the scroll area, below the copy button.
    "z-1",
    // The child is the expand button. Naming it keeps Chrome from restyling
    // the whole subtree of each element that the pointer enters or leaves,
    // which a hover rule for any child does. :where() keeps the specificity of
    // `*`.
    "cursor-pointer hover:[&>:where(.control)]:ak-state-(--hover-offset)",
  ],
  defaultVariants: {
    // A frame over the padding of the panel, like the scroll area, with a
    // little padding of its own, so the corners of the button stay concentric
    // with the panel at that distance from its edge.
    $m: "calc(-1 * var(--code-block-padding))",
    $p: 1,
  },
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
    "pt-[calc(var(--tabs-padding,0px)+var(--tabs-bordering,0px)+round(--spacing(2),1px))]",
  ],
});

// Line numbers come from a CSS counter in a gutter at the start of each line,
// so they are never selected or copied. The empty alternative text after the
// slash keeps screen readers from reading them. The gutter hangs before the
// line, so wrapped lines start after it. It takes the width of the largest
// number, plus a gap.
const lineNumbers = cx(
  "code-block-line-numbers",
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
  // Placeholder lines have a placeholder number in the gutter instead.
  "[&_.skeleton_.line]:before:hidden",
);

/**
 * The panel of the code below the header, half a step lighter than the page. It
 * holds a `codeBlockScroll`, which covers its padding, with the lines and a
 * `codeBlockCopy` in it, and the buttons over it, such as a `codeBlockExpand`.
 * The buttons inherit its layer.
 */
export const codeBlockCode = cv({
  extend: [tabPanels, focus],
  class: [
    "code-block-code grid min-w-0",
    // One cell, where the scroll area takes the height that the block leaves
    // it, and the buttons go over it.
    "grid-cols-1 grid-rows-[minmax(0,1fr)] [&>*]:col-start-1 [&>*]:row-start-1",
    // The buttons over the code cover the padding, like the scroll area.
    "[--code-block-padding:var(--ak-frame-padding)]",
    // The code is always left to right, but the strip above it follows the
    // page. On a right-to-left page, the start of the strip is on the right, so
    // the top corners that join it swap sides.
    "[.code-block:dir(rtl)>&]:not-first:rounded-tr-[calc(var(--tabs-corner-s)+(var(--tabs-notch,0px)-var(--tabs-corner-s))*var(--tabs-open-s,0))]",
    "[.code-block:dir(rtl)>&]:not-first:rounded-tl-[calc(var(--tabs-corner-e)+(var(--tabs-notch,0px)-var(--tabs-corner-e))*var(--tabs-open-e,0))]",
    // The ring goes over the edge, outside the content, which would cover it,
    // such as the gutter of line numbers, marked lines, and the copy button.
    // With focus, the panel goes up to the layer of the tabs, which it follows
    // in the DOM, so the ring crosses the selected tab. A panel without a tab
    // stop inside, such as one with wrapped code, takes the focus itself.
    "-outline-offset-(--ak-frame-border) ui-focus-visible:z-6",
    "has-[>.code-block-scroll:focus-visible]:z-6",
  ],
  variants: {
    // The scroll area takes the keyboard focus, so the panel shows its ring
    // then too, like focusWithin for a control with a nested input.
    $focus: {
      1: "has-[>.code-block-scroll:focus-visible]:outline",
      true: "has-[>.code-block-scroll:focus-visible]:outline-2",
      2: "has-[>.code-block-scroll:focus-visible]:outline-2",
      3: "has-[>.code-block-scroll:focus-visible]:outline-3",
    },
  },
  defaultVariants: {
    // Half a step, not the step of the panels that this extends, which a color
    // or another modifier replaces.
    $lighten(defaultValue) {
      if (defaultValue === true) return 0.5;
      return defaultValue;
    },
    $p: 2,
    $focus: true,
    $focusOffset: "unset",
    // The code is the last visible frame in the block, even when a copy button
    // or hidden panels come after it.
    $frameEnd: true,
  },
});

/**
 * The scroll area of the code in a `codeBlockCode` panel, rendered as a `pre`
 * element with the HTML of the lines in a `code` element, and an optional
 * `codeBlockCopy` after it. It reads the markup of `highlight`: a `line` class
 * on each line, `highlighted` on marked lines, and `highlighted-word` on marked
 * text. Token colors come from the `--shiki-light` and `--shiki-dark`
 * variables, and follow the layer of each line.
 */
export const codeBlockScroll = cv({
  extend: [frameBase, text],
  class: [
    // One cell, where the copy button goes over the code. The cell is as wide
    // as the code, so the button sticks to the corner when the code scrolls
    // sideways too. It has no stacking context of its own, so the copy button
    // stays above the expand button next to it.
    "code-block-scroll grid min-h-0 min-w-0 *:[grid-area:1/1]",
    // The copy button sticks to the corner, so a scroll padding would scroll
    // the code each time the button takes the focus.
    "scroll-p-0",
    "tab-2",
    // The panel shows the focus ring.
    "outline-none",
    // The frame padding, which the scroll area takes from the panel that it
    // covers, stays at the top and the bottom. The side padding moves to each
    // line, so line backgrounds reach both edges, and the gutter of line
    // numbers can replace it. It's the side padding of textFrame: the frame
    // padding and half the leading around the caps. Glyphs of a monospace font
    // start a bit inside their cell, so a sixth of a character comes off.
    "px-0",
    "[--code-block-px:calc(var(--ak-frame-padding,0px)+(1lh-1cap)*0.5-1ch/6)]",
    "[&>code]:min-w-full",
    // Lines are separated by line feeds, so they stay inline. An empty line
    // still needs the height of a line for its background.
    "[&_.line]:relative [&_.line]:inline-block [&_.line]:min-w-full",
    "[&_.line]:min-h-lh [&_.line]:align-top",
    // Zero specificity, so the gutters of line numbers and prompt signs can
    // replace the start padding.
    "[&_.line]:ui-base:px-(--code-block-px)",
    // The first line leaves room for the frame of a copy button after the
    // code, which is as wide as the line is tall with its padding.
    "[&:has(>.code-block-copy)_.line:first-child]:pe-[calc(var(--code-block-px)+1lh+2*var(--ak-frame-padding))]",
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
      // The block reads the marker, so it doesn't limit the height of wrapped
      // code.
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
    // It fills the panel and takes its padding and corners.
    $cover: true,
    // The scroll area is the last frame in the panel, even when the buttons
    // come after it.
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

// A token mixes the color of its kind into the tint of the skeleton. The layer
// of the code decides which theme applies, as it does for highlighted tokens.
const tokenTint = cx(
  "ak-light:ak-layer-color-(--code-block-token-light)",
  "ak-dark:ak-layer-color-(--code-block-token-dark)",
  "ak-layer-mix-35",
);

/**
 * A placeholder token in a line of code that loads, such as in a
 * `CodeBlockSkeleton`. It's an inline bar, so spaces separate the tokens of a
 * line, and they wrap like words in code with `$wrap`. `$token` sets the color
 * of a kind of token, from the GitHub light and dark themes of the `highlight`
 * helper, and `number` makes it the placeholder of the line number. `$length`
 * sets the width in characters.
 */
export const codeBlockSkeletonToken = cv({
  extend: [skeletonLine],
  class: "inline-block align-top",
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
      // It shows only in code with line numbers, at the start of the line, in
      // the gutter. The selector outranks the display of the token. The margins
      // take the rest of the gutter, so the bar ends where the number would.
      number: [
        "[.code-block-scroll:not(.code-block-line-numbers)_&]:hidden",
        "ms-[calc(var(--code-block-start)-2ch-var(--code-block-token-length)*1ch)]",
        "me-[2ch]",
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
