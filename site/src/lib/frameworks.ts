/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type * as icons from "#app/icons/icons.ts";

type Frameworks = Record<
  string,
  {
    label: string;
    icon: keyof typeof icons;
    dependencies: string[];
    url: string;
    indexFile?: string;
  }
>;

export const frameworks = {
  astro: {
    label: "Astro",
    icon: "astro",
    dependencies: ["astro"],
    url: "https://astro.build",
    indexFile: "index.astro",
  },
  html: {
    label: "HTML",
    icon: "html",
    dependencies: [],
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    indexFile: "index.html",
  },
  preact: {
    label: "Preact",
    icon: "preact",
    dependencies: ["preact"],
    url: "https://preactjs.com",
    indexFile: "index.preact.tsx",
  },
  react: {
    label: "React",
    icon: "react",
    dependencies: ["react", "react-dom"],
    url: "https://react.dev",
    indexFile: "index.react.tsx",
  },
  solid: {
    label: "Solid",
    icon: "solid",
    dependencies: ["solid-js"],
    url: "https://www.solidjs.com",
    indexFile: "index.solid.tsx",
  },
  svelte: {
    label: "Svelte",
    icon: "svelte",
    dependencies: ["svelte"],
    url: "https://svelte.dev",
    indexFile: "index.svelte",
  },
  vue: {
    label: "Vue",
    icon: "vue",
    dependencies: ["vue"],
    url: "https://vuejs.org",
    indexFile: "index.vue",
  },
  tailwind: {
    label: "Tailwind",
    icon: "tailwind",
    dependencies: ["tailwindcss"],
    url: "https://tailwindcss.com",
  },
} as const satisfies Frameworks;

export function isFramework(
  framework?: string,
): framework is keyof typeof frameworks {
  if (!framework) return false;
  return framework in frameworks;
}

export function isJsxFramework(framework?: string) {
  return (
    framework === "react" || framework === "solid" || framework === "preact"
  );
}

export function getFramework(framework: keyof typeof frameworks) {
  return frameworks[framework];
}

export function getFrameworkByFilename(
  filename: string,
): keyof typeof frameworks | null {
  if (filename.endsWith(".astro")) return "astro";
  if (filename.endsWith(".html")) return "html";
  if (filename.endsWith(".preact.tsx")) return "preact";
  if (filename.endsWith(".react.tsx")) return "react";
  if (filename.endsWith(".solid.tsx")) return "solid";
  if (filename.endsWith(".svelte")) return "svelte";
  if (filename.endsWith(".vue")) return "vue";
  return null;
}

export function removeFrameworkSuffix(path: string) {
  return path
    .replace(/\.preact\.([tj]sx?)$/, ".$1")
    .replace(/\.react\.([tj]sx?)$/, ".$1")
    .replace(/\.solid\.([tj]sx?)$/, ".$1");
}

export function getIndexFile(framework: keyof typeof frameworks) {
  const frameworkDetail = getFramework(framework);
  if (!("indexFile" in frameworkDetail)) return null;
  return frameworkDetail.indexFile;
}

export function isFrameworkDependency(
  pkg: string,
): pkg is keyof typeof frameworks {
  return Object.values(frameworks).some((framework) =>
    framework.dependencies.includes(pkg as never),
  );
}
