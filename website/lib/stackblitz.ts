import { hasOwnProperty, invariant } from "@ariakit/utils";
import sdk, {
  type EmbedOptions,
  type OpenOptions,
  type Project,
  type ProjectFiles,
} from "@stackblitz/sdk";
import { pick } from "lodash-es";

const POSTCSS_VERSION = "8.5.15";
const TAILWIND_VERSION = "4.3.0";
const TYPES_NODE_VERSION = "24.12.4";
const TYPES_REACT_VERSION = "19.2.15";
const TYPES_REACT_DOM_VERSION = "19.2.3";
const TYPESCRIPT_VERSION = "6.0.3";
const NEXT_VERSION = "16.2.6";
const REACT_VERSION = "19.2.6";
const REACT_DOM_VERSION = "19.2.6";
const VITE_VERSION = "8.0.14";
const VITE_REACT_PLUGIN_VERSION = "6.0.2";

export interface StackblitzProps {
  id: string;
  files: Record<string, string>;
  theme?: "light" | "dark";
  template?: "vite" | "next";
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function getPackageName(source: string) {
  const [maybeScope, maybeName] = source.split("/");
  if (maybeScope?.startsWith("@")) {
    return `${maybeScope}/${maybeName}`;
  }
  return `${maybeScope}`;
}

function normalizeDeps(deps: StackblitzProps["dependencies"] = {}) {
  return Object.entries(deps).reduce(
    (acc, [pkg, version]) => ({ ...acc, [getPackageName(pkg)]: version }),
    {},
  );
}

function getExampleName(id: StackblitzProps["id"]) {
  const [_category, ...names] = id.split("-");
  const exampleName = names.join("-");
  return exampleName.replace(/^.+-previews-(.+)$/, "$1");
}

function getFirstFilename(files: StackblitzProps["files"]) {
  const firstFile = Object.keys(files)[0];
  invariant(firstFile, "No files provided");
  return firstFile;
}

function toRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function getPackageJson(packageJson: Record<string, unknown>) {
  return {
    name: `@ariakit/${packageJson.name}`,
    description: packageJson.name,
    private: true,
    version: "0.0.0",
    type: "module",
    license: "MIT",
    repository: "https://github.com/ariakit/ariakit.git",
    scripts: packageJson.scripts,
    dependencies: packageJson.dependencies,
    devDependencies: {
      ...toRecord(packageJson.devDependencies),
      "@tailwindcss/postcss": TAILWIND_VERSION,
      autoprefixer: "10.4.23",
      tailwindcss: TAILWIND_VERSION,
      postcss: POSTCSS_VERSION,
      "postcss-import": "16.1.1",
      typescript: TYPESCRIPT_VERSION,
    },
  };
}

function getPostcssConfig() {
  return `
export default {
  plugins: {
    "postcss-import": {},
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
}
`;
}

function getTailwindConfig(exampleName: string) {
  return `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./${exampleName}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
}

function getTSConfig(tsConfig?: Record<string, unknown>) {
  return {
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
      ...toRecord(tsConfig?.compilerOptions),
    },
    include: tsConfig?.include,
    exclude: tsConfig?.exclude,
  };
}

function getIndexCss(
  id: StackblitzProps["id"],
  theme: StackblitzProps["theme"] = "light",
  tailwindConfigPath = "./tailwind.config.js",
) {
  const isRadix = /-radix/.test(id);
  theme = isRadix ? "light" : theme;
  const background = isRadix
    ? "linear-gradient(to bottom right, hsl(204 100% 40%), #9333ea)"
    : theme === "light"
      ? "hsl(204 20% 94%)"
      : "hsl(204 3% 12%)";
  const color = theme === "light" ? "hsl(204 10% 10%)" : "hsl(204 20% 100%)";
  return `@import "tailwindcss";
@config "${tailwindConfigPath}";

html {
  color-scheme: ${theme};
}

body {
  color-scheme: ${theme};
  background: ${background};
  color: ${color};
  min-height: 100vh;
  padding-top: min(10vh, 100px);
  line-height: 1.5;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
}

#root {
  display: flex;
  flex-direction: column;
  align-items: center;
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

function getViteProject(props: StackblitzProps) {
  const exampleName = getExampleName(props.id);
  const firstFile = getFirstFilename(props.files);

  const packageJson = getPackageJson({
    name: props.id,
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
    },
    dependencies: props.dependencies,
    devDependencies: {
      ...props.devDependencies,
      "@vitejs/plugin-react": VITE_REACT_PLUGIN_VERSION,
      vite: VITE_VERSION,
    },
  });

  const hasQuery = hasOwnProperty(
    props.dependencies || {},
    "@tanstack/react-query",
  );

  const tsConfig = getTSConfig();

  const viteConfig = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // @ts-ignore
  plugins: [react()],
});
`;

  const theme = props.theme === "dark" ? "dark" : "light";

  const indexHtml = `<!DOCTYPE html>
<html lang="en" class="${theme}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${exampleName} - Ariakit</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
`;

  const indexTsx = `import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
