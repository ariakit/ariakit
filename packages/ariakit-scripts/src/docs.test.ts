import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";
import {
  generateDocsMarkdown,
  getDocsMarkers,
  injectDocsMarkdown,
} from "./docs.ts";

const roots: string[] = [];

function createPackage() {
  const root = mkdtempSync(join(tmpdir(), "ariakit-docs-"));
  roots.push(root);

  writeFileSync(
    join(root, "tsconfig.node.json"),
    JSON.stringify({
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        target: "ESNext",
      },
      include: ["src"],
    }),
  );
  mkdirSync(join(root, "src"));

  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

test("generates markdown from exported JSDoc and TypeScript declarations", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(
    join(sourcePath, "index.ts"),
    [
      'export * from "./facade.ts";',
      'export { add } from "./math.ts";',
      "",
    ].join("\n"),
  );
  writeFileSync(join(sourcePath, "facade.ts"), 'export * from "./math.ts";\n');
  writeFileSync(
    join(sourcePath, "math.ts"),
    [
      "/**",
      " * Math helpers.",
      " * @module Math utilities",
      " */",
      "",
      "/**",
      " * Adds two numbers.",
      " * @example",
      " * add(1, 2); // 3",
      " */",
      "export function add(a: number, b: number) {",
      "  return a + b;",
      "}",
      "",
      "/**",
      " * Subtracts two numbers.",
      " * @example",
      " * ```ts",
      " * subtract(2, 1);",
      " * ```",
      " */",
      "export function subtract(a: number, b: number) {",
      "  return a - b;",
      "}",
      "",
      "/** User name. */",
      "export type UserName = string;",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("## API reference");
  expect(markdown).toContain("- [Math utilities](#math-utilities)");
  // Members are nested under their module in the table of contents.
  expect(markdown).toContain("  - [`add`](#add)");
  expect(markdown).toContain("### Math utilities");
  expect(markdown).toContain("Math helpers.");
  expect(markdown).toContain("#### `add`");
  expect(markdown).toContain("function add(a: number, b: number): number;");
  expect(markdown).toContain("Adds two numbers.");
  expect(markdown).toContain("add(1, 2); // 3");
  expect(markdown.match(/#### `add`/g)).toHaveLength(1);
  expect(markdown).toContain("#### `subtract`");
  expect(markdown).toContain("```ts\nsubtract(2, 1);\n```");
  expect(markdown).not.toContain("```ts\n```ts");
  expect(markdown).toContain("#### `UserName`");
  expect(markdown).not.toContain("| Utility");
});

test("lists members at the top level when modules are missing", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
      "/** Bar helper. */",
      "export function bar() {",
      "  return false;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  // Without modules, members are listed at the top level of the table of
  // contents and sit one level below the section heading.
  expect(markdown).toContain("- [`foo`](#foo)");
  expect(markdown).toContain("- [`bar`](#bar)");
  expect(markdown).toContain("### `foo`");
  expect(markdown).not.toContain("#### `foo`");
  expect(markdown).not.toContain("- [Foo exports]");
  expect(markdown).not.toContain("### Foo exports");
});

test("omits the table of contents for a single member", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  // A single entry has nothing to navigate, so no table of contents is added.
  expect(markdown).toContain("### `foo`");
  expect(markdown).not.toContain("- [`foo`](#foo)");
});

test("disambiguates contents links for case-only slug collisions", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Wraps a value. */",
      "export function wrapValue() {",
      "  return true;",
      "}",
      "",
      "/** Wrapped value type. */",
      "export type WrapValue = boolean;",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  // `wrapValue` and `WrapValue` share the `wrapvalue` slug, so the second link
  // gets GitHub's `-1` suffix to match the anchor of the second heading.
  expect(markdown).toContain("- [`wrapValue`](#wrapvalue)");
  expect(markdown).toContain("- [`WrapValue`](#wrapvalue-1)");
});

