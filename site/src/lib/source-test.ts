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
  getImportPaths,
  hoistImports,
  mergeFiles,
  mergeImports,
  replaceImportPaths,
} from "./source.ts";
import type { StyleDependency } from "./styles.ts";

test("getImportPaths extracts from import/export and dynamic imports", () => {
  const code = [
    'import "side-effect";',
    'import * as ns from "ns";',
    'import def from "def";',
    'import { named } from "named";',
    'import { named, type T } from "named-type";',
    'import type { T } from "type";',
    "export { exportNamed } from 'export-named';",
    'export { exportNamed, type ExportT } from "export-named-type";',
    "export * from 'export-all';",
    'await import("import-dynamic");',
    "await import(`import-dynamic-template`);",
  ].join("\n");
  const all = getImportPaths(code);
  expect(all).toEqual(
    new Set([
      "side-effect",
      "ns",
      "def",
      "named",
      "named-type",
      "type",
      "export-named",
      "export-named-type",
      "export-all",
      "import-dynamic",
      "import-dynamic-template",
    ]),
  );
  const onlyImport = getImportPaths(code, (_p, t) => t === "import");
  expect(onlyImport).toEqual(
    new Set(["side-effect", "ns", "def", "named", "named-type"]),
  );
  const onlyType = getImportPaths(code, (_p, t) => t === "import-type");
  expect(onlyType).toEqual(new Set(["type", "named-type"]));
  const onlyExport = getImportPaths(code, (_p, t) => t === "export");
  expect(onlyExport).toEqual(new Set(["export-named", "export-named-type"]));
  const onlyExportAll = getImportPaths(code, (_p, t) => t === "export-all");
  expect(onlyExportAll).toEqual(new Set(["export-all"]));
  const onlyDynamic = getImportPaths(code, (_p, t) => t === "import-dynamic");
  expect(onlyDynamic).toEqual(
    new Set(["import-dynamic", "import-dynamic-template"]),
  );
});

test("getImportPaths does not capture interpolated template literals", () => {
  expect(getImportPaths(`await import(\`e/\${x}\`);`)).toEqual(new Set([]));
});

test("replaceImportPaths passes import type to replacer", () => {
  const code = [
    'import "side-effect";',
    'import * as ns from "ns";',
    'import def from "def";',
    'import { named } from "named";',
    'import { named, type T } from "named-type";',
    'import type { T } from "type";',
    "export { exportNamed } from 'export-named';",
    'export { exportNamed, type ExportT } from "export-named-type";',
    "export * from 'export-all';",
    'await import("import-dynamic");',
    "await import(`import-dynamic-template`);",
  ].join("\n");
  const out = replaceImportPaths(code, (p, t) => `${t}:${p}`);
  expect(out).toMatchInlineSnapshot(`
    "import "import:side-effect";
    import * as ns from "import:ns";
    import def from "import:def";
    import { named } from "import:named";
    import { named, type T } from "import:named-type";
    import type { T } from "import-type:type";
    export { exportNamed } from 'export:export-named';
    export { exportNamed, type ExportT } from "export:export-named-type";
    export * from 'export-all:export-all';
    await import("import-dynamic:import-dynamic");
    await import(\`import-dynamic:import-dynamic-template\`);"
  `);
});

test("replaceImportPaths preserves quotes and shapes", () => {
  const code = [
    'import "side-effect";',
    'import * as ns from "ns";',
    'import def from "def";',
    'import { named } from "named";',
    'import { named, type T } from "named-type";',
    'import type { T } from "type";',
    "export { exportNamed } from 'export-named';",
    'export { exportNamed, type ExportT } from "export-named-type";',
    "export * from 'export-all';",
    'await import("import-dynamic");',
    "await import(`import-dynamic-template`);",
  ].join("\n");
  expect(replaceImportPaths(code, (p) => `@/${p}`)).toMatchInlineSnapshot(`
    "import "@/side-effect";
    import * as ns from "@/ns";
    import def from "@/def";
    import { named } from "@/named";
    import { named, type T } from "@/named-type";
    import type { T } from "@/type";
    export { exportNamed } from '@/export-named';
    export { exportNamed, type ExportT } from "@/export-named-type";
    export * from '@/export-all';
    await import("@/import-dynamic");
    await import(\`@/import-dynamic-template\`);"
  `);
});

test("mergeImports dedupes named and splits type-only per file", () => {
  const code = [
    'import type { T } from "./x";',
    'import { A, B } from "./x";',
    'import { C, type U } from "./x";',
    "",
    "export const a = A + C;",
  ].join("\n");
  expect(mergeImports(code, (p) => p)).toMatchInlineSnapshot(`
    "import type { T, U } from "./x";
    import { A, B, C } from "./x";

    export const a = A + C;"
  `);
});

test("mergeImports sorts type imports first", () => {
  const code = [
    'import { A, B } from "./x";',
    'import type { T } from "./x";',
    'import { C, type U } from "./x";',
    "export const a = A + C;",
  ].join("\n");
  expect(mergeImports(code, (p) => p)).toMatchInlineSnapshot(`
    "import type { T, U } from "./x";
    import { A, B, C } from "./x";
    export const a = A + C;"
  `);
});

