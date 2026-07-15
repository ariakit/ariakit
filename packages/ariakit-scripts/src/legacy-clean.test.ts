import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { cleanLegacyBuild } from "./legacy-clean.ts";

async function expectPathMissing(path: string) {
  await expect(access(path)).rejects.toMatchObject({ code: "ENOENT" });
}

test("removes legacy build output folders", async () => {
  const rootPath = await mkdtemp(join(tmpdir(), "ariakit-legacy-clean-"));

  try {
    await writeFile(
      join(rootPath, "package.json"),
      `${JSON.stringify(
        {
          name: "test-package",
          main: "cjs/index.cjs",
          module: "esm/index.js",
          types: "cjs/index.d.ts",
        },
        null,
        2,
      )}\n`,
    );

    const outputFolders = ["cjs", "esm", "button", "menu"];

    for (const folder of outputFolders) {
      await mkdir(join(rootPath, folder), { recursive: true });
      await writeFile(join(rootPath, folder, "index.js"), "export {};\n");
    }

    cleanLegacyBuild(rootPath, ["index", "button", "menu/menu"]);

    for (const folder of outputFolders) {
      await expectPathMissing(join(rootPath, folder));
    }

    const packageJson = JSON.parse(
      await readFile(join(rootPath, "package.json"), "utf-8"),
    );

    expect(packageJson.main).toBe("src/index.ts");
    expect(packageJson.module).toBe("src/index.ts");
    expect(packageJson.types).toBe("src/index.ts");
  } finally {
    await rm(rootPath, { recursive: true, force: true });
  }
});
