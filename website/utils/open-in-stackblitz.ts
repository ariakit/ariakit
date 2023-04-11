import { invariant } from "@ariakit/core/utils/misc";
import _sdk from "@stackblitz/sdk";
import type { ProjectFiles } from "@stackblitz/sdk";
import { tsToJsFilename } from "./ts-to-js-filename.js";

const sdk = _sdk as unknown as (typeof _sdk)["default"];

interface Props {
  id: string;
  files: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function openInStackblitz({
  id,
  files,
  dependencies,
  devDependencies,
}: Props) {
  const [_category, ...names] = id.split("-");
  const exampleName = names.join("-");
  const firstFile = Object.keys(files)[0];

  invariant(firstFile, "No files provided");

  const packageJson = {
    name: `@ariakit/${id}`,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
    },
    dependencies,
    devDependencies: {
      ...devDependencies,
      "@vitejs/plugin-react": "3.1.0",
      typescript: "5.0.2",
      vite: "4.2.1",
    },
  };

  const tsconfigJson = {
    compilerOptions: {
      target: "ESNext",
      lib: ["DOM", "DOM.Iterable", "ESNext"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "node16",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    references: [{ path: "./tsconfig.node.json" }],
  };

  const tsconfigNodeJson = {
    compilerOptions: {
      composite: true,
      skipLibCheck: true,
      module: "ESNext",
      moduleResolution: "node16",
      allowSyntheticDefaultImports: true,
    },
    include: ["vite.config.ts"],
  };

  const viteConfigTs = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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

  const indexCss = `@import url("https://unpkg.com/tailwindcss@^3.0.0/lib/css/preflight.css");

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

  const viteEnv = `/// <reference types="vite/client" />
`;

  sdk.openProject(
    {
      title: `${id} - Ariakit`,
      description: id,
      template: "node",
      files: {
        "package.json": JSON.stringify(packageJson, null, 2),
        "tsconfig.json": JSON.stringify(tsconfigJson, null, 2),
        "tsconfig.node.json": JSON.stringify(tsconfigNodeJson, null, 2),
        "vite.config.ts": viteConfigTs,
        "index.html": indexHtml,
        "index.tsx": indexTsx,
        "index.css": indexCss,
        "vite-env.d.ts": viteEnv,
        ...Object.entries(files).reduce<ProjectFiles>(
          (acc, [filename, content]) => {
            acc[`${exampleName}/${filename}`] = content;
            return acc;
          },
          {}
        ),
      },
    },
    {
      openFile: Object.keys(files)
        .reverse()
        .map((file) => `${exampleName}/${file}`)
        .join(","),
    }
  );
}