test("mergeImports merges imports across multiple files", () => {
  const code = [
    'import { A, B } from "./a";',
    'import type { T } from "./b";',
    'import { C, type U } from "./c";',
    "export const a = A + C;",
    "",
  ].join("\n");
  expect(mergeImports(code, () => "x")).toMatchInlineSnapshot(`
    "import type { T, U } from "x";
    import { A, B, C } from "x";
    export const a = A + C;
    "
  `);
});

test("mergeImports filters imports", () => {
  const code = [
    'import { A } from "./a";',
    'import { B, C } from "./utils/bc";',
    'import { type T, D } from "./utils/d";',
    'import type { U } from "./utils/e";',
    "const a = A + C;",
    "",
  ].join("\n");
  expect(
    mergeImports(code, (p) =>
      p.startsWith("./utils/") ? "./utils.ts" : false,
    ),
  ).toMatchInlineSnapshot(`
    "import { A } from "./a";
    import type { T, U } from "./utils.ts";
    import { B, C, D } from "./utils.ts";
    const a = A + C;
    "
  `);
});

test("mergeImports ignores specific imports", () => {
  const code = [
    'import "side-effect";',
    'import * as ns from "ns";',
    'import def from "def";',
    'import { named } from "named";',
    'import { type T, named } from "named-type";',
    'import type { T } from "type";',
    "const a = A + C;",
    "",
  ].join("\n");
  expect(mergeImports(code, () => "x")).toMatchInlineSnapshot(`
    "import "side-effect";
    import * as ns from "ns";
    import def from "def";
    import type { T } from "x";
    import { named } from "x";
    const a = A + C;
    "
  `);
});

test("mergeFiles removes internal imports between merged files", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: [
        'import { b } from "./b";',
        "",
        "// comment",
        "export function a() {",
        "  return b + 1;",
        "}",
        "",
      ].join("\n"),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: ["export const b = 1;", ""].join("\n"),
    },
  };
  const merged = mergeFiles(files);
  expect(Object.keys(merged)).toEqual(["/path/to/utils.ts"]);
  expect(merged["/path/to/utils.ts"]?.id).toEqual("/path/to/utils.ts");
  expect(merged["/path/to/utils.ts"]?.content).toMatchInlineSnapshot(`
    "export const b = 1;

    // comment
    export function a() {
      return b + 1;
    }
    "
  `);
});

test("mergeFiles transforms imports on non-merged files", () => {
  const files = {
    "/path/to/c/d.ts": {
      id: "/path/to/c/d.ts",
      content: [
        'import { a } from "../utils/a";',
        'import { b } from "../utils/b.ts";',
        "",
        "export const foo = a + b;",
        "",
      ].join("\n"),
    },
    "/path/to/e.ts": {
      id: "/path/to/e.ts",
      content: [
        'import { a } from "./utils/a";',
        'import { b } from "./utils/b.ts";',
        "",
        "export const foo = a + b;",
        "",
      ].join("\n"),
    },
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: [
        'import { b } from "./b";',
        "",
        "// comment",
        "export function a() {",
        "  return b + 1;",
        "}",
        "",
      ].join("\n"),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: ["export const b = 1;", ""].join("\n"),
    },
  };
  const merged = mergeFiles(files, (path) => {
    if (!path.startsWith("/path/to/utils/")) return false;
    return "/path/to/utils.ts";
  });
  expect(Object.keys(merged)).toEqual([
    "/path/to/c/d.ts",
    "/path/to/e.ts",
    "/path/to/utils.ts",
  ]);
  expect(merged["/path/to/c/d.ts"]?.id).toEqual("/path/to/c/d.ts");
  expect(merged["/path/to/c/d.ts"]?.content).toMatchInlineSnapshot(`
    "import { a, b } from "../utils.ts";

    export const foo = a + b;
    "
  `);
  expect(merged["/path/to/e.ts"]?.id).toEqual("/path/to/e.ts");
  expect(merged["/path/to/e.ts"]?.content).toMatchInlineSnapshot(`
    "import { a, b } from "./utils.ts";

    export const foo = a + b;
    "
  `);
  expect(merged["/path/to/utils.ts"]?.id).toEqual("/path/to/utils.ts");
  expect(merged["/path/to/utils.ts"]?.content).toMatchInlineSnapshot(`
    "export const b = 1;

    // comment
    export function a() {
      return b + 1;
    }
    "
  `);
});

test("mergeFiles merges styles with deduplicated union", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: [
        'import { b } from "./b";',
        "",
        "export function a() {",
        "  return b + 1;",
        "}",
        "",
      ].join("\n"),
      styles: [
        { type: "utility", name: "ak-foo" },
        { type: "variant", name: "ak-bar" },
      ] satisfies StyleDependency[],
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: ["export const b = 1;", ""].join("\n"),
      styles: [
        { type: "utility", name: "ak-foo" },
        { type: "utility", name: "ak-baz" },
      ] satisfies StyleDependency[],
    },
  };
  const merged = mergeFiles(files);
  const utils = merged["/path/to/utils.ts"];
  expect(utils?.styles).toEqual([
    { type: "utility", name: "ak-foo" },
    { type: "variant", name: "ak-bar" },
    { type: "utility", name: "ak-baz" },
  ]);
});

