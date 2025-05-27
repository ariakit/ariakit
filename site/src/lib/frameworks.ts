import type * as icons from "#app/icons/icons.ts";

type Frameworks = Record<string, { label: string; icon: keyof typeof icons }>;

export const frameworks = {
  astro: { label: "Astro", icon: "astro" },
  html: { label: "HTML", icon: "html" },
  nextjs: { label: "Next.js", icon: "nextjs" },
  preact: { label: "Preact", icon: "preact" },
  react: { label: "React", icon: "react" },
  reactrouter: { label: "React Router", icon: "reactrouter" },
  solid: { label: "Solid", icon: "solid" },
  svelte: { label: "Svelte", icon: "svelte" },
  vue: { label: "Vue", icon: "vue" },
} as const satisfies Frameworks;
