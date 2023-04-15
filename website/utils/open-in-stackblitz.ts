import { invariant } from "@ariakit/core/utils/misc";
import _sdk from "@stackblitz/sdk";
import type { ProjectFiles } from "@stackblitz/sdk";
import { tsToJsFilename } from "./ts-to-js-filename.js";

const sdk = _sdk as unknown as (typeof _sdk)["default"];

interface Props {
  template?: "vite" | "next";
  id: string;
  files: Record<string, string>;
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

function normalizeDeps(deps: Props["dependencies"] = {}) {
  return Object.entries(deps).reduce(
    (acc, [pkg, version]) => ({ ...acc, [getPackageName(pkg)]: version }),
    {}
  );
}

function getExampleName(id: Props["id"]) {
  const [_category, ...names] = id.split("-");
  const exampleName = names.join("-");
  return exampleName;
}

function getFirstFilename(files: Props["files"]) {
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

function getIndexCss() {
  return `@import url("tailwindcss/lib/css/preflight.css");

body {
  background-color: #edf0f3;
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

function getViteProject(props: Props) {
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

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
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

  const indexCss = getIndexCss();

  const sourceFiles = Object.entries(props.files).reduce<ProjectFiles>(
    (acc, [filename, content]) => {
      acc[`${exampleName}/${filename}`] = content;
      return acc;
    },
    {}
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

function getNextProject(props: Props) {
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
      next: "^13.0.0",
      ...props.dependencies,
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
    appDir: true,
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

  const style = getIndexCss();

  const mainLayout = `import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
`;

  const page = `"use client";
import "./style.css";
import Example from "./${exampleName}/${tsToJsFilename(firstFile)}";

export default function Page() {
  return <Example />;
}
`;

  const sourceFiles = Object.entries(props.files).reduce<ProjectFiles>(
    (acc, [filename, content]) => {
      acc[`app/${exampleName}/${filename}`] = content;
      return acc;
    },
    {}
  );

  return {
    sourceFiles,
    files: {
      "package.json": JSON.stringify(packageJson, null, 2),
      "tsconfig.json": JSON.stringify(tsConfig, null, 2),
      "next.config.js": nextConfig,
      "next-env.d.ts": nextEnv,
      "app/style.css": style,
      "app/layout.tsx": mainLayout,
      "app/page.tsx": page,
      ...sourceFiles,
    },
  };
}

export function openInStackblitz({ template = "vite", ...props }: Props) {
  props.dependencies = normalizeDeps(props.dependencies);
  props.devDependencies = normalizeDeps(props.devDependencies);

  const project =
    template === "vite"
      ? getViteProject(props)
      : template === "next"
      ? getNextProject(props)
      : null;

  invariant(project, "Unsupported template");

  const { files, sourceFiles } = project;

  sdk.openProject(
    {
      title: `${props.id} - Ariakit`,
      description: props.id,
      template: "node",
      files: files,
    },
    {
      openFile: Object.keys(sourceFiles).reverse().join(","),
    }
  );
}
