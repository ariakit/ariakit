/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import {
  findStyleDependency,
  getStyleDefinition,
  getTransitiveDependencies,
  resolveDependenciesForAkToken,
  resolveStylesForFiles,
  scanAkTokensInFiles,
  styleDefToCss,
} from "./styles.ts";

test("scanAkTokensInFiles finds ak-* tokens including bracketed", () => {
  const files = {
    "a.tsx": `
      <div className="ak-badge ak-text/80 ak-[content:'x']"></div>
      <div className='not-data-open:ak-text/0'></div>
    `,
  };
  const tokens = scanAkTokensInFiles(files);
  expect(tokens.has("ak-badge")).toBe(true);
  expect(tokens.has("ak-text/80")).toBe(true);
  expect(Array.from(tokens).some((t) => t.startsWith("ak-[content:"))).toBe(
    true,
  );
});

test("styleDefToCss renders @property block", () => {
  const def = getStyleDefinition("--ak-tab-border-width", "at-property");
  expect(def).toBeTruthy();
  const css = styleDefToCss(def!);
  expect(css).toMatchInlineSnapshot(`
    "@property --ak-tab-border-width {
      syntax: "<length>";
      inherits: true;
      initial-value: 0px;
    }"
  `);
});

test("styleDefToCss renders @utility with nested blocks and @apply", () => {
  const def = getStyleDefinition("ak-badge", "utility");
  expect(def?.type).toBe("utility");
  const css = styleDefToCss(def!);
  expect(css).toMatchInlineSnapshot(`
    "@utility ak-badge {
      @apply ak-badge_base;
    }"
  `);
});

test("styleDefToCss renders @custom-variant with @slot blocks", () => {
  const def = getStyleDefinition("ak-disclosure-open", "variant");
  expect(def?.type).toBe("variant");
  const css = styleDefToCss(def!);
  expect(css).toMatchInlineSnapshot(`
    "@custom-variant ak-disclosure-open {
      @container style(--ak-disclosure-open: 1) {
        @slot;
      }
    }"
  `);
});

test("styleDefToCss renders ak-list-item-ol-border utility fully", () => {
  const def = getStyleDefinition("ak-list-item-ol-border", "utility");
  expect(def?.type).toBe("utility");
  const css = styleDefToCss(def!);
  expect(css).toMatchInlineSnapshot(`
    "@utility ak-list-item-ol-border {
      @apply relative;
      --ak-list-border-gap: --spacing(1);
      --ak-list-border-top: calc(
        var(--ak-list-leading) + var(--ak-list-border-gap) + var(--ak-frame-padding)
      );
      /* Border segment */
      &::after {
        @apply ak-layer-pop-2;
        @apply z-2 pointer-events-none absolute h-full;
        content: "";
        width: var(--ak-list-border-width);
        top: var(--ak-list-border-top);
        left: calc(
          var(--ak-list-item-marker-center) - var(--ak-list-border-width) / 2 +
            var(--ak-frame-padding)
        );
        height: calc(
          100% + max(0px, var(--ak-list-gap)) +
            max(var(--ak-list-gap), var(--ak-frame-padding)) -
            var(--ak-list-border-gap) - var(--ak-list-border-top)
        );
      }
      /* Make the final border segment match the content’s height */
      li:last-of-type > &::after,
      &:is(li):last-of-type::after {
        @apply from-(--ak-layer) bg-transparent bg-gradient-to-b from-[calc(100%-1rem)] to-transparent;
        height: calc(100% - var(--ak-list-border-top));
      }
    }"
  `);
});

test("findStyleDependency returns exact index matches only (no external)", () => {
  const util = findStyleDependency("ak-badge", "utility");
  expect(util).toEqual({ type: "utility", name: "ak-badge", module: "badge" });
  const variant = findStyleDependency("ak-command-disabled", "variant");
  expect(variant).toEqual({
    type: "variant",
    name: "ak-command-disabled",
    module: "command",
  });
  const none = findStyleDependency("ak-does-not-exist", "utility");
  expect(none).toBeNull();
});

test("getStyleDefinition returns exact definitions and wildcard fallback within module maps", () => {
  const exact = getStyleDefinition("ak-badge", "utility");
  expect(exact?.type).toBe("utility");
  // Wildcard lookup (utility): resolves to ak-badge-* definition
  const wildcardDef = getStyleDefinition("ak-badge-primary", "utility");
  expect(wildcardDef?.name).toBe("ak-badge-*");
  // at-property only matches exact
  const atPropExact = getStyleDefinition(
    "--ak-tab-border-width",
    "at-property",
  );
  expect(atPropExact?.name).toBe("--ak-tab-border-width");
  const atPropWildcard = getStyleDefinition(
    "--ak-tab-border-width-extra",
    "at-property",
  );
  expect(atPropWildcard).toBeNull();
});

test("resolveDependenciesForAkToken returns exact and most-specific wildcard", () => {
  // Token that should resolve to ak-badge-* (wildcard)
  const badgeWild = resolveDependenciesForAkToken("ak-badge-primary");
  expect(badgeWild).toEqual(
    expect.arrayContaining([
      { type: "utility", name: "ak-badge-*", module: "badge" },
    ]),
  );
  // Token that should pick the most specific among table border wildcards
  const table = resolveDependenciesForAkToken("ak-table-border-t-2");
  // ak-table-border-t-* should be preferred over ak-table-border-*
  expect(table).toEqual(
    expect.arrayContaining([
      { type: "utility", name: "ak-table-border-t-*", module: "table" },
    ]),
  );
  expect(
    table.some((d) => d.type === "utility" && d.name === "ak-table-border-*"),
  ).toBe(false);
  // Exact + wildcard both present should both appear
  const both = resolveDependenciesForAkToken("ak-badge");
  expect(both).toEqual(
    expect.arrayContaining([
      { type: "utility", name: "ak-badge", module: "badge" },
    ]),
  );
});

test("getTransitiveDependencies returns BFS dependencies, excluding root and deduped", () => {
  // ak-badge depends on ak-badge_base (internal)
  const root = { type: "utility" as const, name: "ak-badge", module: "badge" };
  const deps = getTransitiveDependencies(root);
  // Contains ak-badge_base
  expect(
    deps.some(
      (d) =>
        d.type === "utility" &&
        d.name === "ak-badge_base" &&
        d.module === "badge",
    ),
  ).toBe(true);
  // Does not include the root item
  expect(deps.some((d) => d.name === root.name && d.type === root.type)).toBe(
    false,
  );
});

test("resolveStylesForFiles aggregates base + transitive, deduped by identity", () => {
  const files = {
    "x.tsx": `
      <div className="ak-badge ak-badge-primary ak-table-border-t-2"></div>
    `,
  };
  const deps = resolveStylesForFiles(files);
  // Base exact and wildcard for badge
  expect(
    deps.some(
      (d) =>
        d.type === "utility" && d.name === "ak-badge" && d.module === "badge",
    ),
  ).toBe(true);
  expect(
    deps.some(
      (d) =>
        d.type === "utility" && d.name === "ak-badge-*" && d.module === "badge",
    ),
  ).toBe(true);
  // Table border specificity wildcard
  expect(
    deps.some(
      (d) =>
        d.type === "utility" &&
        d.name === "ak-table-border-t-*" &&
        d.module === "table",
    ),
  ).toBe(true);
  // Transitive dependency from ak-badge -> ak-badge_base
  expect(
    deps.some(
      (d) =>
        d.type === "utility" &&
        d.name === "ak-badge_base" &&
        d.module === "badge",
    ),
  ).toBe(true);
});
