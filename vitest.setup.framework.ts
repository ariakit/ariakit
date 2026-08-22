import { beforeEach } from "vitest";

type Framework = "react" | "solid";

// Keep the path opaque so Vite's dynamic import vars transform does not
// rewrite nested example paths into an unsupported one-level glob.
async function importDefault(path: string) {
  const { default: component } = await import(path);
  return component;
}

async function loadReact(dir: string) {
  const { render } = await import("@ariakit/test/react");
  const { createElement, Suspense } = await import("react");
  const component = await importDefault(`./${dir}/index.react.tsx`);
  const element = createElement(Suspense, {
    fallback: null,
    children: createElement(component),
  });
  const { unmount } = await render(element, { strictMode: true });
  return unmount;
}

async function loadSolid(dir: string) {
  const { createComponent, render, Suspense } = await import("solid-js/web");
  const component = await importDefault(`./${dir}/index.solid.tsx`);
  const div = document.createElement("div");
  document.body.appendChild(div);
  const dispose = render(
    () =>
      createComponent(Suspense, {
        fallback: null,
        get children() {
          return createComponent(component, {});
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
 * Playwright uses `test-<target>.ts`; targets are defined in
 * `app/playwright.config.ts`.
 */

function parseTest(filename?: string) {
  if (!filename) return false;
  const match = filename.match(
    /^(?<dir>(?:.*\/)?(?:examples|sandbox)\/.+?)\/((?<framework>react|solid)\.)?test\.ts$/,
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
