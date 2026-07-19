import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { TraceMap, originalPositionFor } from "@jridgewell/trace-mapping";
import { expect, test } from "vitest";
import { cleanPackage, updateSourcePackageJson } from "./build.ts";

const cliPath = join(import.meta.dirname, "index.ts");

function runBuild(rootPath: string, ...args: string[]) {
  const result = spawnSync(process.execPath, [cliPath, "build", ...args], {
    cwd: rootPath,
    encoding: "utf-8",
  });

  if (result.status === 0) {
    return result;
  }

  throw new Error(result.stderr || result.stdout);
}

function expectNoBrokenSourcemapWarning(result: ReturnType<typeof runBuild>) {
  expect(result.stderr).not.toContain("SOURCEMAP_BROKEN");
  expect(result.stdout).not.toContain("SOURCEMAP_BROKEN");
}

async function writeTsConfig(rootPath: string) {
  await writeFile(
    join(rootPath, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "es2018",
          module: "nodenext",
          moduleResolution: "nodenext",
          allowImportingTsExtensions: true,
          strict: true,
          skipLibCheck: true,
        },
        include: ["src"],
      },
      null,
      2,
    )}\n`,
  );
}

interface BuildFixtureOptions {
  name?: string;
  sources: Record<string, string>;
}

async function createBuildFixture({
  name = "test-package",
  sources,
}: BuildFixtureOptions) {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-build-"));
  const sourceRootPath = join(rootPath, "src");

  await mkdir(sourceRootPath, { recursive: true });
  await writeFile(
    join(rootPath, "package.json"),
    `${JSON.stringify({ name }, null, 2)}\n`,
  );
  await writeTsConfig(rootPath);

  for (const [filename, source] of Object.entries(sources)) {
    const sourcePath = join(sourceRootPath, filename);
    await mkdir(dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, source);
  }

  return rootPath;
}

async function expectPathMissing(path: string) {
  await expect(access(path)).rejects.toMatchObject({ code: "ENOENT" });
}

interface SourceMappingExpectation {
  jsPath: string;
  generatedText: string;
  sourceName: string;
  sourceLine: number;
  sourceColumn: number;
}

async function expectGeneratedLineToMapToSource({
  jsPath,
  generatedText,
  sourceName,
  sourceLine,
  sourceColumn,
}: SourceMappingExpectation) {
  const code = await readFile(jsPath, "utf-8");
  const sourceMap = JSON.parse(await readFile(`${jsPath}.map`, "utf-8"));
  const traceMap = new TraceMap(sourceMap);
  const generatedLines = code.split("\n");
  let generatedLineIndex = -1;
  let generatedColumn = -1;
  let matchCount = 0;

  for (const [index, line] of generatedLines.entries()) {
    const lineMatchCount = line.split(generatedText).length - 1;
    if (!lineMatchCount) continue;
    matchCount += lineMatchCount;
    generatedLineIndex = index;
    generatedColumn = line.indexOf(generatedText);
  }

  if (matchCount === 0) {
    throw new Error(`Missing ${generatedText} in generated output`);
  }
  if (matchCount > 1) {
    throw new Error(`Expected one ${generatedText} in generated output`);
  }

  const original = originalPositionFor(traceMap, {
    line: generatedLineIndex + 1,
    column: generatedColumn,
  });

  expect(original.source).toContain(sourceName);
  expect(original.line).toBe(sourceLine);
  expect(original.column).toBe(sourceColumn);
}

test("omits npm ignored source files from package exports", async () => {
  const rootPath = await createBuildFixture({
    sources: {
      "index.ts": "export {};\n",
      "widget.test.ts": "export {};\n",
      "button/button.ts": "export {};\n",
      "button/button.test.ts": "export {};\n",
      "button/__tests__/button.ts": "export {};\n",
      "button.config.ts": "export {};\n",
      "test.ts": "export {};\n",
    },
  });

  try {
    await updateSourcePackageJson(rootPath);

    const packageJson = JSON.parse(
      await readFile(join(rootPath, "package.json"), "utf-8"),
    );

    expect(packageJson.exports).toEqual({
      ".": "./src/index.ts",
      "./button/button": "./src/button/button.ts",
      "./package.json": "./package.json",
    });
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});

test("clean removes current and legacy build output", async () => {
  const rootPath = await createBuildFixture({
    sources: {
      "index.ts": "export {};\n",
      "button.ts": "export {};\n",
    },
  });

  try {
    await writeFile(
      join(rootPath, "package.json"),
      `${JSON.stringify(
        {
          name: "test-package",
          main: "cjs/index.cjs",
          module: "esm/index.js",
          types: "cjs/index.d.ts",
          exports: {
            ".": {
              import: "./esm/index.js",
              require: "./cjs/index.cjs",
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    const outputFolders = ["dist", "cjs", "esm", "button"];

    for (const folder of outputFolders) {
      await mkdir(join(rootPath, folder), { recursive: true });
      await writeFile(join(rootPath, folder, "index.js"), "export {};\n");
    }

    await cleanPackage(rootPath);

    for (const folder of outputFolders) {
      await expectPathMissing(join(rootPath, folder));
    }

    const packageJson = JSON.parse(
      await readFile(join(rootPath, "package.json"), "utf-8"),
    );

    expect(packageJson).toMatchObject({
      main: "src/index.ts",
      module: "src/index.ts",
      types: "src/index.ts",
      exports: {
        ".": "./src/index.ts",
        "./button": "./src/button.ts",
        "./package.json": "./package.json",
      },
    });
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});

test("uses a sourcemap-aware banner for React packages", async () => {
  const rootPath = await createBuildFixture({
    name: "@ariakit/react-test",
    sources: {
      "index.ts": [
        'import { sharedValue } from "./__shared.ts";',
        "",
        "export function indexValue() {",
        "  return sharedValue();",
        "}",
        "",
      ].join("\n"),
      "button.ts": [
        'import { sharedValue } from "./__shared.ts";',
        "",
        "export function buttonValue() {",
        "  return sharedValue();",
        "}",
        "",
      ].join("\n"),
      "__shared.ts": "export function sharedValue() {\n  return 1;\n}\n",
    },
  });

  try {
    const result = runBuild(rootPath);

    expectNoBrokenSourcemapWarning(result);

    const indexPath = join(rootPath, "dist/index.js");
    const buttonPath = join(rootPath, "dist/button.js");
    const indexCode = await readFile(indexPath, "utf-8");
    const buttonCode = await readFile(buttonPath, "utf-8");
    const chunkNames = (await readdir(join(rootPath, "dist/__chunks"))).filter(
      (name) => name.endsWith(".js"),
    );
    const chunkName = chunkNames[0];

    expect(indexCode.startsWith('"use client";\n')).toBe(true);
    expect(buttonCode.startsWith('"use client";\n')).toBe(true);
    expect(chunkNames).toHaveLength(1);
    if (!chunkName) {
      throw new Error("Missing shared chunk");
    }

    const chunkPath = join(rootPath, "dist/__chunks", chunkName);
    const chunkCode = await readFile(chunkPath, "utf-8");

    expect(chunkCode.startsWith('"use client";\n')).toBe(true);

    await expectGeneratedLineToMapToSource({
      jsPath: indexPath,
      generatedText: "return sharedValue()",
      sourceName: "index.ts",
      sourceLine: 4,
      sourceColumn: 2,
    });
    await expectGeneratedLineToMapToSource({
      jsPath: buttonPath,
      generatedText: "return sharedValue()",
      sourceName: "button.ts",
      sourceLine: 4,
      sourceColumn: 2,
    });
    await expectGeneratedLineToMapToSource({
      jsPath: chunkPath,
      generatedText: "return 1",
      sourceName: "__shared.ts",
      sourceLine: 2,
      sourceColumn: 2,
    });
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});

test("uses a sourcemap-aware banner for index-only React packages", async () => {
  const rootPath = await createBuildFixture({
    name: "@ariakit/react-test",
    sources: {
      "index.ts": "export function value() {\n  return 1;\n}\n",
    },
  });

  try {
    const result = runBuild(rootPath, "--index-only");

    expectNoBrokenSourcemapWarning(result);

    const indexPath = join(rootPath, "dist/index.js");
    const indexCode = await readFile(indexPath, "utf-8");

    expect(indexCode.startsWith('"use client";\n')).toBe(true);
    await expectGeneratedLineToMapToSource({
      jsPath: indexPath,
      generatedText: "return 1",
      sourceName: "index.ts",
      sourceLine: 2,
      sourceColumn: 2,
    });
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});

test("omits the use client banner for non-React packages", async () => {
  const rootPath = await createBuildFixture({
    sources: {
      "index.ts": "export function value() {\n  return 1;\n}\n",
    },
  });

  try {
    const result = runBuild(rootPath);

    expectNoBrokenSourcemapWarning(result);

    const indexPath = join(rootPath, "dist/index.js");
    const indexCode = await readFile(indexPath, "utf-8");

    expect(indexCode.startsWith('"use client";\n')).toBe(false);
    await expectGeneratedLineToMapToSource({
      jsPath: indexPath,
      generatedText: "return 1",
      sourceName: "index.ts",
      sourceLine: 2,
      sourceColumn: 2,
    });
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});

test("includes build output in published packages", async () => {
  const rootPath = await createBuildFixture({
    sources: {
      "index.ts": "export {};\n",
    },
  });

  try {
    runBuild(rootPath);

    const npmignore = await readFile(join(rootPath, ".npmignore"), "utf-8");

    // Pinned because this file decides what ships. Any entry matching dist
    // would publish packages whose exports point at missing files.
    expect(npmignore).toBe(
      [
        "# Automatically generated",
        "coverage",
        "benchmark",
        "src/test.ts",
        "src/**/*.test.*",
        "src/**/__tests__/**",
        "tsconfig*.json",
        "*.log",
        "*.config.*",
        "*.lock",
        "",
      ].join("\n"),
    );
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});
