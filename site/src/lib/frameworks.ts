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

type Frameworks = Record<string, { label: string; icon: keyof typeof icons }>;

export const frameworks = {
  astro: { label: "Astro", icon: "astro" },
  html: { label: "HTML", icon: "html" },
  preact: { label: "Preact", icon: "preact" },
  react: { label: "React", icon: "react" },
  solid: { label: "Solid", icon: "solid" },
  svelte: { label: "Svelte", icon: "svelte" },
  vue: { label: "Vue", icon: "vue" },
  tailwind: { label: "Tailwind", icon: "tailwind" },
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
