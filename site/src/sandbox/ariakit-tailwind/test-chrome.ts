import { AxeBuilder } from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function extractComputedCSS() {
  interface CSSBranch {
    class: string;
    children: Record<string, CSSNode>;
  }

  type CSSNode = string | CSSBranch;

  const roundTo = (n: number, decimals: number) => {
    const factor = 10 ** decimals;
    return Math.round(n * factor) / factor;
  };

  const srgbToLinear = (c: number) => {
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  const rgbToOklch = (
    r: number,
    g: number,
    b: number,
  ): [number, number, number] => {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s = 0.0883024619 * lr + 0.2024632962 * lg + 0.6890572419 * lb;
    const lp = Math.cbrt(l);
    const mp = Math.cbrt(m);
    const sp = Math.cbrt(s);
    const L = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp;
    const a = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp;
    const b2 = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp;
    const C = Math.sqrt(a * a + b2 * b2);
    let H = (Math.atan2(b2, a) * 180) / Math.PI;
    if (H < 0) {
      H += 360;
    }
    return [L, C, H];
  };

  const parseNum = (s: string | undefined) => {
    if (!s || s === "none") {
      return 0;
    }
    const n = parseFloat(s);
    return s.endsWith("%") ? n / 100 : n;
  };

  const formatOklch = (l: number, c: number, h: number, a?: number) => {
    const parts = [roundTo(l, 4), roundTo(c, 4), roundTo(h, 4)];
    if (a != null && roundTo(a, 4) !== 1) {
      return `oklch(${parts.join("_")}_/_${roundTo(a, 4)})`;
    }
    return `oklch(${parts.join("_")})`;
  };

  const formatRgbMatch = (
    match: RegExpMatchArray,
    normalizeChannel: (value: string) => number,
  ) => {
    const alpha = match[4] != null ? parseNum(match[4]) : 1;
    if (alpha === 0) {
      return null;
    }
    const [l, c, h] = rgbToOklch(
      normalizeChannel(match[1]),
      normalizeChannel(match[2]),
      normalizeChannel(match[3]),
    );
    return formatOklch(l, c, h, alpha !== 1 ? alpha : undefined);
  };

  const formatColor = (str: string): string | null => {
    if (!str || str === "transparent" || str === "rgba(0, 0, 0, 0)") {
      return null;
    }
    // oklch(L C H) or oklch(L C H / A)
    const oklch = str.match(
      /oklch\(\s*([\d.e+-]+%?|none)\s+([\d.e+-]+|none)\s+([\d.e+-]+|none)\s*(?:\/\s*([\d.e+-]+%?|none))?\s*\)/,
    );
    if (oklch) {
      return formatOklch(
        parseNum(oklch[1]),
        parseNum(oklch[2]),
        parseNum(oklch[3]),
        oklch[4] != null ? parseNum(oklch[4]) : undefined,
      );
    }
    // rgba(R, G, B, A) comma syntax
    const rgbC = str.match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+%?))?\s*\)/,
    );
    if (rgbC) {
      return formatRgbMatch(rgbC, (value) => +value / 255);
    }
    // rgb(R G B / A) modern space syntax
    const rgbS = str.match(
      /rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/,
    );
    if (rgbS) {
      return formatRgbMatch(rgbS, (value) => +value / 255);
    }
    // color(srgb R G B / A)
    const srgb = str.match(
      /color\(srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)\s*(?:\/\s*([\d.e+-]+%?))?\s*\)/,
    );
    if (srgb) {
      return formatRgbMatch(srgb, (value) => +value);
    }
    return null;
  };

  const formatShadow = (str: string): string | null => {
    if (!str || str === "none") {
      return null;
    }
    // Split into individual shadow layers (split at top-level commas)
    const layers: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < str.length; i++) {
      const character = str[i];
      if (character === "(") {
        depth += 1;
        continue;
      }
      if (character === ")") {
        depth -= 1;
        continue;
      }
      if (character === "," && depth === 0) {
        layers.push(str.slice(start, i).trim());
        start = i + 1;
      }
    }
    layers.push(str.slice(start).trim());
    // Filter out transparent shadow layers
    const visible = layers.filter(
      (layer) => !layer.startsWith("rgba(0, 0, 0, 0)"),
    );
    if (visible.length === 0) {
      return null;
    }
    const formatted = visible
      .join(", ")
      .replace(
        /oklch\([^)]+\)|rgba?\([^)]+\)|color\(srgb[^)]+\)/g,
        (m) => formatColor(m) ?? m,
      );
    return formatted.replaceAll(" ", "_");
  };

  const isZero = (v: string) => {
    return v === "0px" || v === "0";
  };

  const compact = (
    values: readonly string[],
    prefix: string,
    parts: readonly string[],
  ) => {
    if (values.every(isZero)) {
      return [];
    }
    if (new Set(values).size === 1) {
      const value = values[0];
      if (value == null) {
        return [];
      }
      return [`${prefix}-[${value}]`];
    }
    const result: string[] = [];
    for (const [index, value] of values.entries()) {
      const part = parts[index];
      if (!part || isZero(value)) {
        continue;
      }
      result.push(`${part}-[${value}]`);
    }
    return result;
  };

  const compactCorners = (tl: string, tr: string, br: string, bl: string) => {
    if (isZero(tl) && isZero(tr) && isZero(br) && isZero(bl)) {
      return [];
    }
    if (tl === tr && tr === br && br === bl) {
      return [`rounded-[${tl}]`];
    }
    if (tl === tr && bl === br) {
      const result: string[] = [];
      if (!isZero(tl)) {
        result.push(`rounded-t-[${tl}]`);
      }
      if (!isZero(bl)) {
        result.push(`rounded-b-[${bl}]`);
      }
      return result;
    }
    return compact([tl, tr, br, bl], "rounded", [
      "rounded-tl",
      "rounded-tr",
      "rounded-br",
      "rounded-bl",
    ]);
  };

  const compactColors = (
    colors: readonly string[],
    widths: readonly string[],
    prefix: string,
    parts: readonly string[],
  ) => {
    const filtered = colors.map((value, index) => {
      const width = widths[index];
      if (width == null || isZero(width)) {
        return null;
      }
      return formatColor(value);
    });
    if (filtered.every((value) => value == null)) {
      return [];
    }
    const nonNull = filtered.filter((value): value is string => value != null);
    if (new Set(nonNull).size === 1 && nonNull.length === filtered.length) {
      return [`${prefix}-[${nonNull[0]}]`];
    }
    const result: string[] = [];
    for (const [index, value] of filtered.entries()) {
      const part = parts[index];
      if (!part || value == null) {
        continue;
      }
      result.push(`${part}-[${value}]`);
    }
    return result;
  };

  const extractClass = (el: Element) => {
    const style = window.getComputedStyle(el);
    const classes: string[] = [];

    const bg = formatColor(style.backgroundColor);
    if (bg) {
      classes.push(`bg-[${bg}]`);
    }

    const text = formatColor(style.color);
    if (text) {
      classes.push(`text-[${text}]`);
    }

    classes.push(
      ...compactCorners(
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ),
    );

    const bw = [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ];
    classes.push(
      ...compact(bw, "border", [
        "border-t",
        "border-r",
        "border-b",
        "border-l",
      ]),
    );
    classes.push(
      ...compactColors(
        [
          style.borderTopColor,
          style.borderRightColor,
          style.borderBottomColor,
          style.borderLeftColor,
        ],
        bw,
        "border",
        ["border-t", "border-r", "border-b", "border-l"],
      ),
    );

    classes.push(
      ...compact(
        [
          style.paddingTop,
          style.paddingRight,
          style.paddingBottom,
          style.paddingLeft,
        ],
        "p",
        ["pt", "pr", "pb", "pl"],
      ),
    );

    classes.push(
      ...compact(
        [
          style.marginTop,
          style.marginRight,
          style.marginBottom,
          style.marginLeft,
        ],
        "m",
        ["mt", "mr", "mb", "ml"],
      ),
    );

    const shadow = formatShadow(style.boxShadow);
    if (shadow) {
      classes.push(`shadow-[${shadow}]`);
    }

    if (style.outlineStyle !== "none" && !isZero(style.outlineWidth)) {
      classes.push(`ring-[${style.outlineWidth}]`);
      const ringColor = formatColor(style.outlineColor);
      if (ringColor) {
        classes.push(`ring-[${ringColor}]`);
      }
    }

    return classes.join(" ");
  };

  const getSectionLabel = (section: Element, labelledBy: string) => {
    const labelElement = document.getElementById(labelledBy);
    let label = labelElement?.textContent?.trim() ?? "";
    if (label) {
      return label;
    }
    // React renders `0 && <div />` as a text node, so fall back to the
    // section's own text content when no labelled element has visible text.
    for (const node of Array.from(section.childNodes)) {
      if (node.nodeType !== Node.TEXT_NODE) {
        continue;
      }
      const textContent = node.textContent?.trim();
      if (!textContent) {
        continue;
      }
      label = textContent;
      break;
    }
    return label;
  };

  const walk = (el: Element): Record<string, CSSNode> => {
    const result: Record<string, CSSNode> = {};
    for (const child of Array.from(el.children)) {
      const labelledBy =
        child.tagName === "SECTION"
          ? child.getAttribute("aria-labelledby")
          : null;
      if (labelledBy) {
        const label = getSectionLabel(child, labelledBy);
        const className = extractClass(child);
        const children = walk(child);
        result[label] =
          Object.keys(children).length > 0
            ? { class: className, children }
            : className;
      } else {
        Object.assign(result, walk(child));
      }
    }
    return result;
  };

  return walk(document.body);
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const scheme of ["light", "dark"] as const) {
    test.describe(`${scheme} scheme`, () => {
      test.use({ colorScheme: scheme });

      test("no color contrast violations (WCAG AA)", async ({ page }) => {
        test.setTimeout(60_000);
        const results = await new AxeBuilder({ page })
          .withRules(["color-contrast"])
          .analyze();
        expect(results.violations).toEqual([]);
      });

      for (const contrast of [false, true]) {
        const label = contrast ? " (high contrast)" : "";
        test(`computed styles${label}`, async ({ page }) => {
          if (contrast) {
            const cdp = await page.context().newCDPSession(page);
            await cdp.send("Emulation.setEmulatedMedia", {
              features: [{ name: "prefers-contrast", value: "more" }],
            });
            await page.reload({ waitUntil: "networkidle" });
          }
          const tree = await page.evaluate(extractComputedCSS);
          expect(JSON.stringify(tree, null, 2)).toMatchSnapshot(
            `${scheme}${contrast ? "-high-contrast" : ""}`,
          );
        });
      }
    });
  }
});
