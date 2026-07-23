import { afterEach, expect, test, vi } from "vitest";
import nextPkg from "../../../nextjs/package.json" with { type: "json" };
import templatePkg from "../../../templates/react/package.json" with { type: "json" };
import type {
  AppStackblitzFramework,
  AppStackblitzProps,
} from "./stackblitz.ts";

const { openProjectMock, embedProjectMock } = vi.hoisted(() => ({
  openProjectMock: vi.fn(),
  embedProjectMock: vi.fn(),
}));

vi.mock("@stackblitz/sdk", () => ({
  default: {
    openProject: openProjectMock,
    embedProject: embedProjectMock,
  },
}));

import {
  embedStackblitz,
  getProject,
  getSourceFiles,
  getThemedFiles,
  openInStackblitz,
} from "./stackblitz.ts";

afterEach(() => {
  openProjectMock.mockReset();
  embedProjectMock.mockReset();
});

const stackblitzFrameworks: AppStackblitzFramework[] = [
  "react-vite",
  "react-nextjs",
  "solid-vite",
];

interface GeneratedPackageJson {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

function getGeneratedPackageJson(
  project: ReturnType<typeof getProject>["project"],
) {
  const pkgJson = project.files["package.json"];
  if (typeof pkgJson !== "string") {
    throw new Error("Expected package.json to be generated");
  }
  return JSON.parse(pkgJson) as GeneratedPackageJson;
}

test.each(stackblitzFrameworks)(
  "%s project uses bundler module resolution",
  (framework) => {
    const props: AppStackblitzProps = {
      id: `${framework}-tsconfig`,
      framework,
      files: {
        "index.tsx":
          "export default function Example() { return <div>Example</div>; }\n",
      },
    };

    const { project } = getProject(props);

    expect(project.files["tsconfig.json"]).toContain(`"module": "esnext"`);
    expect(project.files["tsconfig.json"]).toContain(
      `"moduleResolution": "bundler"`,
    );
  },
);

test("solid-vite project keeps Solid JSX compiler options", () => {
  const props: AppStackblitzProps = {
    id: "solid-tsconfig",
    framework: "solid-vite",
    files: {
      "index.tsx":
        "export default function Example() { return <div>Example</div>; }\n",
    },
  };

  const { project } = getProject(props);

  expect(project.files["tsconfig.json"]).toContain(`"jsx": "preserve"`);
  expect(project.files["tsconfig.json"]).toContain(
    `"jsxImportSource": "solid-js"`,
  );
});

test.each(["react-vite", "solid-vite"] satisfies AppStackblitzFramework[])(
  "%s project emits formatted index.html",
  (framework) => {
    const props: AppStackblitzProps = {
      id: "disclosure-basic",
      framework,
      theme: "dark",
      files: {
        "index.tsx":
          "export default function Example() { return <div>Example</div>; }\n",
      },
    };

    const { project } = getProject(props);

    expect(project.files["index.html"]).toMatchInlineSnapshot(`
      "<!DOCTYPE html>
      <html lang="en" class="dark">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>disclosure-basic - Ariakit</title>
        </head>
        <body class="flex items-center-safe justify-center-safe min-h-screen">
          <main class="p-3 size-full @container flex items-center-safe justify-center-safe">
            <div id="root"></div>
          </main>
          <script type="module" src="/index.tsx"></script>
        </body>
      </html>
      "
    `);
  },
);

test.each(["react-vite", "solid-vite"] satisfies AppStackblitzFramework[])(
  "%s project defaults index.html to light theme",
  (framework) => {
    const props: AppStackblitzProps = {
      id: "disclosure-basic",
      framework,
      files: {
        "index.tsx":
          "export default function Example() { return <div>Example</div>; }\n",
      },
    };

    const { project } = getProject(props);

    expect(project.files["index.html"]).toContain(
      `<html lang="en" class="light">`,
    );
  },
);

test("react-vite project includes tailwind v4 setup", () => {
  const props: AppStackblitzProps = {
    id: "accordion-basic",
    framework: "react-vite",
    dependencies: {
      react: "0.0.0",
      "react-dom": "0.0.0",
    },
    devDependencies: {
      vite: "0.0.0",
      "@vitejs/plugin-react": "0.0.0",
      "@tailwindcss/vite": "0.0.0",
      "@types/react": "0.0.0",
      "@types/react-dom": "0.0.0",
      tailwindcss: "0.0.0",
      typescript: "0.0.0",
    },
    files: {
      "index.tsx":
        "export default function Example() { return <div>Example</div>; }\n",
    },
  };

  const { project, sourceFiles } = getProject(props);

  expect(project.files["styles.css"]).toMatchInlineSnapshot(`
    "@import "tailwindcss";
    @import "@ariakit/tailwind";

    @theme {
      --color-canvas: oklch(99.33% 0.0011 197.14);
      --color-primary: oklch(56.7% 0.1546 248.5156);
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
      @apply ak-layer ak-layer-canvas;
    }
    "
  `);
  expect(project.files["index.tsx"]).toMatchInlineSnapshot(`
    "import "./styles.css";
    import { StrictMode } from "react";
    import { createRoot } from "react-dom/client";
    import Example from "./accordion-basic/index.tsx";

    const root = document.getElementById("root");

    if (root) {
      createRoot(root).render(
        <StrictMode>
          <Example />
        </StrictMode>
      );
    }
    "
  `);
  const pkg = getGeneratedPackageJson(project);
  expect(pkg.dependencies["@ariakit/tailwind"]).toBe("latest");
  expect(pkg.dependencies.react).toBe(templatePkg.dependencies.react);
  expect(pkg.dependencies["react-dom"]).toBe(
    templatePkg.dependencies["react-dom"],
  );
  expect(pkg.devDependencies.vite).toBe(templatePkg.devDependencies.vite);
  expect(pkg.devDependencies["@vitejs/plugin-react"]).toBe(
    templatePkg.devDependencies["@vitejs/plugin-react"],
  );
  expect(pkg.devDependencies["@tailwindcss/vite"]).toBe(
    templatePkg.devDependencies["@tailwindcss/vite"],
  );
  expect(pkg.devDependencies["@types/react"]).toBe(
    templatePkg.devDependencies["@types/react"],
  );
  expect(pkg.devDependencies["@types/react-dom"]).toBe(
    templatePkg.devDependencies["@types/react-dom"],
  );
  expect(pkg.devDependencies.tailwindcss).toBe(
    templatePkg.devDependencies.tailwindcss,
  );
  expect(pkg.devDependencies.typescript).toBe(
    templatePkg.devDependencies.typescript,
  );
  expect(sourceFiles["accordion-basic/index.tsx"]).toBeDefined();
});

test("solid-vite project syncs shared template dev versions", () => {
  const props: AppStackblitzProps = {
    id: "separator-solid",
    framework: "solid-vite",
    devDependencies: {
      "@tailwindcss/vite": "0.0.0",
      tailwindcss: "0.0.0",
      typescript: "0.0.0",
    },
    files: {
      "index.tsx":
        'export default function Example() { return <div class="ak-badge-primary">Solid</div>; }\n',
    },
  };

  const { project } = getProject(props);
  const pkg = getGeneratedPackageJson(project);

  expect(pkg.dependencies["@ariakit/tailwind"]).toBe("latest");
  expect(pkg.dependencies["solid-js"]).toBe("latest");
  expect(pkg.devDependencies.vite).toBe("latest");
  expect(pkg.devDependencies["vite-plugin-solid"]).toBe("latest");
  expect(pkg.devDependencies["@tailwindcss/vite"]).toBe(
    templatePkg.devDependencies["@tailwindcss/vite"],
  );
  expect(pkg.devDependencies.tailwindcss).toBe(
    templatePkg.devDependencies.tailwindcss,
  );
  expect(pkg.devDependencies.typescript).toBe(
    templatePkg.devDependencies.typescript,
  );
});

test("react-nextjs project syncs shared template and Next dev versions", () => {
  const props: AppStackblitzProps = {
    id: "dialog-nextjs",
    framework: "react-nextjs",
    devDependencies: {
      "@tailwindcss/postcss": "0.0.0",
      tailwindcss: "0.0.0",
      typescript: "0.0.0",
    },
    files: {
      "index.tsx":
        "export default function Example() { return <div>Example</div>; }\n",
    },
  };

  const { project } = getProject(props);
  const pkg = getGeneratedPackageJson(project);

  expect(pkg.dependencies.next).toBe("latest");
  expect(pkg.dependencies.react).toBe("latest");
  expect(pkg.dependencies["react-dom"]).toBe("latest");
  expect(pkg.dependencies["@ariakit/tailwind"]).toBe("latest");
  expect(pkg.devDependencies["@types/node"]).toBe("latest");
  expect(pkg.devDependencies["@tailwindcss/postcss"]).toBe(
    nextPkg.devDependencies["@tailwindcss/postcss"],
  );
  expect(pkg.devDependencies.tailwindcss).toBe(
    nextPkg.devDependencies.tailwindcss,
  );
  expect(pkg.devDependencies.typescript).toBe(
    nextPkg.devDependencies.typescript,
  );
});

test("react-nextjs project generates layout and query provider", () => {
  const props: AppStackblitzProps = {
    id: "dialog-styled",
    framework: "react-nextjs",
    files: {
      "index.tsx":
        "export default function Example() { return <div className='ak-badge'>Badge</div>; }\n",
    },
    dependencies: {
      "@tanstack/react-query": "latest",
    },
  };

  const { project, sourceFiles } = getProject(props);

  expect(project.files["app/layout.tsx"]).toMatchInlineSnapshot(`
    "import type { PropsWithChildren } from "react";
    import { QueryProvider } from "./query-provider.tsx";
    import "./styles.css";

    export default function Layout({ children }: PropsWithChildren) {
      return (
        <QueryProvider>
          <html lang="en" className="light">
            <body className="flex items-center-safe justify-center-safe">
              <div className="p-3 size-full @container flex items-center-safe justify-center-safe">
                <div id="root">{children}</div>
              </div>
            </body>
          </html>
        </QueryProvider>
      );
    }
    "
  `);
  expect(sourceFiles["app/query-provider.tsx"]).toMatchInlineSnapshot(`
    ""use client";

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
    "
  `);

  const themed = getThemedFiles(props);
  expect(Object.keys(themed)).toEqual(["app/styles.css", "app/layout.tsx"]);
});

test("solid-vite project emits base styles and solid entry", () => {
  const props: AppStackblitzProps = {
    id: "separator-solid",
    framework: "solid-vite",
    files: {
      "index.tsx":
        'export default function Example() { return <div class="ak-badge-primary">Solid</div>; }\n',
    },
  };

  const { project } = getProject(props);

  // The full base css is snapshotted in the react-vite test; here we only
  // prove Solid projects get the same Tailwind + plugin setup.
  expect(project.files["styles.css"]).toContain('@import "@ariakit/tailwind"');
  expect(project.files["index.tsx"]).toMatchInlineSnapshot(`
    "import "./styles.css";
    import { render } from "solid-js/web";
    import Example from "./separator-solid/index.tsx";

    const root = document.getElementById("root");

    if (root) {
      render(() => <Example />, root);
    }
    "
  `);
});

test("getSourceFiles returns example entries only", () => {
  const props: AppStackblitzProps = {
    id: "checkbox-basic",
    framework: "react-vite",
    files: {
      "index.tsx":
        "export default function Example() { return <button>Checkbox</button>; }\n",
    },
  };

  const sourceFiles = getSourceFiles(props);

  expect(Object.keys(sourceFiles)).toEqual(["checkbox-basic/index.tsx"]);
});

test("openInStackblitz forwards initialOpenFile", () => {
  const props: AppStackblitzProps = {
    id: "tabs-initial",
    framework: "react-vite",
    files: {
      "index.tsx":
        "export default function Example() { return <div>Tabs</div>; }\n",
    },
    initialOpenFile: "index.tsx",
  };

  openInStackblitz(props);

  expect(openProjectMock).toHaveBeenCalledTimes(1);
  const [, options] = openProjectMock.mock.calls[0] || [];
  expect(options.openFile).toBe("index.tsx");
});

test("embedStackblitz configures preview view", async () => {
  const props: AppStackblitzProps = {
    id: "menu-preview",
    framework: "react-vite",
    files: {
      "index.tsx":
        "export default function Example() { return <div>Menu</div>; }\n",
    },
    initialOpenFile: "index.tsx",
  };

  const element = {
    parentElement: { clientHeight: 300 },
  } as unknown as HTMLElement;

  await embedStackblitz(element, props);

  expect(embedProjectMock).toHaveBeenCalledTimes(1);
  const [, , options] = embedProjectMock.mock.calls[0] || [];
  expect(options.view).toBe("preview");
  expect(options.hideExplorer).toBe(true);
});
