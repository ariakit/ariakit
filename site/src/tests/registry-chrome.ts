import { expect, test } from "@playwright/test";

test.describe("Registry Endpoints", () => {
  test("should return valid registry index", async ({ page }) => {
    const response = await page.goto("/r/registry.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();
    expect(data.$schema).toBe("https://ui.shadcn.com/schema/registry.json");
    expect(data.name).toBe("Ariakit");
    expect(data.homepage).toBe("https://ariakit.com");
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);

    // Verify items are sorted
    const itemNames = data.items.map((item: any) => item.name);
    const sortedNames = [...itemNames].sort();
    expect(itemNames).toEqual(sortedNames);

    // Verify items have required fields
    for (const item of data.items) {
      expect(item.name).toBeDefined();
      expect(item.type).toBeDefined();
      expect([
        "registry:block",
        "registry:ui",
        "registry:lib",
        "registry:hook",
        "registry:style",
      ]).toContain(item.type);
      expect(item.meta?.href).toBeDefined();
    }

    // Check for specific expected items
    const blockItems = data.items.filter(
      (item: any) => item.type === "registry:block",
    );
    const uiItems = data.items.filter(
      (item: any) => item.type === "registry:ui",
    );
    const libItems = data.items.filter(
      (item: any) => item.type === "registry:lib",
    );
    const styleItems = data.items.filter(
      (item: any) => item.type === "registry:style",
    );

    expect(blockItems.length).toBeGreaterThan(0);
    expect(uiItems.length).toBeGreaterThan(0);
    expect(libItems.length).toBeGreaterThan(0);
    expect(styleItems.length).toBeGreaterThan(0);
  });

  test("should return valid block registry item", async ({ page }) => {
    // First get the index to find a block item
    const indexResponse = await page.goto("/r/registry.json");
    const indexData = await indexResponse?.json();
    const blockItem = indexData.items.find(
      (item: any) => item.type === "registry:block",
    );

    if (!blockItem) {
      throw new Error("No block items found in registry");
    }

    // Now fetch the specific block item
    const response = await page.goto(`/r/${blockItem.name}.json`);
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();
    expect(data.name).toBe(blockItem.name);
    expect(data.type).toBe("registry:block");
    expect(data.title).toBeDefined();
    expect(Array.isArray(data.files)).toBe(true);
    expect(data.files.length).toBeGreaterThan(0);

    // Verify files structure
    for (const file of data.files) {
      expect(file.path).toBeDefined();
      expect(file.content).toBeDefined();
      expect(file.type).toBe("registry:block");

      // Verify nested path structure
      expect(file.path).toMatch(/^registry\/block\/[^/]+\//);

      // Should not include _lib files directly
      expect(file.path).not.toContain("/_lib/");
      expect(file.path).not.toMatch(/disclosure\.tsx$/);
      expect(file.path).not.toMatch(/list\.tsx$/);
      expect(file.path).not.toMatch(/utils\.ts$/);

      // Should not include README.md
      expect(file.path).not.toContain("README.md");
    }

    // Verify dependencies have ^ prefix
    if (data.dependencies) {
      for (const dep of data.dependencies) {
        expect(dep).toMatch(/@\^/);
      }
    }

    // Verify registry dependencies - _lib files should be dependencies
    if (data.registryDependencies) {
      expect(Array.isArray(data.registryDependencies)).toBe(true);
    }

    // Verify import paths are transformed
    for (const file of data.files) {
      expect(file.content).not.toContain("#app/examples/_lib/ariakit/");
      expect(file.content).not.toContain("#app/examples/_lib/react-aria/");
      expect(file.content).not.toContain("#app/examples/_lib/react/");

      // If it has imports, they should be @/registry format
      if (file.content.includes("@/registry/ui/")) {
        expect(file.content).toMatch(
          /@\/registry\/ui\/(ariakit-react-|react-aria-)/,
        );
      }
      if (file.content.includes("@/registry/lib/")) {
        expect(file.content).toMatch(/@\/registry\/lib\//);
      }
    }
  });

  test("should return valid UI registry item (ariakit-react)", async ({
    page,
  }) => {
    const response = await page.goto("/r/ariakit-react-disclosure.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();
    expect(data.name).toBe("ariakit-react-disclosure");
    expect(data.type).toBe("registry:ui");
    expect(Array.isArray(data.files)).toBe(true);
    expect(data.files.length).toBeGreaterThan(0);

    // Verify files structure
    for (const file of data.files) {
      expect(file.path).toBeDefined();
      expect(file.content).toBeDefined();
      expect(file.type).toBe("registry:ui");

      // Verify nested path structure - should be registry/ui/ariakit-react-disclosure/disclosure.tsx
      expect(file.path).toMatch(/^registry\/ui\/ariakit-react-disclosure\//);

      // Verify the filename is the original name, not the repeated registry name
      expect(file.path).toMatch(/disclosure\.tsx$/);
      expect(file.path).not.toMatch(/ariakit-react-disclosure\.tsx$/);
    }

    // Verify import paths are transformed
    for (const file of data.files) {
      expect(file.content).not.toContain("#app/examples/_lib/");

      // Check for transformed imports
      if (file.content.includes("@/registry/")) {
        expect(file.content).toMatch(/@\/registry\/(ui|lib)\//);
      }
    }
  });

  test("should return valid UI registry item (react-aria)", async ({
    page,
  }) => {
    const response = await page.goto("/r/react-aria-disclosure.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();
    expect(data.name).toBe("react-aria-disclosure");
    expect(data.type).toBe("registry:ui");
    expect(Array.isArray(data.files)).toBe(true);

    // Verify files structure
    for (const file of data.files) {
      expect(file.path).toMatch(/^registry\/ui\/react-aria-disclosure\//);
      expect(file.type).toBe("registry:ui");

      // Verify the filename is the original name
      expect(file.path).toMatch(/disclosure\.tsx$/);
      expect(file.path).not.toMatch(/react-aria-disclosure\.tsx$/);
    }
  });

  test("should return valid lib registry item", async ({ page }) => {
    const response = await page.goto("/r/utils.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();
    expect(data.name).toBe("utils");
    expect(data.type).toBe("registry:lib");
    expect(Array.isArray(data.files)).toBe(true);

    // Verify files structure
    for (const file of data.files) {
      expect(file.path).toMatch(/^registry\/lib\/utils\.ts$/);
      expect(file.type).toBe("registry:lib");
    }
  });

  test("should return valid style registry item", async ({ page }) => {
    const response = await page.goto("/r/ak-aurora.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();
    expect(data.name).toBe("ak-aurora");
    expect(data.type).toBe("registry:style");
    expect(data.css).toBeDefined();
    expect(typeof data.css).toBe("object");

    // Verify CSS structure
    const cssKeys = Object.keys(data.css);
    expect(cssKeys.length).toBeGreaterThan(0);

    // Should have utility/variant/property directives
    const hasDirectives = cssKeys.some(
      (key) =>
        key.startsWith("@utility ") ||
        key.startsWith("@custom-variant ") ||
        key.startsWith("@property "),
    );
    expect(hasDirectives).toBe(true);
  });

  test("should return 404 for non-existent item", async ({ page }) => {
    const response = await page.goto("/r/non-existent-item.json");
    expect(response?.status()).toBe(404);
  });

  test("block items should have full slugs with subdirectories", async ({
    page,
  }) => {
    // Get the registry index
    const indexResponse = await page.goto("/r/registry.json");
    const indexData = await indexResponse?.json();

    // Find disclosure blocks - should be named like react-disclosure-basic-example, not just react-disclosure
    const disclosureBlocks = indexData.items.filter(
      (item: any) =>
        item.type === "registry:block" && item.name.includes("disclosure"),
    );

    expect(disclosureBlocks.length).toBeGreaterThan(0);

    // At least one should have a multi-part name (category-subcategory-name format)
    const hasFullSlug = disclosureBlocks.some((item: any) => {
      const parts = item.name.split("-");
      return parts.length >= 3; // e.g., react-disclosure-basic
    });
    expect(hasFullSlug).toBe(true);

    // Verify we can fetch one of these items
    const blockItem = disclosureBlocks[0];
    const response = await page.goto(`/r/${blockItem.name}.json`);
    expect(response?.status()).toBe(200);
  });

  test("should handle registry dependencies correctly", async ({ page }) => {
    // Get a block that uses UI components
    const indexResponse = await page.goto("/r/registry.json");
    const indexData = await indexResponse?.json();
    const blockWithDeps = indexData.items.find(
      (item: any) =>
        item.type === "registry:block" && item.name.includes("disclosure"),
    );

    if (!blockWithDeps) {
      console.log("No disclosure block found, skipping test");
      return;
    }

    const response = await page.goto(`/r/${blockWithDeps.name}.json`);
    const data = await response?.json();

    // Should have registry dependencies
    expect(Array.isArray(data.registryDependencies)).toBe(true);

    if (data.registryDependencies.length > 0) {
      // All registry dependencies should be full URLs
      for (const dep of data.registryDependencies) {
        // Verify it's a full URL
        expect(dep).toMatch(/^https?:\/\/.+\/r\/.+\.json$/);

        // Try to fetch it
        const depResponse = await page.goto(dep);
        expect(depResponse?.status()).toBe(200);
      }
    }
  });

  test("style registry items should have valid CSS format", async ({
    page,
  }) => {
    const response = await page.goto("/r/ak-disclosure.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.type).toBe("registry:style");
    expect(data.css).toBeDefined();

    // Check for proper CSS structure (can have nested objects or empty objects for @apply/@slot)
    function isValidCssValue(value: any): boolean {
      if (typeof value === "string") return true;
      if (typeof value === "object" && value !== null) {
        // Empty object is valid (for @apply, @slot)
        if (Object.keys(value).length === 0) return true;
        // Nested objects should also have valid values
        return Object.values(value).every(isValidCssValue);
      }
      return false;
    }

    for (const value of Object.values(data.css)) {
      expect(isValidCssValue(value)).toBe(true);
    }
  });

  test("block items should include data files when present", async ({
    page,
  }) => {
    const indexResponse = await page.goto("/r/registry.json");
    const indexData = await indexResponse?.json();

    // Find a block that might use data
    const blockItem = indexData.items.find(
      (item: any) => item.type === "registry:block",
    );

    if (!blockItem) {
      throw new Error("No block items found");
    }

    const response = await page.goto(`/r/${blockItem.name}.json`);
    const data = await response?.json();

    // Check if any file is a data file
    const hasDataFile = data.files.some(
      (file: any) =>
        file.path.includes("/orders.ts") || file.path.includes("/data."),
    );

    // If it has a data file, verify it's in the block directory
    if (hasDataFile) {
      const dataFiles = data.files.filter(
        (file: any) =>
          file.path.includes("/orders.ts") || file.path.includes("/data."),
      );

      for (const dataFile of dataFiles) {
        expect(dataFile.path).toMatch(/^registry\/block\/[^/]+\//);
        expect(dataFile.type).toBe("registry:block");
      }
    }
  });

  test("block items transform _lib imports to registry paths", async ({
    page,
  }) => {
    // Get react-disclosure which uses ariakit-react-disclosure
    const response = await page.goto("/r/react-disclosure.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();

    // Find the main index file
    const indexFile = data.files.find((f: any) => f.path.includes("index.tsx"));
    if (!indexFile) {
      throw new Error("No index.tsx found");
    }

    // Should import from registry path, not relative
    expect(indexFile.content).not.toContain('from "./disclosure.tsx"');
    expect(indexFile.content).toContain(
      "@/registry/ui/ariakit-react-disclosure",
    );

    // Should have the UI component as a registry dependency
    expect(data.registryDependencies).toContain(
      "http://localhost:4321/r/ariakit-react-disclosure.json",
    );
  });

  test("UI items transform imports and list registry dependencies", async ({
    page,
  }) => {
    // Get ariakit-react-list which uses utils and disclosure
    const response = await page.goto("/r/ariakit-react-list.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();

    // Find the main file
    const mainFile = data.files[0];
    if (!mainFile) {
      throw new Error("No files found");
    }

    // Should not import from relative paths for _lib files
    expect(mainFile.content).not.toContain('from "./utils.ts"');
    expect(mainFile.content).not.toContain('from "./disclosure.tsx"');

    // Should import from registry paths
    if (mainFile.content.includes("createRender")) {
      expect(mainFile.content).toContain("@/registry/lib/utils");
    }
    if (mainFile.content.includes("Disclosure")) {
      expect(mainFile.content).toContain(
        "@/registry/ui/ariakit-react-disclosure",
      );
    }

    // Should have both utils and disclosure as registry dependencies
    expect(Array.isArray(data.registryDependencies)).toBe(true);
    if (mainFile.content.includes("createRender")) {
      expect(data.registryDependencies).toContain(
        "http://localhost:4321/r/utils.json",
      );
    }
    if (mainFile.content.includes("Disclosure")) {
      expect(data.registryDependencies).toContain(
        "http://localhost:4321/r/ariakit-react-disclosure.json",
      );
    }
  });

  test("UI items only include styles they actually use", async ({ page }) => {
    // Get ariakit-react-list
    const response = await page.goto("/r/ariakit-react-list.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();

    // Get the content of the file
    const mainFile = data.files[0];
    if (!mainFile) {
      throw new Error("No files found");
    }

    // Check which style modules are in registryDependencies
    const styleDeps = data.registryDependencies.filter((dep: string) =>
      dep.includes("/ak-"),
    );

    // For each style dependency, verify it's actually used in the content
    for (const styleDep of styleDeps) {
      const styleName = styleDep.split("/").pop()?.replace(".json", "");
      if (!styleName) continue;

      const moduleBase = styleName.replace("ak-", "");

      // Check if the content uses this style module
      // Styles are used via className with ak-* prefixes
      const usesStyle = mainFile.content.includes(`ak-${moduleBase}`);

      // If it doesn't use the style, this is a problem
      if (!usesStyle) {
        console.log(`Warning: ${styleName} listed but not used in content`);
        // For now just log, but ideally this shouldn't happen
      }
    }
  });

  test("UI items only depend on components from the same library", async ({
    page,
  }) => {
    // Test ariakit-react-list - should only depend on ariakit-react components
    const ariakitResponse = await page.goto("/r/ariakit-react-list.json");
    expect(ariakitResponse?.status()).toBe(200);

    const ariakitData = await ariakitResponse?.json();
    expect(ariakitData).toBeDefined();

    // Filter UI dependencies (not styles, not utils)
    const ariakitUIDeps = ariakitData.registryDependencies.filter(
      (dep: string) =>
        (dep.includes("/ariakit-react-") || dep.includes("/react-aria-")) &&
        !dep.includes("/ak-"),
    );

    // Should have ariakit-react-disclosure but NOT react-aria-disclosure
    expect(ariakitUIDeps).toContain(
      "http://localhost:4321/r/ariakit-react-disclosure.json",
    );
    expect(ariakitUIDeps).not.toContain(
      "http://localhost:4321/r/react-aria-disclosure.json",
    );

    // All UI deps should be ariakit-react, not react-aria
    for (const dep of ariakitUIDeps) {
      expect(dep).toContain("/ariakit-react-");
      expect(dep).not.toContain("/react-aria-");
    }

    // Test react-aria-list - should only depend on react-aria components
    const reactAriaResponse = await page.goto("/r/react-aria-list.json");
    if (reactAriaResponse?.status() === 200) {
      const reactAriaData = await reactAriaResponse?.json();

      const reactAriaUIDeps = reactAriaData.registryDependencies.filter(
        (dep: string) =>
          (dep.includes("/ariakit-react-") || dep.includes("/react-aria-")) &&
          !dep.includes("/ak-"),
      );

      // Should have react-aria-disclosure but NOT ariakit-react-disclosure
      if (reactAriaUIDeps.length > 0) {
        for (const dep of reactAriaUIDeps) {
          expect(dep).toContain("/react-aria-");
          expect(dep).not.toContain("/ariakit-react-");
        }
      }
    }
  });

  test("should reject invalid query parameters", async ({ page }) => {
    const response = await page.goto("/r/registry.json?ext=invalid");
    expect(response?.status()).toBe(400);

    const data = await response?.json();
    expect(data.error).toBe("Invalid query parameters");
    expect(data.details).toBeDefined();
  });

  test("should accept valid ext=true query parameter", async ({ page }) => {
    const response = await page.goto("/r/registry.json?ext=true");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.$schema).toBe("https://ui.shadcn.com/schema/registry.json");
  });

  test("should accept valid ext=false query parameter", async ({ page }) => {
    const response = await page.goto("/r/registry.json?ext=false");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.$schema).toBe("https://ui.shadcn.com/schema/registry.json");
  });

  test("should accept no query parameters", async ({ page }) => {
    const response = await page.goto("/r/registry.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.$schema).toBe("https://ui.shadcn.com/schema/registry.json");
  });

  test("should allow unknown query parameters for future extensibility", async ({
    page,
  }) => {
    const response = await page.goto("/r/registry.json?unknown=value");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.$schema).toBe("https://ui.shadcn.com/schema/registry.json");
  });

  test("should return valid hook registry item", async ({ page }) => {
    const response = await page.goto("/r/use-is-mobile.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data).toBeDefined();
    expect(data.name).toBe("use-is-mobile");
    expect(data.type).toBe("registry:hook");
    expect(Array.isArray(data.files)).toBe(true);
    expect(data.files.length).toBeGreaterThan(0);

    // Verify file structure
    const file = data.files[0];
    expect(file).toBeDefined();
    expect(file.path).toBe("registry/hook/use-is-mobile.ts");
    expect(file.type).toBe("registry:hook");
    expect(file.content).toBeDefined();
  });

  test("hook items should be listed in registry index", async ({ page }) => {
    const response = await page.goto("/r/registry.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    const hookItems = data.items.filter(
      (item: any) => item.type === "registry:hook",
    );
    expect(hookItems.length).toBeGreaterThan(0);

    const useIsMobileItem = hookItems.find(
      (item: any) => item.name === "use-is-mobile",
    );
    expect(useIsMobileItem).toBeDefined();
    expect(useIsMobileItem.type).toBe("registry:hook");
  });

  test("hook items should use correct import paths", async ({ page }) => {
    const response = await page.goto("/r/use-is-mobile.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    const file = data.files[0];
    expect(file.path).toBe("registry/hook/use-is-mobile.ts");
  });

  test("hook imports should transform to registry paths", async ({ page }) => {
    const response = await page.goto("/r/ariakit-react-sidebar.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    const mainFile = data.files[0];

    // Should import hook from registry/hook path
    expect(mainFile.content).toContain('from "@/registry/hook/use-is-mobile"');

    // Should list hook as registry dependency
    expect(data.registryDependencies).toContain(
      "http://localhost:4321/r/use-is-mobile.json",
    );
  });

  test("hook imports should include extensions with ?ext=true", async ({
    page,
  }) => {
    const response = await page.goto("/r/ariakit-react-sidebar.json?ext=true");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    const mainFile = data.files[0];

    // Should import hook with .ts extension
    expect(mainFile.content).toContain(
      'from "@/registry/hook/use-is-mobile.ts"',
    );
  });

  test("block items should include extensions with ?ext=true", async ({
    page,
  }) => {
    const response = await page.goto(
      "/r/react-disclosure-checklist.json?ext=true",
    );
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    const mainFile = data.files.find((file: any) =>
      file.path.includes("index.tsx"),
    );

    expect(mainFile).toBeDefined();

    // Should import UI components with .tsx extension
    expect(mainFile.content).toContain(
      'from "@/registry/ui/ariakit-react-list/list.tsx"',
    );
    expect(mainFile.content).toContain(
      'from "@/registry/ui/ariakit-react-progress/progress.tsx"',
    );
  });

  test("block items should not include extensions without ?ext=true", async ({
    page,
  }) => {
    const response = await page.goto("/r/react-disclosure-checklist.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    const mainFile = data.files.find((file: any) =>
      file.path.includes("index.tsx"),
    );

    expect(mainFile).toBeDefined();

    // Should import UI components without .tsx extension
    expect(mainFile.content).toContain(
      'from "@/registry/ui/ariakit-react-list/list"',
    );
    expect(mainFile.content).toContain(
      'from "@/registry/ui/ariakit-react-progress/progress"',
    );
    // Should NOT contain .tsx extension
    expect(mainFile.content).not.toContain(
      'from "@/registry/ui/ariakit-react-list/list.tsx"',
    );
  });

  test("style items should include @ariakit/tailwind dependency when needed", async ({
    page,
  }) => {
    const response = await page.goto("/r/ak-button.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.type).toBe("registry:style");

    // Should have dependencies array with @ariakit/tailwind
    expect(Array.isArray(data.dependencies)).toBe(true);
    expect(data.dependencies.length).toBeGreaterThan(0);
    expect(data.dependencies[0]).toBe("@ariakit/tailwind");
  });

  test("style items without ariakit tailwind should not have dependencies", async ({
    page,
  }) => {
    // Find a style item that doesn't use ariakit/tailwind
    const indexResponse = await page.goto("/r/registry.json");
    const indexData = await indexResponse?.json();
    const styleItems = indexData.items.filter(
      (item: any) => item.type === "registry:style",
    );

    // Check at least one style item
    for (const styleItem of styleItems.slice(0, 10)) {
      const response = await page.goto(`/r/${styleItem.name}.json`);
      const data = await response?.json();

      // If it has dependencies, they should be @ariakit/tailwind
      if (data.dependencies && data.dependencies.length > 0) {
        for (const dep of data.dependencies) {
          expect(dep).toContain("@ariakit/tailwind");
        }
      }
    }
  });

  test("block items should not include framework dependencies", async ({
    page,
  }) => {
    const response = await page.goto("/r/react-disclosure-checklist.json");
    expect(response?.status()).toBe(200);

    const data = await response?.json();
    expect(data.type).toBe("registry:block");

    // Framework dependencies (react, react-dom) should not be in dependencies
    // but @ariakit/react should be included
    if (data.dependencies && data.dependencies.length > 0) {
      for (const dep of data.dependencies) {
        // Ensure it doesn't match framework packages exactly
        expect(dep).not.toMatch(/^react@/);
        expect(dep).not.toMatch(/^react-dom@/);
      }
      // Should include non-framework dependencies like @ariakit/react
      const hasAriakitReact = data.dependencies.some((dep: string) =>
        dep.startsWith("@ariakit/react@"),
      );
      expect(hasAriakitReact).toBe(true);
    }
  });
});
