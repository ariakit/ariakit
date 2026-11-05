import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach } from "vitest";
import type { PreviewLoadContext } from "./app/src/lib/code-files.ts";

type Framework = "react" | "solid";

interface ServerModule {
  load: (context: PreviewLoadContext) => object | Promise<object>;
}

// Keep the path opaque so Vite's dynamic import vars transform does not rewrite
// nested preview paths into an unsupported one-level glob.
async function importDefault(path: string) {
  const { default: component } = await import(path);
  return component;
}

async function importModule<T>(path: string): Promise<T> {
  return import(path);
}

// The generated preview calls the load function of the server file and passes
// the result to the example as props. Tests render the example without the
// preview, so they do the same here. A file check instead of a glob, because
// the module cache of Vitest keeps a glob from before a new server file.
async function loadProps(dir: string) {
  const serverPath = `./${dir}/index.server.ts`;
  if (!existsSync(resolve(serverPath))) return {};
  const [{ load }, { getPreviewLoadContext }, discovery, { previewConfig }] =
    await Promise.all([
      importModule<ServerModule>(serverPath),
      import("./app/src/lib/code-files.ts"),
      import("./app/src/lib/preview-discovery.ts"),
      import("./app/src/lib/preview-config.ts"),
    ]);
  const srcDir = resolve("app/src");
  const roots = discovery.resolvePreviewRoots({ ...previewConfig, srcDir });
  const id = discovery.getPreviewIdFromDir(roots, resolve(dir));
  if (!id) {
    throw new Error(`${dir} is not in a preview folder`);
  }
  return load(getPreviewLoadContext(id));
}

async function loadReact(dir: string) {
  const { render } = await import("@ariakit/test/react");
  const { createElement, Suspense } = await import("react");
  const component = await importDefault(`./${dir}/index.react.tsx`);
  const props = await loadProps(dir);
  const element = createElement(
    Suspense,
    { fallback: null },
    createElement(component, props),
  );
  const { unmount } = await render(element, { strictMode: true });
  return unmount;
}

async function loadSolid(dir: string) {
  const { createComponent, render, Suspense } = await import("solid-js/web");
  const component = await importDefault(`./${dir}/index.solid.tsx`);
  const props = await loadProps(dir);
  const div = document.createElement("div");
  document.body.appendChild(div);
  const dispose = render(
    () =>
      createComponent(Suspense, {
        fallback: null,
        get children() {
          return createComponent(component, props);
        },
      }),
    div,
  );
  return () => {
    dispose();
    document.body.removeChild(div);
  };
}

const LOADERS = {
  react: loadReact,
  solid: loadSolid,
} satisfies Record<Framework, (dir: string) => Promise<() => void>>;

/*
 * Fixture grammar:
 * - `test.ts` runs for every matching `index.<framework>.tsx`.
 * - `<framework>.test.ts` runs only for that framework.
 * - `<name>.<framework>.test.ts` next to `index.astro` is not auto-mounted; it
 *   mounts its own component.
 * Playwright uses `test-<target>.ts`; targets are defined in
 * `app/playwright.config.ts`.
 */

function parseTest(filename?: string) {
  if (!filename) return false;
  const match = filename.match(
    /^(?<dir>(?:.*\/)?(?:recipes|component-docs|sandbox)\/.+?)\/((?<framework>react|solid)\.)?test\.ts$/,
  );
  if (!match?.groups) return false;
  const { dir, framework } = match.groups;
  if (!dir) return false;
  if (framework !== "react" && framework !== "solid") {
    return { dir, framework: "all" as const };
  }
  return { dir, framework };
}

export function setupFrameworkTests(framework: Framework) {
  beforeEach(async ({ task, skip }) => {
    const parseResult = parseTest(task.file?.name);
    if (!parseResult) return;
    const { dir, framework: testFramework } = parseResult;
    if (testFramework !== "all" && testFramework !== framework) {
      skip();
      return;
    }
    return LOADERS[framework](dir);
  });
}
