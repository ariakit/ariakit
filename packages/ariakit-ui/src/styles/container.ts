import { cv } from "clava";
import { getSpacingValue } from "../utils/styles.ts";

// The underscore prefix keeps these inherited state properties out of the
// --container-* namespace that $size reads theme tokens from, so a token
// named "max-width" or "padding" can't create a self-reference cycle.
export const containerSize = cv({
  variants: {
    /**
     * Sets the container’s maximum width. Accepts a `--container-*` theme
     * token name like `"default"` or `"7xl"`, or a raw length or expression
     * like `"64rem"` or `"calc(100% - 2rem)"`. Token names resolve at
     * runtime, so the token must be emitted as a CSS variable (for example
     * via `@theme static`); build-time-only tokens (`@theme inline`) and
     * Tailwind functions like `--spacing()` are not available here — pass
     * the equivalent raw expression instead. The value is written to an
     * inherited custom property, so it can be set on an ancestor to size
     * several nested containers at once. Use `"none"` to reset an inherited
     * size.
     */
    $size(value?: "none" | (string & {})) {
      if (!value) return;
      if (value === "none") {
        // auto is invalid inside the base class min(), which disables
        // max-width — the same state as never providing a $size.
        return { style: { "--_container-max-width": "auto" } };
      }
      // Values with non-ident characters (parens, dots, percent, spaces)
      // are raw lengths or expressions. Idents try the --container-* theme
      // token first and fall back to the literal value, which covers both
      // digit-leading token names like 7xl and bare lengths like 64rem.
      if (/[^\w-]/.test(value)) {
        return { style: { "--_container-max-width": value } };
      }
      return {
        style: {
          "--_container-max-width": `var(--container-${value}, ${value})`,
        },
      };
    },
    /**
     * Sets the container’s gutter: the minimum space between the container
     * and the viewport edges when there’s no room for the maximum width.
     * Like `$size`, it inherits, so it can be provided by an ancestor. Use
     * `"none"` to remove an inherited gutter.
     */
    $p(value?: "unset" | "none" | (string & {}) | number) {
      if (value == null) return;
      if (value === "unset") return;
      if (value === "none") {
        // Must be an explicit zero: the property inherits, so a no-op here
        // would keep an ancestor's gutter instead of removing it.
        return { style: { "--_container-padding": "0px" } };
      }
      return {
        style: { "--_container-padding": getSpacingValue(value) },
      };
    },
  },
});

export const container = cv({
  extend: [containerSize],
  class: [
    // The parens around the var() term matter: Tailwind turns the channel's
    // _ into a space when the var() is glued to an operator inside an
    // arbitrary value (calc(100%-var(--_x)) emits `var(-- x)`), but leaves
    // it alone right after an opening paren.
    "mx-auto w-[calc(100%-(var(--_container-padding,0px)*2))]",
    // The auto fallback is invalid inside min(), which correctly disables
    // max-width entirely when no $size is provided anywhere above.
    "max-w-[min(var(--_container-max-width,auto),100dvw)]",
  ],
});
