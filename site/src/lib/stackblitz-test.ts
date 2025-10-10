import { afterEach, expect, test, vi } from "vitest";

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

import type { SiteStackblitzProps } from "./stackblitz.ts";
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

test("react-vite project includes tailwind v4 setup", () => {
  const props: SiteStackblitzProps = {
    id: "accordion-basic",
    framework: "react-vite",
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
  expect(project.files["package.json"]).toMatchInlineSnapshot(`
    "{
      "name": "@ariakit/accordion-basic",
      "description": "accordion-basic",
      "private": true,
      "version": "0.0.0",
      "type": "module",
      "license": "MIT",
      "repository": "https://github.com/ariakit/ariakit.git",
      "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "preview": "vite preview"
      },
      "dependencies": {
        "react": "latest",
        "react-dom": "latest",
        "@ariakit/tailwind": "latest"
      },
      "devDependencies": {
        "vite": "latest",
        "@vitejs/plugin-react": "latest",
        "@tailwindcss/vite": "^4.0.0",
        "tailwindcss": "^4.0.0",
        "typescript": "5.4.4"
      }
    }"
  `);
  expect(sourceFiles["accordion-basic/index.tsx"]).toBeDefined();
});

test("react-nextjs project generates styles and query provider", () => {
  const props: SiteStackblitzProps = {
    id: "dialog-styled",
    framework: "react-nextjs",
    files: {
      "index.tsx":
        "export default function Example() { return <div className='ak-badge'>Badge</div>; }\n",
    },
    dependencies: {
      "@tanstack/react-query": "latest",
    },
    styles: [{ type: "utility", name: "ak-badge" }],
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

test("solid-vite project emits generated utilities", () => {
  const props: SiteStackblitzProps = {
    id: "separator-solid",
    framework: "solid-vite",
    files: {
      "index.tsx":
        'export default function Example() { return <div class="ak-badge-primary">Solid</div>; }\n',
    },
    styles: [{ type: "utility", name: "ak-badge-*" }],
  };

  const { project } = getProject(props);

  expect(project.files["styles.css"]).toMatchInlineSnapshot(`
    "@import "tailwindcss";
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

    @utility ak-badge-* {
      --ak-badge-color: --value(--color, [*]);
      @apply ak-badge_base;
      @apply ak-layer-mix-(--ak-badge-color)/15 ak-dark:ak-edge-(--ak-badge-color)/10 ak-light:ak-edge-(--ak-badge-color)/15;
      &::before,
      &::after,
      :where(& > *) {
        @apply ak-text-(--ak-badge-color)/70;
      }
    }

    @utility ak-badge_base {
      @apply ak-frame-badge;
      @apply flex items-center gap-1 text-xs font-medium leading-[1em];
      padding-inline: calc(var(--spacing-badge) * 1.5);
    }
    "
  `);
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
  const props: SiteStackblitzProps = {
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
  const props: SiteStackblitzProps = {
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

test("embedStackblitz configures preview view", () => {
  const props: SiteStackblitzProps = {
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

  embedStackblitz(element, props);

  expect(embedProjectMock).toHaveBeenCalledTimes(1);
  const [, , options] = embedProjectMock.mock.calls[0] || [];
  expect(options.view).toBe("preview");
  expect(options.hideExplorer).toBe(true);
});