test("probes past taken suffixes when building contents links", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(
    join(sourcePath, "index.ts"),
    ['export * from "./a.ts";', 'export * from "./b.ts";', ""].join("\n"),
  );
  writeFileSync(
    join(sourcePath, "a.ts"),
    [
      "/**",
      " * First group.",
      " * @module Value",
      " */",
      "",
      "/** A value. */",
      "export function value() {",
      "  return 1;",
      "}",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(sourcePath, "b.ts"),
    [
      "/**",
      " * Second group.",
      " * @module Value 1",
      " */",
      "",
      "/** Another value. */",
      "export function other() {",
      "  return 2;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  // Headings slug to `value`, then `value-1` (the member), then `value-1` again
  // (the "Value 1" module), which GitHub resolves to `value-1-1` by probing
  // past the taken suffix. The contents links must follow the same assignment.
  expect(markdown).toContain("- [Value](#value)");
  expect(markdown).toContain("  - [`value`](#value-1)");
  expect(markdown).toContain("- [Value 1](#value-1-1)");
});

test("uses later JSDoc descriptions after tag-only blocks", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** @deprecated Use bar instead. */",
      "/**",
      " * The real description.",
      " */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("The real description.");
});

test("groups untagged exports separately when modules are present", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(
    join(sourcePath, "index.ts"),
    ['export * from "./foo.ts";', 'export * from "./bar.ts";', ""].join("\n"),
  );
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/**",
      " * Foo helpers.",
      " * @module Foo utilities",
      " */",
      "",
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(sourcePath, "bar.ts"),
    [
      "/** Bar helper. */",
      "export function bar() {",
      "  return false;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("- [Foo utilities](#foo-utilities)");
  expect(markdown).toContain("- [Other exports](#other-exports)");
  expect(markdown).toContain("### Foo utilities");
  expect(markdown).toContain("### Other exports");
  expect(markdown).toContain("#### `foo`");
  expect(markdown).toContain("#### `bar`");
});

test("injects generated markdown into a readme", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/**",
      " * Foo helper.",
      " * @example",
      ' * const price = "$$50";',
      ' * const replacement = "$&";',
      " */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(root, "readme.md"),
    [
      "# Test",
      "",
      "<!-- ariakit-docs:start -->",
      "Old docs",
      "<!-- ariakit-docs:end -->",
      "",
    ].join("\n"),
  );

  injectDocsMarkdown({ rootPath: root });

  const readme = readFileSync(join(root, "readme.md"), "utf-8");
  expect(readme).toContain("<!-- ariakit-docs:start -->");
  expect(readme).toContain("<!-- ariakit-docs:end -->");
  expect(readme).toContain("### `foo`");
  expect(readme).toContain("Foo helper.");
  expect(readme).toContain('const price = "$$50";');
  expect(readme).toContain('const replacement = "$&";');
  expect(readme).not.toContain("Old docs");
});

test("appends generated markdown to a readme without markers", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );
  writeFileSync(join(root, "readme.md"), ["# Test", ""].join("\n"));

  injectDocsMarkdown({ rootPath: root });

  const readme = readFileSync(join(root, "readme.md"), "utf-8");
  expect(readme).toContain("# Test");
  expect(readme).toContain("<!-- ariakit-docs:start -->");
  expect(readme).toContain("### `foo`");
  expect(readme).toContain("<!-- ariakit-docs:end -->");
});

