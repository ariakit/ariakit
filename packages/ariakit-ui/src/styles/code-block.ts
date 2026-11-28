import { cv, cx } from "clava";
import { edge } from "./edge.ts";
import { frame, frameBase } from "./frame.ts";
import { skeletonLine } from "./skeleton.ts";
import { tab, tabList, tabPanels, tabSeparator, tabs } from "./tabs.ts";
import { text } from "./text.ts";

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
    "ui-code-block",
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "[&>*]:col-start-1",
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
        "not-has-[>.ui-code-block-code:not([hidden])>.ui-code-block-scroll--wrap-true]:max-h-(--code-block-max-height)";
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
  class: "ui-code-block-header",
});

// The folder of a file tab or a title. It's half a step lighter than the page,
// like the code below it, and its text is a bit smaller than the code.
const codeBlockFolder = cv({
  extend: [tab],
  class: "font-sans",
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
    "ui-code-block-title",
    // The text can be selected, like other text on the page, and the pointer
    // doesn't suggest a press.
    "cursor-auto",
    // Stays a class to come after the user-select of `ui-button`, which it
    // replaces.
    "not-[button]:select-text",
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
  class: "ui-code-block-copy",
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
  class: "ui-code-block-expand cursor-pointer",
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
  class: "ui-code-block-collapse",
});

const lineNumbers = cx(
  "ui-code-block-scroll--line-numbers",
  "[&_.line]:before:ak-ink-0",
);

/**
 * The panel of the code below the header, half a step lighter than the page. It
 * holds a `codeBlockScroll`, which covers its padding, with the lines and a
 * `codeBlockCopy` in it, and the buttons over it, such as a `codeBlockExpand`.
 * The buttons inherit its layer.
 */
export const codeBlockCode = cv({
  extend: [tabPanels],
  class: [
    "ui-code-block-code",
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "[&>*]:col-start-1 [&>*]:row-start-1",
  ],
  variants: {
    // The scroll area takes the keyboard focus, so the panel shows its ring
    // then too, like focusWithin for a control with a nested input.
    $focus: {
      1: "ui-code-block-code--focus-1",
      true: "ui-code-block-code--focus-true",
      2: "ui-code-block-code--focus-2",
      3: "ui-code-block-code--focus-3",
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
    // The code is the last visible frame in the block, even when a copy button
    // or hidden panels come after it.
    $frameEnd: true,
  },
});

/**
 * The scroll area of the code in a `codeBlockCode` panel, rendered as a `pre`
 * element with the HTML of the lines in a `code` element, and an optional
 * `codeBlockCopy` after it. It reads the markup of `highlight`: a `line` class
 * on each line, and tokens with their colors in the `--shiki-light` and
 * `--shiki-dark` variables, which follow the layer of each line. `highlight`
 * styles marked lines and text with `codeBlockMarkedLine` and
 * `codeBlockMarkedText`.
 */
export const codeBlockScroll = cv({
  extend: [frameBase, text],
  class: [
    "ui-code-block-scroll",
    // Stays a class to keep its order with the classes of the elements that it
    // styles.
    "*:[grid-area:1/1]",
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
      true: "ui-code-block-scroll--wrap-true",
      false: "ui-code-block-scroll--wrap-false",
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
    $prompt: "ui-code-block-scroll--prompt [&_.line]:before:ak-ink-0",
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

/**
 * A marked line in a `codeBlockScroll`, which `highlight` applies to the lines
 * it marks. The line is a layer, so the tokens on it adapt to its background. A
 * bar at the start marks it without color alone. Its brand edge keeps 3:1
 * against the code, or 4.5:1 and a wider bar in high contrast mode.
 */
export const codeBlockMarkedLine = cv({
  extend: [edge],
  class: "highlighted ui-code-block-marked-line after:ak-layer",
  defaultVariants: {
    $layer: "brand",
    // Keep the brand tint near white and black too, where a layer drops its
    // chroma by default.
    $chromaMax: null,
    $mix: 15,
    $edge: "brand",
    $edgeRaw: true,
    $edgeContrast: true,
  },
});

/**
 * Marked text in a `codeBlockScroll`, which `highlight` applies to the text it
 * marks. The mark is a layer with a ring, a step off the line. A negative
 * margin takes back its padding, so the text doesn't move.
 */
export const codeBlockMarkedText = cv({
  extend: [edge],
  class: "highlighted-word ui-code-block-marked-text",
  variants: {
    /**
     * Marks text in one token with colors, inside the element of that token.
     * The mark mixes the color of the token into the line, with an edge of that
     * color, and it keeps the text color of the token. The layer of the line
     * decides which theme color applies, as it does for the tokens.
     */
    $token: [
      // Stays a class to come after the color of `ink`, which it replaces.
      "text-inherit",
      // Stays a class to come after the --_ak-layer-color of `layer`, which it
      // replaces.
      "ak-light:ak-layer-color-(--shiki-light)",
      "ak-dark:ak-layer-color-(--shiki-dark)",
      // Stays a class to come after the --_ak-edge-color of `edge`, which it
      // replaces.
      "ak-light:ak-edge-color-(--shiki-light)",
      "ak-dark:ak-edge-color-(--shiki-dark)",
    ],
  },
  defaultVariants: {
    // Keep the tint of the line near white and black too, where a layer drops
    // its chroma by default.
    $chromaMax: null,
    $lightnessOffset(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$token) return 0;
      return true;
    },
    $mix(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (!variants.$token) return defaultValue;
      return 10;
    },
    $edgeWeight(defaultValue, variants) {
      if (defaultValue != null) return defaultValue;
      if (variants.$token) return "medium";
      return 25;
    },
  },
});

// A token mixes the color of its kind into the tint of the skeleton. The layer
// of the code decides which theme applies, as it does for highlighted tokens.
const tokenTint = cx(
  // Stays a class to come after the --_ak-layer-color of `layer`, which it
  // replaces.
  "ak-light:ak-layer-color-(--code-block-token-light)",
  "ak-dark:ak-layer-color-(--code-block-token-dark)",
  // Stays a class, so that the --_ak-layer-mix-amount of `layer` still comes
  // after it and replaces it.
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
  class: "ui-code-block-skeleton-token",
  variants: {
    $token: {
      text: "",
      keyword: [tokenTint, "ui-code-block-skeleton-token--keyword"],
      function: [tokenTint, "ui-code-block-skeleton-token--function"],
      string: [tokenTint, "ui-code-block-skeleton-token--string"],
      constant: [tokenTint, "ui-code-block-skeleton-token--constant"],
      // It shows only in code with line numbers, at the start of the line, in
      // the gutter.
      number: "ui-code-block-skeleton-token--number",
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
