import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { updateSourcePackageJson } from "./build.ts";

test("omits npm ignored source files from package exports", async () => {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-build-"));

  try {
    await mkdir(join(rootPath, "src/button/__tests__"), { recursive: true });
    await writeFile(
      join(rootPath, "package.json"),
      `${JSON.stringify({ name: "test-package" }, null, 2)}\n`,
    );
    await writeFile(join(rootPath, "src/index.ts"), "export {};\n");
    await writeFile(join(rootPath, "src/widget.test.ts"), "export {};\n");
    await writeFile(join(rootPath, "src/button/button.ts"), "export {};\n");
    await writeFile(
      join(rootPath, "src/button/button.test.ts"),
      "export {};\n",
    );
    await writeFile(
      join(rootPath, "src/button/__tests__/button.ts"),
      "export {};\n",
    );
    await writeFile(join(rootPath, "src/button.config.ts"), "export {};\n");
    await writeFile(join(rootPath, "src/test.ts"), "export {};\n");

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
