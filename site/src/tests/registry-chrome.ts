import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import type { Registry, RegistryItem } from "shadcn/schema";

async function fetchRegistry(page: Page) {
  const response = await page.goto("/r/registry.json");
  expect(response?.status()).toBe(200);
  const registry: Registry = await response?.json();
  return registry;
}

async function fetchRegistryItem(page: Page, name: string) {
  const response = await page.goto(`/r/${name}.json`);
  expect(response?.status()).toBe(200);
  const item: RegistryItem = await response?.json();
  return item;
}

test("registry index has specific fields", async ({ page }) => {
  const registry = await fetchRegistry(page);
  expect(registry.name).toBe("Ariakit");
  expect(registry.homepage).toBe("https://ariakit.com");
  expect(Array.isArray(registry.items)).toBe(true);
  expect(registry.items.length).toBeGreaterThan(0);
});

test("registry index has ak-* UI items", async ({ page }) => {
  const registry = await fetchRegistry(page);
  const akItems = registry.items.filter((item) => item.name.startsWith("ak-"));
  expect(akItems.length).toBeGreaterThan(0);
  for (const item of akItems) {
    expect(item.type).toBe("registry:ui");
  }
});

test("registry index has items with files", async ({ page }) => {
  const registry = await fetchRegistry(page);
  const itemsWithFiles = registry.items.filter((item) => item.files?.length);
  expect(itemsWithFiles.length).toBeGreaterThan(0);
});

test("registry index has all files without content", async ({ page }) => {
  const registry = await fetchRegistry(page);
  const files = registry.items.flatMap((item) => item.files);
  const hasContent = files.some((file) => file?.content);
  const message = `Registry index should have all files without content`;
  expect(hasContent, message).toBe(false);
});

test("registry index has files with correct paths", async ({ page }) => {
  const registry = await fetchRegistry(page);
  const files = registry.items.flatMap((item) => item.files);
  expect(files.every((file) => file?.path?.startsWith("registry/"))).toBe(true);
});

const nameTypeSamples = {
  "ak-button": "registry:ui",
  "react-examples-disclosure": "registry:example",
  "react-examples-disclosure-actions": "registry:example",
  "react-components-disclosure": "registry:example",
  "react-aria-disclosure": "registry:ui",
  "react-utils-create-render": "registry:lib",
  "react-hooks-use-is-mobile": "registry:hook",
};

for (const [name, type] of Object.entries(nameTypeSamples)) {
  test(`registry item ${name} has correct name and type`, async ({ page }) => {
    const item = await fetchRegistryItem(page, name);
    expect(item.name).toBe(name);
    expect(item.type).toBe(type);
  });
}

const filePathSamples = {
  "ak-button": ["registry/ui/button.css"],
  "react-examples-disclosure": ["registry/examples/disclosure/index.tsx"],
  "react-examples-disclosure-actions": [
    "registry/examples/disclosure-actions/index.tsx",
    "registry/examples/disclosure-actions/orders.ts",
  ],
  "react-components-disclosure": ["registry/examples/disclosure/index.tsx"],
  "react-aria-disclosure": ["registry/ui/disclosure.tsx"],
  "react-utils-create-render": ["registry/lib/create-render.ts"],
  "react-hooks-use-is-mobile": ["registry/hook/use-is-mobile.ts"],
};

for (const [name, paths] of Object.entries(filePathSamples)) {
  test(`registry item ${name} has correct file with correct path`, async ({
    page,
  }) => {
    const item = await fetchRegistryItem(page, name);
    expect(item.files).toEqual(
      paths.map((path) => expect.objectContaining({ path })),
    );
  });
}

function depRegex(dependency: string) {
  return new RegExp(String.raw`^${dependency}(@[\^~]?[\d.]+)?$`);
}

const dependencySamples = {
  "ak-button": ["@ariakit/tailwind"],
  "react-examples-disclosure": [],
  "react-examples-disclosure-actions": ["clsx", "lucide-react"],
  "react-components-disclosure": ["@ariakit/react"],
  "react-aria-disclosure": ["clsx", "react-aria-components"],
  "react-utils-create-render": [],
  "react-hooks-use-is-mobile": [],
};

for (const [name, dependencies] of Object.entries(dependencySamples)) {
  test(`registry item ${name} has correct dependencies`, async ({ page }) => {
    const item = await fetchRegistryItem(page, name);
    expect(item.dependencies).toEqual(
      dependencies.map((dependency) =>
        expect.stringMatching(depRegex(dependency)),
      ),
    );
  });
}

const registryDependencySamples = {
  "ak-button": ["ak-aurora", "ak-command"],
  "react-examples-disclosure": ["react-ariakit-disclosure"],
  "react-examples-disclosure-actions": [
    "ak-badge",
    "ak-heading",
    "ak-link",
    "ak-table",
    "react-ariakit-disclosure",
    "react-ariakit-select",
    "react-ariakit-table",
  ],
  "react-components-disclosure": ["ak-disclosure", "ak-prose"],
  "react-aria-disclosure": [
    "ak-command",
    "ak-disclosure",
    "ak-prose",
    "react-utils-create-render",
  ],
  "react-ariakit-list": [
    "ak-list",
    "react-ariakit-disclosure",
    "react-utils-create-render",
  ],
  "react-utils-create-render": [
    "react-utils-is-iterable",
    "react-utils-merge-props",
  ],
  "react-hooks-use-is-mobile": [],
};

for (const [name, dependencies] of Object.entries(registryDependencySamples)) {
  test(`registry item ${name} has correct registry dependencies`, async ({
    page,
    baseURL,
  }) => {
    const item = await fetchRegistryItem(page, name);
    expect(item.registryDependencies).toEqual(
      dependencies.map((dependency) => `${baseURL}/r/${dependency}.json`),
    );
  });
}

const styleImportPathSamples = {
  "ak-button": ["../components/ui/button.css"],
  "ak-aurora": ["../components/ui/aurora.css"],
};

for (const [name, paths] of Object.entries(styleImportPathSamples)) {
  test(`registry item ${name} has correct import paths for styles`, async ({
    page,
  }) => {
    const item = await fetchRegistryItem(page, name);
    for (const path of paths) {
      expect(item.css?.[`@import "${path}"`]).toEqual({});
    }
  });
}

const importPathSamples = {
  "react-utils-create-render": [
    "@/registry/lib/is-iterable",
    "@/registry/lib/merge-props",
  ],
  "react-examples-disclosure": ["@/registry/ui/disclosure"],
  "react-examples-disclosure-actions": [
    "@/registry/ui/disclosure",
    "@/registry/ui/select",
    "@/registry/ui/table",
    "./orders",
  ],
  "react-aria-disclosure": ["@/registry/lib/create-render"],
  "react-ariakit-list": [
    "@/registry/ui/disclosure",
    "@/registry/lib/create-render",
  ],
};

for (const [name, paths] of Object.entries(importPathSamples)) {
  test(`registry item ${name} has correct import paths`, async ({ page }) => {
    const item = await fetchRegistryItem(page, name);
    const contents = item.files?.reduce((contents, file) => {
      if (!file.content) return contents;
      return `${contents}\n${file.content}`;
    }, "");
    for (const path of paths) {
      expect(contents).toContain(`"${path}"`);
    }
  });
}