${hasQuery ? `import { QueryProvider } from "./query-provider.tsx";` : ""}
import Example from "./${exampleName}/${firstFile}";

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
      : `createRoot(root).render(<StrictMode><Example /></StrictMode>);`
  }
}
`;

  const indexCss = getIndexCss(props.id, props.theme);

  const sourceFiles = Object.entries(props.files).reduce<ProjectFiles>(
    (acc, [filename, content]) => {
      acc[`${exampleName}/${filename}`] = content;
      return acc;
    },
    {},
  );

  if (hasQuery) {
    sourceFiles["query-provider.tsx"] = getQueryProvider();
  }

  return {
    sourceFiles,
    files: {
      "package.json": JSON.stringify(packageJson, null, 2),
      "tsconfig.json": JSON.stringify(tsConfig, null, 2),
      "vite.config.ts": viteConfig,
      "index.html": indexHtml,
      "index.tsx": indexTsx,
      "index.css": indexCss,
      "postcss.config.js": getPostcssConfig(),
      "tailwind.config.js": getTailwindConfig(exampleName),
      ...sourceFiles,
    },
  };
}

function getNextProject(props: StackblitzProps) {
  const exampleName = getExampleName(props.id);
  const firstFile = getFirstFilename(props.files);

  const packageJson = getPackageJson({
    name: props.id,
    scripts: {
      dev: "next dev --webpack",
      build: "next build --webpack",
      start: "next start",
    },
    dependencies: {
      next: NEXT_VERSION,
      react: REACT_VERSION,
      "react-dom": REACT_DOM_VERSION,
      ...props.dependencies,
    },
    devDependencies: {
      "@types/node": TYPES_NODE_VERSION,
      "@types/react": TYPES_REACT_VERSION,
      "@types/react-dom": TYPES_REACT_DOM_VERSION,
      ...props.devDependencies,
    },
  });

  const hasQuery = hasOwnProperty(
    props.dependencies || {},
    "@tanstack/react-query",
  );

  const tsConfig = getTSConfig({
    compilerOptions: {
      plugins: [{ name: "next" }],
      jsx: "preserve",
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  });

  const nextConfig = `/** @type {import("next").NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
`;

  const nextEnv = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

  const layoutCss = getIndexCss(props.id, props.theme, "../tailwind.config.js");

  const theme = props.theme === "dark" ? "dark" : "light";

  const mainLayout = `import type { PropsWithChildren } from "react";
${hasQuery ? `import { QueryProvider } from "./query-provider.tsx";` : ""}
import "./layout.css";

export default function Layout({ children }: PropsWithChildren) {
  return (
    ${
      hasQuery
        ? `<QueryProvider>
      <html lang="en" className="${theme}">
        <body>
          <div id="root">{children}</div>
        </body>
      </html>
    </QueryProvider>`
        : `<html lang="en" className="${theme}">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>`
    }
  );
}
`;

  const isAppDir = /(page|layout)\.[mc]?[jt]sx?$/.test(firstFile);
  const pagePath = isAppDir ? `previews/${exampleName}` : exampleName;

  const page = isAppDir
    ? `import { redirect } from "next/navigation.js";

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

  return {
    sourceFiles,
    files: {
      "package.json": JSON.stringify(packageJson, null, 2),
      "tsconfig.json": JSON.stringify(tsConfig, null, 2),
      "next.config.js": nextConfig,
      "next-env.d.ts": nextEnv,
      "app/layout.css": layoutCss,
      "app/layout.tsx": mainLayout,
      "app/page.tsx": page,
      "postcss.config.js": getPostcssConfig(),
      "tailwind.config.js": getTailwindConfig(exampleName),
      ...sourceFiles,
    },
  };
}

function getProject({ template = "vite", ...props }: StackblitzProps) {
  props.dependencies = normalizeDeps(props.dependencies);
  props.devDependencies = normalizeDeps(props.devDependencies);

  const templateProject =
    template === "vite"
      ? getViteProject(props)
      : template === "next"
        ? getNextProject(props)
        : null;

  invariant(templateProject, "Unsupported template");

  const { files, sourceFiles } = templateProject;

  const project = {
    title: `${props.id} - Ariakit`,
    description: props.id,
    template: "node",
    files,
  } satisfies Project;

  return { project, sourceFiles };
}

export function openInStackblitz(props: StackblitzProps) {
  const { project, sourceFiles } = getProject(props);

  const options = {
    openFile: Object.keys(sourceFiles).reverse().join(","),
    theme: props.theme,
  } satisfies OpenOptions;

  sdk.openProject(project, options);
}

export function embedStackblitz(element: HTMLElement, props: StackblitzProps) {
  const { project } = getProject(props);

  const options = {
    view: "preview",
    theme: props.theme,
    hideExplorer: true,
    height: element.parentElement?.clientHeight,
  } satisfies EmbedOptions;

  return sdk.embedProject(element, project, options);
}

export function getSourceFiles(props: StackblitzProps) {
  const { sourceFiles } = getProject(props);
  return sourceFiles;
}

export function getThemedFiles(props: StackblitzProps) {
  const { project } = getProject(props);

  if ("index.css" in project.files) {
    return pick(project.files, ["index.css", "index.html"]);
  }

  return pick(project.files, ["app/layout.css", "app/layout.tsx"]);
}
