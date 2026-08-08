/// <reference types="vite/client" />

import type { Component } from "solid-js";
import {
  setupFrameworkTests,
  setupPreviewContainer,
} from "./vitest.setup.framework.ts";

const fixtures = import.meta.glob<{ default: Component }>([
  "./app/src/examples/**/index.solid.tsx",
  "./app/src/sandbox/**/index.solid.tsx",
]);

const previewConfigs = import.meta.glob<{
  default: { fullscreen?: boolean };
}>("./app/src/{examples,sandbox}/**/preview.json", { eager: true });

async function loadSolid(dir: string) {
  const importFixture = fixtures[`./${dir}/index.solid.tsx`];
  if (!importFixture) {
    throw new Error(`Missing Solid fixture: ${dir}`);
  }
  const { default: component } = await importFixture();
  const config = previewConfigs[`./${dir}/preview.json`]?.default;
  const preview = setupPreviewContainer(config?.fullscreen);
  const { createComponent, render, Suspense } = await import("solid-js/web");
  const dispose = render(
    () =>
      createComponent(Suspense, {
        fallback: null,
        get children() {
          return createComponent(component, {});
        },
      }),
    preview.container,
  );
  return () => {
    dispose();
    preview.cleanup();
  };
}

setupFrameworkTests("solid", loadSolid);