test("mergeFiles rewrites type-only imports on non-merged files", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: [
        "export type T = { a: number };",
        "export const a = 1;",
        "",
      ].join("\n"),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: [
        "export type U = { b: number };",
        "export const b = 2;",
        "",
      ].join("\n"),
    },
    "/path/to/e.ts": {
      id: "/path/to/e.ts",
      content: [
        'import type { T } from "./utils/a";',
        'import type { U } from "./utils/b";',
        "",
        "export const x: T | U = {} as any;",
        "",
      ].join("\n"),
    },
  };
  const merged = mergeFiles(files);
  expect(merged["/path/to/utils.ts"]?.content).toMatchInlineSnapshot(`
    "export type T = { a: number };
    export const a = 1;

    export type U = { b: number };
    export const b = 2;
    "
  `);
  expect(merged["/path/to/e.ts"]?.content).toMatchInlineSnapshot(`
    "import type { T, U } from "./utils.ts";

    export const x: T | U = {} as any;
    "
  `);
});

test("mergeFiles throws on internal namespace imports", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: [
        'import * as ns from "./b";',
        "",
        "export const x = ns;",
        "",
      ].join("\n"),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: ["export const b = 1;", ""].join("\n"),
    },
  };
  expect(() => mergeFiles(files)).toThrow(
    'Namespace imports from internal files are not supported: "./b"',
  );
});

test("mergeFiles removes default internal imports", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: ['import def from "./b";', "", "export const x = def;", ""].join(
        "\n",
      ),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: [
        "const def = 1;",
        "export default def;",
        "export const B = 2;",
        "",
      ].join("\n"),
    },
  };
  const merged = mergeFiles(files);
  expect(merged["/path/to/utils.ts"]?.content).toMatchInlineSnapshot(`
    "const def = 1;
    export default def;
    export const B = 2;

    export const x = def;
    "
  `);
});

test("mergeFiles falls back to lexicographic order on cycles", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: ['import { b } from "./b";', "export const a = b + 1;", ""].join(
        "\n",
      ),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: ['import { a } from "./a";', "export const b = a + 1;", ""].join(
        "\n",
      ),
    },
  };
  const merged = mergeFiles(files);
  expect(merged["/path/to/utils.ts"]?.content).toMatchInlineSnapshot(`
    "export const a = b + 1;

    export const b = a + 1;
    "
  `);
});

test("mergeFiles hoists external imports", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: [
        'import { ext } from "external";',
        'import { b } from "./b";',
        "",
        "export const a = b + ext;",
        "",
      ].join("\n"),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: [
        'import { other } from "other";',
        "",
        "export const b = other;",
        "",
      ].join("\n"),
    },
  };
  const merged = mergeFiles(files);
  expect(merged["/path/to/utils.ts"]?.content).toMatchInlineSnapshot(`
    "import { ext } from "external";
    import { other } from "other";

    export const b = other;

    export const a = b + ext;
    "
  `);
});

test("hoistImports hoists import type namespace", () => {
  const code = [
    'import type * as React from "react";',
    "export const a = 1;",
  ].join("\n");
  expect(hoistImports(code)).toBe(
    'import type * as React from "react";\n\nexport const a = 1;',
  );
});

test("mergeFiles hoists and merges namespace imports", () => {
  const files = {
    "/path/to/utils/a.ts": {
      id: "/path/to/utils/a.ts",
      content: [
        'import * as React from "react";',
        "",
        "export const a = React.createElement('div');",
        "",
      ].join("\n"),
    },
    "/path/to/utils/b.ts": {
      id: "/path/to/utils/b.ts",
      content: [
        'import type * as React from "react";',
        "",
        "export type B = React.ReactNode;",
        "",
      ].join("\n"),
    },
  };
  const merged = mergeFiles(files);
  expect(merged["/path/to/utils.ts"]?.content).toMatchInlineSnapshot(`
    "import * as React from "react";

    export const a = React.createElement('div');

    export type B = React.ReactNode;
    "
  `);
});

test("getImportPaths captures import type namespace", () => {
  const code = 'import type * as React from "react";';
  const paths = getImportPaths(code);
  expect(paths).toEqual(new Set(["react"]));
  const types = getImportPaths(code, (_p, t) => t === "import-type");
  expect(types).toEqual(new Set(["react"]));
});

test("mergeImports handles specifiers containing 'from' substring", () => {
  const code = [
    'import { transformFrom, convertFromJSON } from "./utils";',
    'import { fromDate, type FromConfig } from "./date";',
    "",
    "export const x = transformFrom(fromDate);",
  ].join("\n");
  expect(mergeImports(code, (p) => p)).toMatchInlineSnapshot(`
    "import type { FromConfig } from "./date";
    import { fromDate } from "./date";
    import { convertFromJSON, transformFrom } from "./utils";

    export const x = transformFrom(fromDate);"
  `);
});
