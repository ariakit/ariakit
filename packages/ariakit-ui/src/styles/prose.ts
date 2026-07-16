import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";

export const prose = cv({
  class: [
    // Legacy ak-prose-content/ak-prose-text: a flex column whose gap drives
    // the vertical rhythm, with the base ink adjusted per scheme. Sizing is
    // plain classes so consumers can override it responsively through the
    // className (e.g. `@5xl:text-lg/loose`); descendants derive their
    // geometry from the inherited font-size and line-height (lh units)
    // instead of a leading channel. Unlike legacy, whose channel computed a
    // fixed length at the root, font-sized descendants like headings keep
    // the unitless ratio, so they no longer collapse below their own font
    // size.
    "flex flex-col gap-(--prose-gap) [--prose-gap:1.25em]",
    "text-base/relaxed ak-dark:ak-ink-75 ak-light:ak-ink-90",
    // Rhythm flag and channel read by descendant components (lists) through
    // container style queries so they follow the prose gap automatically.
    "[--prose:1]",
    // Elements with a dedicated component (headings, links, lists) are
    // composed as components inside prose rather than styled from here. The
    // rules below cover the plain markup authors write inline, kept at zero
    // descendant specificity by the :where() selectors.
    //
    // Paragraphs re-derive the prose ink so they stay readable inside
    // layered children.
    "[&_:where(p)]:ak-dark:ak-ink-75 [&_:where(p)]:ak-light:ak-ink-90",
    // Legacy ak-strong.
    "[&_:where(strong)]:ak-ink-100 [&_:where(strong)]:font-medium",
    // Legacy ak-code: an inline code chip, excluding code blocks. The
    // inherited color keeps the chip text on the prose ink instead of the
    // chip layer's own ink.
    "[&_:where(code):not(:where(pre_code))]:ak-layer",
    "[&_:where(code):not(:where(pre_code))]:ak-layer-6",
    "[&_:where(code):not(:where(pre_code))]:ak-edge-15",
    "[&_:where(code):not(:where(pre_code))]:ring",
    "[&_:where(code):not(:where(pre_code))]:rounded",
    "[&_:where(code):not(:where(pre_code))]:px-[0.25em]",
    "[&_:where(code):not(:where(pre_code))]:py-[0.18em]",
    "[&_:where(code):not(:where(pre_code))]:font-mono",
    "[&_:where(code):not(:where(pre_code))]:text-inherit",
    "[&_:where(code):not(:where(pre_code))]:[font-size-adjust:0.48]",
    // Legacy ak-kbd, mirroring styles/kbd.ts so plain kbd markup matches the
    // Kbd component. Keep the two class lists in sync.
    "[&_:where(kbd)]:ak-layer [&_:where(kbd)]:ak-layer-9",
    "[&_:where(kbd)]:ak-edge-100 [&_:where(kbd)]:ak-edge-lighten-60",
    "[&_:where(kbd)]:ak-dark:ak-edge-16",
    "[&_:where(kbd)]:font-sans [&_:where(kbd)]:p-[0.1em_0.25em]",
    "[&_:where(kbd)]:[font-size-adjust:0.49]",
    "[&_:where(kbd)]:rounded-[0.27em_0.27em_0.34em_0.34em]",
    "[&_:where(kbd)]:ak-dark:rounded-b-[0.4em]",
    "[&_:where(kbd)]:border-[max(1px,0.067em)_0_max(1px,0.15em)]",
    "[&_:where(kbd)]:ak-dark:border-[0_0_max(1px,0.2em)]",
    "[&_:where(kbd)]:border-[white_transparent_var(--ak-edge)]",
    "[&_:where(kbd)]:ak-dark:border-b-[oklch(from_var(--ak-layer)_calc(l-0.08)_c_h)]",
    "[&_:where(kbd)]:bg-linear-to-b [&_:where(kbd)]:from-transparent",
    "[&_:where(kbd)]:to-[oklch(from_var(--ak-layer)_calc(l+0.05)_c_h)]",
    "[&_:where(kbd)]:ak-dark:to-[oklch(from_var(--ak-layer)_calc(l+0.08)_c_h)]",
    "[&_:where(kbd)]:[box-shadow:0_0_0_max(1px,0.034em)_var(--ak-edge)]",
    "[&_:where(kbd)]:ak-dark:[box-shadow:0_min(-1px,-0.06em)_var(--ak-edge),0_0_0_max(1px,0.06em)_var(--ak-edge)]",
    // Legacy ak-separator: a dashed rule whose margins extend the rhythm gap
    // by half on both sides.
    "[&_:where(hr)]:ak-layer [&_:where(hr)]:ak-edge-20",
    "[&_:where(hr)]:border-t [&_:where(hr)]:border-dashed",
    "[&_:where(hr)]:my-[calc(var(--prose-gap)*0.5)]",
    // The element after the separator drops its own top margin (headings
    // carry one). The redundant not-first stack ties the specificity of the
    // heading's not-first margin so this later-sorted rule wins, like the
    // stacked margin rules in heading.ts.
    "[&_:where(hr)+*]:not-first:mt-0",
  ],
  variants: {
    /**
     * Sets the gap between the prose children that drives the vertical
     * rhythm. Numbers scale the spacing token.
     */
    $gap(value?: (string & {}) | number) {
      if (value == null) return;
      return {
        style: { "--prose-gap": getSpacingValue(value) },
      };
    },
  },
});
