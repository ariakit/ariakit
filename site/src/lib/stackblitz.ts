import { hasOwnProperty, invariant } from "@ariakit/core/utils/misc";
import type { Project, ProjectFiles } from "@stackblitz/sdk";
import _sdk from "@stackblitz/sdk";

import type { StyleDependency } from "./styles.ts";
import {
  getStyleDefinition,
  getTransitiveStyleDefinitions,
  styleDefToCss,
} from "./styles.ts";

const sdk = _sdk as unknown as (typeof _sdk)["default"];

export type SiteStackblitzFramework =
  | "react-vite"
  | "react-nextjs"
  | "solid-vite";

export interface SiteStackblitzProps {
  id: string;
  files: Record<string, string>;
  framework: SiteStackblitzFramework;
  theme?: "light" | "dark";
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  styles?: StyleDependency[];
  tsconfig?: Record<string, unknown>;
  nextTsconfig?: Record<string, unknown>;
  initialOpenFile?: string;
}

interface NormalizedProps extends SiteStackblitzProps {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

interface ProjectResult {
  files: ProjectFiles;
  sourceFiles: Record<string, string>;
}

function getPackageName(source: string) {
  const [maybeScope, maybeName] = source.split("/");
  if (maybeScope?.startsWith("@")) {
    return `${maybeScope}/${maybeName ?? ""}`;
  }
  return `${maybeScope}`;
}

function normalizeDeps(deps: Record<string, string> = {}) {
  return Object.entries(deps).reduce<Record<string, string>>(
    (acc, [pkg, version]) => {
      const name = getPackageName(pkg);
      acc[name] = version;
      return acc;
    },
    {},
  );
}

function normalizeProps(props: SiteStackblitzProps): NormalizedProps {
  return {
    ...props,
    dependencies: normalizeDeps(props.dependencies),
    devDependencies: normalizeDeps(props.devDependencies),
  };
}

function getExampleName(id: SiteStackblitzProps["id"]) {
  const [_category, ...names] = id.split("-");
  const exampleName = names.join("-");
  return exampleName.replace(/^.+-previews-(.+)$/, "$1");
}

function getFirstFilename(files: SiteStackblitzProps["files"]) {
  const firstFile = Object.keys(files)[0];
  invariant(firstFile, "No files provided");
  return firstFile;
}

function mergeTsConfig(
  base: Record<string, unknown>,
  overrides?: Record<string, unknown>,
) {
  if (!overrides) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key === "compilerOptions" && value && typeof value === "object") {
      const baseCompiler =
        (out.compilerOptions as Record<string, unknown>) ?? {};
      out.compilerOptions = {
        ...baseCompiler,
        ...(value as Record<string, unknown>),
      };
      continue;
    }
    out[key] = value;
  }
  return out;
}

