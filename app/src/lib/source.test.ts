/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { expect, test } from "vitest";
import { getImportPaths, replaceImportPaths } from "./source.ts";

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

test("getImportPaths captures import type namespace", () => {
  const code = 'import type * as React from "react";';
  const paths = getImportPaths(code);
  expect(paths).toEqual(new Set(["react"]));
  const types = getImportPaths(code, (_p, t) => t === "import-type");
  expect(types).toEqual(new Set(["react"]));
});
