/// <reference types="vite/client" />

import type { ComponentType } from "react";
import {
  setupFrameworkTests,
  setupPreviewContainer,
} from "./vitest.setup.framework.ts";

const fixtures = import.meta.glob<{ default: ComponentType }>([
  "./app/src/examples/**/index.react.tsx",
  "./app/src/sandbox/**/index.react.tsx",
]);

const previewConfigs = import.meta.glob<{
  default: { fullscreen?: boolean };
}>("./app/src/{examples,sandbox}/**/preview.json", { eager: true });

async function loadReact(dir: string) {
  const importFixture = fixtures[`./${dir}/index.react.tsx`];
  if (!importFixture) {
    throw new Error(`Missing React fixture: ${dir}`);
  }
  const { default: component } = await importFixture();
  const config = previewConfigs[`./${dir}/preview.json`]?.default;
  const preview = setupPreviewContainer(config?.fullscreen);
  const { render } = await import("@ariakit/test/react");
  const { createElement, Suspense } = await import("react");
  const element = createElement(Suspense, {
    fallback: null,
    // oxlint-disable-next-line react/no-children-prop -- createElement requires children prop
    children: createElement(component),
  });
  const { unmount } = await render(element, {
    container: preview.container,
    strictMode: true,
  });
  return () => {
    unmount();
    preview.cleanup();
  };
}

setupFrameworkTests("react", loadReact);