test("includes local private types referenced by public signatures", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./value.ts";\n');
  writeFileSync(
    join(sourcePath, "value.ts"),
    [
      "/**",
      " * Value helpers.",
      " * @module Value utilities",
      " */",
      "",
      "type T = string;",
      "",
      "type $Value<T> = T | undefined;",
      "",
      "interface Options {",
      "  value?: $Value<string>;",
      "}",
      "",
      "/** Creates a value. */",
      "export function createValue<T>(",
      "  { value }: Options = {},",
      "): $Value<T> {",
      "  return value as $Value<T>;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("type $Value<T> = T | undefined;");
  expect(markdown).not.toContain("type T = string;");
  expect(markdown).toContain("interface Options");
  expect(markdown).toContain("value?: $Value<string>;");
  expect(markdown).toContain(
    "function createValue<T>({ value }: Options = {}): $Value<T>;",
  );
});

test("does not include private types shadowed by type parameters", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./value.ts";\n');
  writeFileSync(
    join(sourcePath, "value.ts"),
    [
      "type T = string;",
      "",
      "/** Generic value. */",
      "export type Value<T> = {",
      "  value: T;",
      "};",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("type Value<T> = {");
  expect(markdown).not.toContain("type T = string;");
});

test("includes private types referenced by non-generic overloads", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./value.ts";\n');
  writeFileSync(
    join(sourcePath, "value.ts"),
    [
      "type T = string;",
      "",
      "/** Gets a value. */",
      "export function getValue<T>(value: T): T;",
      "export function getValue(): T;",
      "export function getValue(value?: unknown) {",
      "  return value;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("type T = string;");
  expect(markdown).toContain("function getValue<T>(value: T): T;");
  expect(markdown).toContain("function getValue(): T;");
});

test("truncates oversized TypeScript declarations", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  const roleValues = Array.from({ length: 35 }, (_, index) => {
    const suffix = index === 34 ? ";" : "";
    return `  | "item-${index + 1}"${suffix}`;
  });

  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./roles.ts";\n');
  writeFileSync(
    join(sourcePath, "roles.ts"),
    [
      "/**",
      " * Role helpers.",
      " * @module Role utilities",
      " */",
      "",
      "/** Supported role names. */",
      "export type Role =",
      ...roleValues,
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("#### `Role`");
  expect(markdown).toContain("type Role =");
  expect(markdown).toContain('  | "item-1"');
  expect(markdown).toContain("// ...");
  expect(markdown).toContain('  | "item-35";');
  expect(markdown).not.toContain('  | "item-20"');
  expect(markdown).toContain("Supported role names.");
});

test("throws on partial readme markers", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(root, "readme.md"),
    ["# Test", "", "<!-- ariakit-docs:start -->", ""].join("\n"),
  );

  expect(() => injectDocsMarkdown({ rootPath: root })).toThrow(
    "must be present",
  );
});

test("applies a custom heading", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root, heading: "Foo API" });

  expect(markdown).toContain("## Foo API");
  expect(markdown).not.toContain("## API reference");
});

test("adds a back-to-top link to the section heading after each member", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root, heading: "Foo API" });

  // The link targets the section heading slug, not the member.
  expect(markdown).toContain('<div align="right">');
  expect(markdown).toContain('<a href="#foo-api">&uarr; back to top</a>');
});

test("excludes exports re-exported from another file", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(
    join(sourcePath, "base.ts"),
    [
      "/** Base helper. */",
      "export function base() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(sourcePath, "extra.ts"),
    [
      'export * from "./base.ts";',
      "",
      "/** Extra helper. */",
      "export function extra() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({
    rootPath: root,
    entry: "src/extra.ts",
    exclude: ["src/base.ts"],
  });

  expect(markdown).toContain("### `extra`");
  expect(markdown).not.toContain("### `base`");
});

test("throws when an exclude entry cannot be resolved", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(
    join(sourcePath, "index.ts"),
    ["/** Foo helper. */", "export function foo() {}", ""].join("\n"),
  );

  expect(() =>
    generateDocsMarkdown({ rootPath: root, exclude: ["src/missing.ts"] }),
  ).toThrow('Could not resolve --exclude entry "src/missing.ts"');
});

