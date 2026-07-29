import { beforeEach } from "vitest";

type Framework = "react" | "solid";

async function tryImport(path: string) {
  return import(path)
    .then(({ default: component }) => ({ component, failedImport: false }))
    .catch(() => ({ component: undefined, failedImport: true }));
}

async function loadReact(dir: string) {
  const { render } = await import("@ariakit/test/react");
  const { createElement, Suspense } = await import("react");
  const { component, failedImport } = await tryImport(
    `./${dir}/index.react.tsx`,
  );
  if (failedImport) return false;
  const element = createElement(Suspense, {
    fallback: null,
    // oxlint-disable-next-line react/no-children-prop -- createElement requires children prop
    children: createElement(component),
  });
  const { unmount } = await render(element, { strictMode: true });
  return unmount;
}

async function loadSolid(dir: string) {
  const { createComponent, render, Suspense } = await import("solid-js/web");
  const { component, failedImport } = await tryImport(
    `./${dir}/index.solid.tsx`,
  );
  if (failedImport) return false;
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
} satisfies Record<
  Framework,
  (dir: string) => Promise<void | (() => void) | false>
>;

/*

Example/test naming conventions:

<example name>/
  index.<react|solid>.tsx        - example, the loader is optional and defaults to "react"
  test.ts                        - test, runs for all loaders
  <react|solid>.test.ts          - test, runs only for the specified loader

Note: test files can also be named `test-<browser target>.` instead of `test.` to run with Playwright. Available targets are:

- browser (all desktop browsers)
- chrome
- firefox
- safari
- mobile (all mobile browsers)
- ios
- android

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
    const result = await LOADERS[framework](dir);
    if (result === false) skip();
    return result;
  });
}
