import { AxeBuilder } from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function extractComputedCSS() {
  function roundTo(n: number, decimals: number) {
    const factor = 10 ** decimals;
    return Math.round(n * factor) / factor;
  }

  function srgbToLinear(c: number) {
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }

  function rgbToOklch(
    r: number,
    g: number,
    b: number,
  ): [number, number, number] {
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
    if (H < 0) H += 360;
    return [L, C, H];
  }

  function parseNum(s: string | undefined) {
    if (!s || s === "none") return 0;
    const n = parseFloat(s);
    return s.endsWith("%") ? n / 100 : n;
  }

  function formatOklch(l: number, c: number, h: number, a?: number) {
    const parts = [roundTo(l, 4), roundTo(c, 4), roundTo(h, 4)];
    if (a != null && roundTo(a, 4) !== 1) {
      return `oklch(${parts.join("_")}_/_${roundTo(a, 4)})`;
    }
    return `oklch(${parts.join("_")})`;
  }

  function formatColor(str: string): string | null {
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
      const a = rgbC[4] != null ? parseNum(rgbC[4]) : 1;
      if (a === 0) return null;
      const [l, c, h] = rgbToOklch(
        +rgbC[1] / 255,
        +rgbC[2] / 255,
        +rgbC[3] / 255,
      );
      return formatOklch(l, c, h, a !== 1 ? a : undefined);
    }
    // rgb(R G B / A) modern space syntax
    const rgbS = str.match(
      /rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/,
    );
    if (rgbS) {
      const a = rgbS[4] != null ? parseNum(rgbS[4]) : 1;
      if (a === 0) return null;
      const [l, c, h] = rgbToOklch(
        +rgbS[1] / 255,
        +rgbS[2] / 255,
        +rgbS[3] / 255,
      );
      return formatOklch(l, c, h, a !== 1 ? a : undefined);
    }
    // color(srgb R G B / A)
    const srgb = str.match(
      /color\(srgb\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)\s*(?:\/\s*([\d.e+-]+%?))?\s*\)/,
    );
    if (srgb) {
      const a = srgb[4] != null ? parseNum(srgb[4]) : 1;
      if (a === 0) return null;
      const [l, c, h] = rgbToOklch(+srgb[1], +srgb[2], +srgb[3]);
      return formatOklch(l, c, h, a !== 1 ? a : undefined);
    }
    return null;
  }

  function formatShadow(str: string): string | null {
    if (!str || str === "none") return null;
    // Split into individual shadow layers (split at top-level commas)
    const layers: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "(") depth++;
      else if (str[i] === ")") depth--;
      else if (str[i] === "," && depth === 0) {
        layers.push(str.slice(start, i).trim());
        start = i + 1;
      }
    }
    layers.push(str.slice(start).trim());
    // Filter out transparent shadow layers
    const visible = layers.filter(
      (layer) => !layer.startsWith("rgba(0, 0, 0, 0)"),
    );
    if (visible.length === 0) return null;
    const formatted = visible
      .join(", ")
      .replace(
        /oklch\([^)]+\)|rgba?\([^)]+\)|color\(srgb[^)]+\)/g,
        (m) => formatColor(m) ?? m,
      );
    return formatted.replaceAll(" ", "_");
  }

  function isZero(v: string) {
    return v === "0px" || v === "0";
  }

  function compact(values: string[], prefix: string, parts: string[]) {
    if (values.every(isZero)) return [];
    if (new Set(values).size === 1) return [`${prefix}-[${values[0]}]`];
    const r: string[] = [];
    for (let i = 0; i < values.length; i++) {
      if (!isZero(values[i])) r.push(`${parts[i]}-[${values[i]}]`);
    }
    return r;
  }

  function compactCorners(tl: string, tr: string, br: string, bl: string) {
    if (isZero(tl) && isZero(tr) && isZero(br) && isZero(bl)) return [];
    if (tl === tr && tr === br && br === bl) return [`rounded-[${tl}]`];
    if (tl === tr && bl === br) {
      const r: string[] = [];
      if (!isZero(tl)) r.push(`rounded-t-[${tl}]`);
      if (!isZero(bl)) r.push(`rounded-b-[${bl}]`);
      return r;
    }
    return compact([tl, tr, br, bl], "rounded", [
      "rounded-tl",
      "rounded-tr",
      "rounded-br",
      "rounded-bl",
    ]);
  }

  function compactColors(
    colors: string[],
    widths: string[],
    prefix: string,
    parts: string[],
  ) {
    const filtered = colors.map((v, i) =>
      isZero(widths[i]) ? null : formatColor(v),
    );
    if (filtered.every((v) => v == null)) return [];
    const nonNull = filtered.filter(Boolean) as string[];
    if (new Set(nonNull).size === 1 && nonNull.length === filtered.length) {
      return [`${prefix}-[${nonNull[0]}]`];
    }
    const r: string[] = [];
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] != null) r.push(`${parts[i]}-[${filtered[i]}]`);
    }
    return r;
  }

  type CSSNode = string | { class: string; children: Record<string, CSSNode> };

  function extractClass(el: Element) {
    const style = window.getComputedStyle(el);
    const classes: string[] = [];

    const bg = formatColor(style.backgroundColor);
    if (bg) classes.push(`bg-[${bg}]`);

    const text = formatColor(style.color);
    if (text) classes.push(`text-[${text}]`);

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
    if (shadow) classes.push(`shadow-[${shadow}]`);

    if (style.outlineStyle !== "none" && !isZero(style.outlineWidth)) {
      classes.push(`ring-[${style.outlineWidth}]`);
      const ringColor = formatColor(style.outlineColor);
      if (ringColor) classes.push(`ring-[${ringColor}]`);
    }

    return classes.join(" ");
  }

  function walk(el: Element): Record<string, CSSNode> {
    const result: Record<string, CSSNode> = {};
    for (const child of Array.from(el.children)) {
      const labelledBy =
        child.tagName === "SECTION"
          ? child.getAttribute("aria-labelledby")
          : null;
      if (labelledBy) {
        const labelEl = document.getElementById(labelledBy);
        let label = labelEl?.textContent?.trim() ?? "";
        if (!label) {
          // Fallback for React's falsy render (e.g., {0 && <div>} renders "0" as text node)
          for (const node of Array.from(child.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
              label = node.textContent.trim();
              break;
            }
          }
        }
        const cls = extractClass(child);
        const children = walk(child);
        result[label] =
          Object.keys(children).length > 0 ? { class: cls, children } : cls;
      } else {
        Object.assign(result, walk(child));
      }
    }
    return result;
  }

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
