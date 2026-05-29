import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { q } from "@ariakit/test";
import { render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createElement } from "react";
import { afterAll, beforeAll, expect, test } from "vitest";

let tempDir: string | undefined;
let useIsMouseMoving: () => () => boolean;

beforeAll(async () => {
  const rootDir = process.cwd();
  const cacheDir = join(rootDir, "node_modules/.cache");
  await mkdir(cacheDir, { recursive: true });
  tempDir = await mkdtemp(join(cacheDir, "ariakit-hovercard-6075-"));
  const packageDir = join(tempDir, "ariakit-react-utils");

  await cp(
    join(rootDir, "packages/ariakit-react-utils/src"),
    join(packageDir, "src"),
    { recursive: true },
  );
  await writeFile(
    join(packageDir, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
        },
        include: ["src"],
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    join(packageDir, "package.json"),
    `${JSON.stringify(
      {
        name: "@ariakit/react-utils",
        type: "module",
        sideEffects: false,
        exports: {
          ".": "./src/index.ts",
        },
        dependencies: {
          "@ariakit/store": "workspace:*",
          "@ariakit/utils": "workspace:*",
        },
        peerDependencies: {
          react: "^17.0.0 || ^18.0.0 || ^19.0.0",
        },
      },
      null,
      2,
    )}\n`,
  );

  const buildUrl = pathToFileURL(
    join(rootDir, "packages/ariakit-scripts/src/build.ts"),
  ).href;
  execFileSync(process.execPath, ["--input-type=module"], {
    input: `
      import { build } from ${JSON.stringify(buildUrl)};
      process.chdir(${JSON.stringify(packageDir)});
      await build({ indexOnly: true });
    `,
  });

  const url = pathToFileURL(join(packageDir, "dist/index.js")).href;
  const module = await import(/* @vite-ignore */ url);
  useIsMouseMoving = module.useIsMouseMoving;
});

afterAll(async () => {
  if (!tempDir) return;
  await rm(tempDir, { recursive: true, force: true });
});

// See https://github.com/ariakit/ariakit/issues/6075
// This must use Testing Library userEvent.hover with built package output.
test("tracks Testing Library hover as mouse movement in the package build", async () => {
  const user = userEvent.setup();
  let isMouseMoving = () => false;

  function Test() {
    isMouseMoving = useIsMouseMoving();
    return createElement("button", null, "Hover");
  }

  render(createElement(Test));
  expect(isMouseMoving()).toBe(false);

  await user.hover(q.button.ensure("Hover"));

  expect(isMouseMoving()).toBe(true);
});