test("renders examples that contain fenced code blocks as-is", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/**",
      " * Foo helper.",
      " * @example",
      " * Using foo:",
      " * ```js",
      " * foo();",
      " * ```",
      " */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );

  const markdown = generateDocsMarkdown({ rootPath: root });

  expect(markdown).toContain("Using foo:");
  expect(markdown).toContain("```js");
  // The prose + fenced block must not be wrapped in another code fence.
  expect(markdown).not.toContain("```ts\nUsing foo:");
});

test("injects into a named marker block and leaves others untouched", () => {
  const root = createPackage();
  const sourcePath = join(root, "src");
  writeFileSync(join(sourcePath, "index.ts"), 'export * from "./foo.ts";\n');
  writeFileSync(
    join(sourcePath, "foo.ts"),
    [
      "/** Foo helper. */",
      "export function foo() {",
      "  return true;",
      "}",
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(root, "readme.md"),
    [
      "# Test",
      "",
      "<!-- ariakit-docs:start -->",
      "<!-- ariakit-docs:end -->",
      "",
      "<!-- ariakit-docs:start extra -->",
      "<!-- ariakit-docs:end extra -->",
      "",
    ].join("\n"),
  );

  injectDocsMarkdown({ rootPath: root, marker: "extra", heading: "Extra API" });

  const readme = readFileSync(join(root, "readme.md"), "utf-8");
  const { start, end } = getDocsMarkers("extra");
  const extraBlock = readme.slice(
    readme.indexOf(start) + start.length,
    readme.indexOf(end),
  );

  expect(extraBlock).toContain("## Extra API");
  expect(extraBlock).toContain("### `foo`");
  // The default block is left empty because it was not targeted.
  expect(readme).toContain(
    "<!-- ariakit-docs:start -->\n<!-- ariakit-docs:end -->",
  );
});

interface DocsTarget {
  entry?: string;
  marker?: string;
  heading?: string;
  exclude?: string[];
}

const docsPackages: Array<{ dir: string; targets: DocsTarget[] }> = [
  { dir: "ariakit-utils", targets: [{}] },
  { dir: "ariakit-react-utils", targets: [{}] },
  { dir: "ariakit-store", targets: [{}] },
  { dir: "ariakit-react-store", targets: [{ entry: "src/index.tsx" }] },
  { dir: "ariakit-solid-utils", targets: [{}] },
  { dir: "ariakit-solid-store", targets: [{}] },
  {
    dir: "ariakit-test",
    targets: [
      {},
      {
        entry: "src/react.tsx",
        marker: "react",
        heading: "React API reference",
        exclude: ["src/index.ts"],
      },
      {
        entry: "src/playwright.ts",
        marker: "playwright",
        heading: "Playwright API reference",
        exclude: ["@playwright/test"],
      },
    ],
  },
];

// Generated React signatures depend on the installed React types (e.g.
// `RefObject` vs `MutableRefObject`), so the committed readmes are only
// canonical under the repo's React version. Skip this check on the older
// React 18 test run, where regeneration would infer different signatures.
const reactMajor = Number.parseInt(
  createRequire(import.meta.url)("react/package.json").version,
  10,
);

test.skipIf(reactMajor < 19).each(docsPackages)(
  "$dir readme docs are up to date",
  ({ dir, targets }) => {
    const root = join(process.cwd(), "packages", dir);
    const readme = readFileSync(join(root, "readme.md"), "utf-8");

    for (const target of targets) {
      const { start, end } = getDocsMarkers(target.marker);
      const startIndex = readme.indexOf(start);
      const endIndex = readme.indexOf(end);
      const markdown = generateDocsMarkdown({
        rootPath: root,
        ...target,
      }).trimEnd();
      const readmeMarkdown = readme
        .slice(startIndex + start.length, endIndex)
        .trim();

      expect(startIndex).toBeGreaterThanOrEqual(0);
      expect(endIndex).toBeGreaterThan(startIndex);
      expect(readmeMarkdown).toBe(markdown);
    }
  },
);