function getTSConfig(overrides?: Record<string, unknown>) {
  const base: Record<string, unknown> = {
    compilerOptions: {
      target: "esnext",
      lib: ["dom", "dom.iterable", "esnext"],
      module: "esnext",
      skipLibCheck: true,
      moduleResolution: "node16",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      allowJs: true,
      forceConsistentCasingInFileNames: true,
      incremental: true,
      esModuleInterop: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
  };
  return mergeTsConfig(base, overrides);
}

function getBaseCss() {
  return `@import "tailwindcss";
@import "@ariakit/tailwind";

@theme {
  --color-canvas: oklch(99.33% 0.0011 197.14);
  --color-primary: oklch(56.7% 0.154556 248.5156);
  --color-secondary: oklch(65.59% 0.2118 354.31);

  --radius-container: var(--radius-xl);
  --spacing-container: --spacing(1);

  --radius-tooltip: var(--radius-lg);
  --spacing-tooltip: --spacing(1);

  --radius-dialog: var(--radius-2xl);
  --spacing-dialog: --spacing(4);

  --radius-playground: calc(var(--radius) * 3.5);
  --spacing-playground: --spacing(0);

  --radius-field: var(--radius-lg);
  --spacing-field: 0.75em;

  --radius-card: var(--radius-xl);
  --spacing-card: --spacing(4);

  --radius-badge: var(--radius-full);
  --spacing-badge: --spacing(1.5);

  --font-sans:
    "Inter Variable", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

:root {
  @variant dark {
    --color-canvas: oklch(16.34% 0.0091 264.28);
  }
}

body {
  @apply ak-layer-canvas;
}
`;
}

function getQueryProvider() {
  return `"use client";

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function QueryProvider(props: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
`;
}

function getStylesCss(styles?: StyleDependency[]) {
  if (!styles?.length) return "";
  const seen = new Set<string>();
  const chunks: string[] = [];

  const pushDef = (def: ReturnType<typeof getStyleDefinition>) => {
    if (!def) return;
    const key =
      "type" in def ? `${def.type}:${def.name}` : `at-property:${def.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    chunks.push(styleDefToCss(def));
  };

  for (const dep of styles) {
    const baseDef = getStyleDefinition(dep.name, dep.type);
    pushDef(baseDef);
    const transitive = getTransitiveStyleDefinitions(dep);
    for (const def of transitive) {
      pushDef(def);
    }
  }

  if (!chunks.length) return "";
  return `\n${chunks.join("\n\n")}\n`;
}

function buildSourceFiles(exampleName: string, files: Record<string, string>) {
  return Object.entries(files).reduce<ProjectFiles>(
    (acc, [filename, content]) => {
      acc[`${exampleName}/${filename}`] = content;
      return acc;
    },
    {},
  );
}

function getViteProject(props: NormalizedProps): ProjectResult {
  const exampleName = getExampleName(props.id);
  const firstFile = getFirstFilename(props.files);
  const stylesCss = getStylesCss(props.styles);

  const hasQuery = hasOwnProperty(props.dependencies, "@tanstack/react-query");

  const templateDependencies = normalizeDeps({
    react: "latest",
    "react-dom": "latest",
    "@ariakit/tailwind": "latest",
  });
  const templateDevDependencies = normalizeDeps({
    vite: "latest",
    "@vitejs/plugin-react": "latest",
    tailwindcss: "^4.0.0",
    typescript: "5.4.4",
  });

  const dependencies = {
    ...templateDependencies,
    ...props.dependencies,
  };

  const devDependencies = {
    ...templateDevDependencies,
    ...props.devDependencies,
  };

  const tsConfig = getTSConfig(props.tsconfig);

  const stylesContent = `${getBaseCss()}${stylesCss}`;

  const indexTsx = `import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
${hasQuery ? 'import { QueryProvider } from "./query-provider.tsx";\n' : ""}import Example from "./${exampleName}/${firstFile}";

const root = document.getElementById("root");

if (root) {
  ${
    hasQuery
      ? `createRoot(root).render(
    <StrictMode>
      <QueryProvider>
        <Example />
      </QueryProvider>
    </StrictMode>
  );`
      : `createRoot(root).render(
    <StrictMode>
      <Example />
    </StrictMode>
  );`
  }
}
`;

  const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`;

  const indexHtml = `<!DOCTYPE html>
 <html lang="en" class="${props.theme === "dark" ? "dark" : "light"}">
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>${exampleName} - Ariakit</title>
   </head>
  <body class="flex items-center-safe justify-center-safe min-h-screen">
    <main class="p-3 size-full @container flex items-center-safe justify-center-safe">
      <div id="root"></div>
    </main>
    <script type="module" src="/index.tsx"></script>
  </body>
 </html>
 `;

  const sourceFiles = buildSourceFiles(exampleName, props.files);

  if (hasQuery) {
    sourceFiles["query-provider.tsx"] = getQueryProvider();
  }

  const files: ProjectFiles = {
    "package.json": JSON.stringify(
      {
        name: `@ariakit/${props.id}`,
        description: props.id,
        private: true,
        version: "0.0.0",
        type: "module",
        license: "MIT",
        repository: "https://github.com/ariakit/ariakit.git",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
        },
        dependencies,
        devDependencies,
      },
      null,
      2,
    ),
    "tsconfig.json": JSON.stringify(tsConfig, null, 2),
    "vite.config.ts": viteConfig,
    "index.html": indexHtml,
    "index.tsx": indexTsx,
    "styles.css": stylesContent,
    ...sourceFiles,
  };

  return { files, sourceFiles };
}

function getSolidProject(props: NormalizedProps): ProjectResult {
  const exampleName = getExampleName(props.id);
  const firstFile = getFirstFilename(props.files);
  const stylesCss = getStylesCss(props.styles);

  const templateDependencies = normalizeDeps({
    "solid-js": "latest",
    "@ariakit/tailwind": "latest",
  });

  const templateDevDependencies = normalizeDeps({
    vite: "latest",
    "vite-plugin-solid": "latest",
    tailwindcss: "^4.0.0",
    typescript: "5.4.4",
  });

  const dependencies = {
    ...templateDependencies,
    ...props.dependencies,
  };

  const devDependencies = {
    ...templateDevDependencies,
    ...props.devDependencies,
  };

  const tsConfig = mergeTsConfig(
    {
      compilerOptions: {
        target: "esnext",
        lib: ["dom", "dom.iterable", "esnext"],
        module: "esnext",
        skipLibCheck: true,
        moduleResolution: "node16",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "preserve",
        jsxImportSource: "solid-js",
        strict: true,
        allowJs: true,
        forceConsistentCasingInFileNames: true,
        incremental: true,
        esModuleInterop: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
    },
    props.tsconfig,
  );

  const stylesContent = `${getBaseCss()}${stylesCss}`;

  const indexTsx = `import "./styles.css";
import { render } from "solid-js/web";
import Example from "./${exampleName}/${firstFile}";

const root = document.getElementById("root");

if (root) {
  render(() => <Example />, root);
}
`;

  const viteConfig = `import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
});
`;

  const indexHtml = `<!DOCTYPE html>
<html lang="en" class="${props.theme === "dark" ? "dark" : "light"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${exampleName} - Ariakit</title>
  </head>
  <body class="flex items-center-safe justify-center-safe min-h-screen">
    <main class="p-3 size-full @container flex items-center-safe justify-center-safe">
      <div id="root"></div>
    </main>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
`;

  const sourceFiles = buildSourceFiles(exampleName, props.files);

  const files: ProjectFiles = {
    "package.json": JSON.stringify(
      {
        name: `@ariakit/${props.id}`,
        description: props.id,
        private: true,
        version: "0.0.0",
        type: "module",
        license: "MIT",
        repository: "https://github.com/ariakit/ariakit.git",
        scripts: {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview",
        },
        dependencies,
        devDependencies,
      },
      null,
      2,
    ),
    "tsconfig.json": JSON.stringify(tsConfig, null, 2),
    "vite.config.ts": viteConfig,
    "index.html": indexHtml,
    "index.tsx": indexTsx,
    "styles.css": stylesContent,
    ...sourceFiles,
  };

  return { files, sourceFiles };
}

function getNextProject(props: NormalizedProps): ProjectResult {
  const exampleName = getExampleName(props.id);
  const firstFile = getFirstFilename(props.files);
  const stylesCss = getStylesCss(props.styles);

  const templateDependencies = normalizeDeps({
    next: "latest",
    react: "latest",
    "react-dom": "latest",
    "@ariakit/tailwind": "latest",
  });

  const templateDevDependencies = normalizeDeps({
    "@types/node": "latest",
    tailwindcss: "^4.0.0",
    typescript: "5.4.4",
  });

  const dependencies = {
    ...templateDependencies,
    ...props.dependencies,
  };

  const devDependencies = {
    ...templateDevDependencies,
    ...props.devDependencies,
  };

  const tsConfig = mergeTsConfig(
    getTSConfig({
      compilerOptions: {
        plugins: [{ name: "next" }],
        jsx: "preserve",
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    }),
    props.nextTsconfig,
  );

  const stylesContent = `${getBaseCss()}${stylesCss}`;

  const isAppDir = /(page|layout)\.[mc]?[jt]sx?$/.test(firstFile);
  const pagePath = isAppDir ? `previews/${exampleName}` : exampleName;

  const hasQuery = hasOwnProperty(props.dependencies, "@tanstack/react-query");

  const imports = [`import type { PropsWithChildren } from "react";`];
  if (hasQuery) {
    imports.push('import { QueryProvider } from "./query-provider.tsx";');
  }
  imports.push('import "./styles.css";');
  const layoutBody = hasQuery
    ? `<QueryProvider>
      <html lang="en" className="${props.theme === "dark" ? "dark" : "light"}">
        <body className="flex items-center-safe justify-center-safe">
          <div className="p-3 size-full @container flex items-center-safe justify-center-safe">
            <div id="root">{children}</div>
          </div>
        </body>
      </html>
    </QueryProvider>`
    : `<html lang="en" className="${props.theme === "dark" ? "dark" : "light"}">
      <body className="flex items-center-safe justify-center-safe">
        <div className="p-3 size-full @container flex items-center-safe justify-center-safe">
          <div id="root">{children}</div>
        </div>
      </body>
    </html>`;

  const layoutTsx = `${imports.join("\n")}

export default function Layout({ children }: PropsWithChildren) {
  return (
    ${layoutBody}
  );
}
`;

  const pageTsx = isAppDir
    ? `import { redirect } from "next/navigation";

export default function Page() {
  redirect("/${pagePath}");
}
`
    : `"use client";
import Example from "./${exampleName}/${firstFile}";

export default function Page() {
  return <Example />;
}
`;

  const nextConfig = `/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
`;

  const nextEnv = `/// <reference types="next" />
/// <reference types="next/types/global" />

// NOTE: This file should not be edited.
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

  const sourceFiles = Object.entries(props.files).reduce<ProjectFiles>(
    (acc, [filename, content]) => {
      const key = `app/${pagePath}/${filename}`;
      acc[key] = content;
      return acc;
    },
    {},
  );

  if (hasQuery) {
    sourceFiles["app/query-provider.tsx"] = getQueryProvider();
  }

  const files: ProjectFiles = {
    "package.json": JSON.stringify(
      {
        name: `@ariakit/${props.id}`,
        description: props.id,
        private: true,
        version: "0.0.0",
        type: "module",
        license: "MIT",
        repository: "https://github.com/ariakit/ariakit.git",
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies,
        devDependencies,
      },
      null,
      2,
    ),
    "tsconfig.json": JSON.stringify(tsConfig, null, 2),
    "next.config.js": nextConfig,
    "next-env.d.ts": nextEnv,
    "app/styles.css": stylesContent,
    "app/layout.tsx": layoutTsx,
    "app/page.tsx": pageTsx,
    ...sourceFiles,
  };

  return { files, sourceFiles };
}

function getProjectFromFramework(props: NormalizedProps): ProjectResult {
  if (props.framework === "react-vite") {
    return getViteProject(props);
  }
  if (props.framework === "solid-vite") {
    return getSolidProject(props);
  }
  if (props.framework === "react-nextjs") {
    return getNextProject(props);
  }
  invariant(false, "Unsupported template");
  return { files: {}, sourceFiles: {} };
}

export function getProject(props: SiteStackblitzProps) {
  const normalized = normalizeProps(props);
  const { files, sourceFiles } = getProjectFromFramework(normalized);

  const project: Project = {
    title: `${props.id} - Ariakit`,
    description: props.id,
    template: "node",
    files,
  };

  return { project, sourceFiles };
}

export function openInStackblitz(props: SiteStackblitzProps) {
  const { project, sourceFiles } = getProject(props);
  const openFile = props.initialOpenFile
    ? props.initialOpenFile
    : Object.keys(sourceFiles).reverse().join(",");

  const options = {
    openFile,
    theme: props.theme,
  } as const;

  sdk.openProject(project, options);
}

export function embedStackblitz(
  element: HTMLElement,
  props: SiteStackblitzProps,
) {
  const { project } = getProject(props);
  const options = {
    view: "preview",
    theme: props.theme,
    hideExplorer: true,
    height: element.parentElement?.clientHeight,
  } as const;

  return sdk.embedProject(element, project, options);
}

export function getSourceFiles(props: SiteStackblitzProps) {
  const { sourceFiles } = getProject(props);
  return sourceFiles;
}

export function getThemedFiles(props: SiteStackblitzProps) {
  const { project } = getProject(props);
  if (props.framework === "react-nextjs") {
    const files: Record<string, string> = {};
    const stylesCss = project.files["app/styles.css"];
    if (typeof stylesCss === "string") {
      files["app/styles.css"] = stylesCss;
    }
    const layoutTsx = project.files["app/layout.tsx"];
    if (typeof layoutTsx === "string") {
      files["app/layout.tsx"] = layoutTsx;
    }
    return files;
  }

  const themed: Record<string, string> = {};
  const stylesCss = project.files["styles.css"];
  if (typeof stylesCss === "string") {
    themed["styles.css"] = stylesCss;
  }
  const indexHtml = project.files["index.html"];
  if (typeof indexHtml === "string") {
    themed["index.html"] = indexHtml;
  }
  return themed;
}
