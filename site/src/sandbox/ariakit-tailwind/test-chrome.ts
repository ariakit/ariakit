import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type ColorContrastViolationMap = Record<string, string>;

interface AxeViolation {
  nodes: AxeViolationNode[];
}

interface AxeViolationNode {
  any: AxeCheckResult[];
  all: AxeCheckResult[];
  none: AxeCheckResult[];
  html: string;
  target: Array<string | string[]>;
}

interface AxeCheckResult {
  data?: {
    bgColor?: string;
    contrastRatio?: number;
    fgColor?: string;
  };
}

function extractComputedCSS() {
  interface CSSBranch {
    class: string;
    children: Record<string, CSSNode>;
  }

  type CSSNode = string | CSSBranch;

  const COLOR_NUMBER_PRECISION = 4;
  const LCH_CHROMA_PRECISION = 2;
  const LCH_HUE_PRECISION = 3;
  const LCH_HUELESS_CHROMA = 1;
  const colorNumberRegex = /-?(?:\d*\.\d+|\d+)(?:e[+-]?\d+)?/gi;

  const roundColorNumber = (
    value: string,
    precision = COLOR_NUMBER_PRECISION,
  ) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return value;
    }
    const factor = 10 ** precision;
    const rounded = Math.round(number * factor) / factor;
    return Object.is(rounded, -0) ? "0" : String(rounded);
  };

  const getColorChannelNumber = (value: string) => {
    if (value === "none") {
      return 0;
    }
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

  const formatPolarColor = (str: string) => {
    const match = /^lch\((.*)\)$/.exec(str.trim());
    if (!match) {
      return null;
    }
    const [, content] = match;
    if (!content) {
      return null;
    }
    const [colorContent, alphaContent] = content.split(/\s*\/\s*/);
    const colorChannels = colorContent?.trim().split(/\s+/) ?? [];
    const [lightness, chroma, hue] = colorChannels;
    if (!lightness || !chroma || !hue) {
      return null;
    }
    const chromaNumber = getColorChannelNumber(chroma);
    const normalizedHue =
      chromaNumber != null && Math.abs(chromaNumber) < LCH_HUELESS_CHROMA
        ? "0"
        : hue;
    const result = [
      roundColorNumber(lightness),
      roundColorNumber(chroma, LCH_CHROMA_PRECISION),
      roundColorNumber(normalizedHue, LCH_HUE_PRECISION),
    ];
    if (alphaContent) {
      result.push("/", roundColorNumber(alphaContent));
    }
    return `lch(${result.join("_")})`;
  };

  const formatCssValue = (value: string) => {
    return value
      .trim()
      .replace(colorNumberRegex, (value) => roundColorNumber(value))
      .replace(/\s+/g, "_");
  };

  const formatColor = (str: string): string | null => {
    if (!str || str === "transparent" || str === "rgba(0, 0, 0, 0)") {
      return null;
    }
    const polarColor = formatPolarColor(str);
    if (polarColor) {
      return polarColor;
    }
    return formatCssValue(str);
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
        /oklch\([^)]+\)|lch\([^)]+\)|rgba?\([^)]+\)|color\(srgb[^)]+\)/g,
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

    const childTextColors = new Set<string>();
    for (const child of Array.from(el.children)) {
      if (child.tagName === "SECTION") {
        continue;
      }
      if (!child.textContent?.trim()) {
        continue;
      }
      const childText = formatColor(window.getComputedStyle(child).color);
      if (!childText || childText === text) {
        continue;
      }
      childTextColors.add(childText);
    }
    if (childTextColors.size === 1) {
      const [childText] = childTextColors;
      if (childText) {
        classes.push(`*:text-[${childText}]`);
      }
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

function formatColorContrastViolations(
  violations: AxeViolation[],
): ColorContrastViolationMap {
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

  const getTargetSelector = (target: AxeViolationNode["target"]) => {
    const selector = target.at(-1);
    if (!selector) {
      return null;
    }
    return Array.isArray(selector) ? (selector.at(-1) ?? null) : selector;
  };

  const getSectionPath = (element: Element) => {
    const labels: string[] = [];
    let currentSection = element.closest("section[aria-labelledby]");
    while (currentSection) {
      const labelledBy = currentSection.getAttribute("aria-labelledby");
      if (labelledBy) {
        const label = getSectionLabel(currentSection, labelledBy);
        if (label) {
          labels.unshift(label);
        }
      }
      currentSection =
        currentSection.parentElement?.closest("section[aria-labelledby]") ??
        null;
    }
    return labels.join(" > ");
  };

  const getContrastRatio = (node: AxeViolationNode) => {
    for (const check of [...node.any, ...node.all, ...node.none]) {
      const contrastRatio = check.data?.contrastRatio;
      if (typeof contrastRatio === "number") {
        return {
          bgColor: check.data?.bgColor,
          contrastRatio,
          fgColor: check.data?.fgColor,
        };
      }
    }
    return null;
  };

  const entries = new Map<
    string,
    { bgColor?: string; contrastRatio: number; fgColor?: string }
  >();
  for (const violation of violations) {
    for (const node of violation.nodes) {
      const contrastData = getContrastRatio(node);
      if (contrastData == null) {
        continue;
      }
      const selector = getTargetSelector(node.target);
      if (!selector) {
        continue;
      }
      const element = document.querySelector(selector);
      const key = element ? getSectionPath(element) : selector;
      if (!key) {
        continue;
      }
      const previousContrastData = entries.get(key);
      if (
        previousContrastData == null ||
        contrastData.contrastRatio < previousContrastData.contrastRatio
      ) {
        entries.set(key, contrastData);
      }
    }
  }
  return Object.fromEntries(
    Array.from(entries)
      .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
      .map(([path, { bgColor, contrastRatio, fgColor }]) => {
        const colors = fgColor && bgColor ? ` (${bgColor} > ${fgColor})` : "";
        return [path, `${contrastRatio}${colors}`];
      }),
  );
}

async function waitForPreviewReady(page: Page) {
  await page.waitForFunction(async () => {
    if (document.querySelector("astro-island[ssr]")) {
      return false;
    }
    const getSectionLabel = (section: Element) => {
      const labelledBy = section.getAttribute("aria-labelledby");
      if (!labelledBy) {
        return null;
      }
      const labelElement = document.getElementById(labelledBy);
      const label = labelElement?.textContent?.trim();
      if (label) {
        return label;
      }
      for (const node of Array.from(section.childNodes)) {
        if (node.nodeType !== Node.TEXT_NODE) {
          continue;
        }
        const textContent = node.textContent?.trim();
        if (textContent) {
          return textContent;
        }
      }
      return null;
    };
    const getSectionLabels = () => {
      const sections = Array.from(
        document.querySelectorAll("section[aria-labelledby]"),
      );
      const labels = sections.map(getSectionLabel);
      if (labels.some((label) => label == null)) {
        return null;
      }
      return labels.join("\n");
    };
    const sectionLabels = getSectionLabels();
    if (sectionLabels == null || sectionLabels.length === 0) {
      return false;
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    return sectionLabels === getSectionLabels();
  });
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
        const violations = await page.evaluate<
          ColorContrastViolationMap,
          AxeViolation[]
        >(formatColorContrastViolations, results.violations);
        if (Object.keys(violations).length > 0) {
          throw new Error(JSON.stringify(violations, null, 2));
        }
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
          await waitForPreviewReady(page);
          const tree = await page.evaluate(extractComputedCSS);
          expect(JSON.stringify(tree, null, 2)).toMatchSnapshot(
            `${scheme}${contrast ? "-high-contrast" : ""}`,
          );
        });
      }
    });
  }
});
