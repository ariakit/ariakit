import { invariant } from "@ariakit/core/utils/misc";
import _sdk from "@stackblitz/sdk";
import type { ProjectFiles } from "@stackblitz/sdk";
import { pick } from "lodash-es";
import { tsToJsFilename } from "./ts-to-js-filename.js";

const sdk = _sdk as unknown as (typeof _sdk)["default"];

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
  return exampleName.replace(/^.+-previews\-(.+)$/, "$1");
}

function getFirstFilename(files: StackblitzProps["files"]) {
  const firstFile = Object.keys(files)[0];
  invariant(firstFile, "No files provided");
  return firstFile;
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
      ...(packageJson.devDependencies || {}),
      tailwindcss: "^3.0.0",
      typescript: "5.0.4",
    },
  };
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
      ...(tsConfig?.compilerOptions || {}),
    },
    include: tsConfig?.include,
    exclude: tsConfig?.exclude,
  };
}

function getIndexCss(
  theme: StackblitzProps["theme"] = "light",
  id: StackblitzProps["id"],
) {
  const isRadix = /\-radix/.test(id);
  theme = isRadix ? "light" : theme;
  const background = isRadix
    ? "linear-gradient(to bottom right, hsl(204 100% 40%), #9333ea)"
    : theme === "light"
    ? "hsl(204 20% 94%)"
    : "hsl(204 3% 12%)";
  const color = theme === "light" ? "hsl(204 10% 10%)" : "hsl(204 20% 100%)";
  return `@import url("tailwindcss/lib/css/preflight.css");

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
  justify-content: center;
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
      "@vitejs/plugin-react": "^3.0.0",
      vite: "^4.0.0",
    },
  });

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
import Example from "./${exampleName}/${tsToJsFilename(firstFile)}";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<StrictMode><Example /></StrictMode>);
}
`;

  const indexCss = getIndexCss(props.theme, props.id);

  const sourceFiles = Object.entries(props.files).reduce<ProjectFiles>(
    (acc, [filename, content]) => {
      acc[`${exampleName}/${filename}`] = content;
      return acc;
    },
    {},
  );

  return {
    sourceFiles,
    files: {
      "package.json": JSON.stringify(packageJson, null, 2),
      "tsconfig.json": JSON.stringify(tsConfig, null, 2),
      "vite.config.ts": viteConfig,
      "index.html": indexHtml,
      "index.tsx": indexTsx,
      "index.css": indexCss,
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
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
    dependencies: {
      ...props.dependencies,
      next: "13.4.7",
    },
    devDependencies: {
      "@types/node": "latest",
      ...props.devDependencies,
    },
  });

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
  experimental: {
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
      ".jsx": [".jsx", ".tsx"],
    };
    return config;
  },
};

export default nextConfig;
`;

  const nextEnv = `/// <reference types="next" />
/// <reference types="next/types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;

  const layoutCss = getIndexCss(props.theme, props.id);

  const theme = props.theme === "dark" ? "dark" : "light";

  const mainLayout = `import type { PropsWithChildren } from "react";
import "./layout.css";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="${theme}">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
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
import Example from "./${exampleName}/${tsToJsFilename(firstFile)}";

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
  } satisfies _sdk.Project;

  return { project, sourceFiles };
}

export function openInStackblitz(props: StackblitzProps) {
  const { project, sourceFiles } = getProject(props);

  const options = {
    openFile: Object.keys(sourceFiles).reverse().join(","),
    theme: props.theme,
  } satisfies _sdk.OpenOptions;

  sdk.openProject(project, options);
}

export function embedStackblitz(element: HTMLElement, props: StackblitzProps) {
  const { project } = getProject(props);

  const options = {
    view: "preview",
    theme: props.theme,
    hideExplorer: true,
    height: element.parentElement?.clientHeight,
  } satisfies _sdk.EmbedOptions;

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

  return pick(project.files, ["app/style.css", "app/layout.tsx"]);
}
