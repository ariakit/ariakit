const browserCodes = { chromium: "c", firefox: "f", webkit: "s" };

/** Check one complete shard against item/variant pairs from trusted main. */
export function verifyItemCoverage(registry, manifest, browser) {
  const code = browserCodes[browser];
  if (
    registry.schemaVersion !== 2 ||
    !registry.items ||
    typeof registry.items !== "object" ||
    Array.isArray(registry.items) ||
    !Array.isArray(manifest.tests) ||
    !Array.isArray(manifest.captures) ||
    !code
  ) {
    throw new Error("Invalid trusted variant registry or capture manifest");
  }
  const expectedItems = new Set();
  const expectedPairs = new Set();
  for (const [item, browsers] of Object.entries(registry.items)) {
    if (
      !item ||
      !browsers ||
      typeof browsers !== "object" ||
      Array.isArray(browsers)
    ) {
      throw new Error(`Invalid trusted variants for ${item}`);
    }
    for (const [browserCode, variants] of Object.entries(browsers)) {
      if (
        !Object.values(browserCodes).includes(browserCode) ||
        !Array.isArray(variants) ||
        !variants.length
      ) {
        throw new Error(`Invalid trusted browser variants for ${item}`);
      }
      for (const suffix of variants) {
        if (
          typeof suffix !== "string" ||
          !/^[a-z0-9][a-z0-9/_-]*$/.test(suffix)
        ) {
          throw new Error(`Invalid trusted variant key for ${item}`);
        }
        if (browserCode === code) {
          expectedItems.add(item);
          const pair = `${item}\u0000${browser}/${suffix}`;
          if (expectedPairs.has(pair))
            throw new Error(`Duplicate trusted variant for ${item}`);
          expectedPairs.add(pair);
        }
      }
    }
  }
  if (!expectedPairs.size) throw new Error(`No trusted ${browser} variants`);
  const actualItems = new Set();
  const actualPairs = new Set();
  const capturedTests = new Set();
  for (const capture of manifest.captures) {
    const item = capture.itemKey;
    const variant = capture.variantKey;
    if (
      typeof item !== "string" ||
      !item ||
      typeof variant !== "string" ||
      !variant.startsWith(`${browser}/`)
    ) {
      throw new Error("Capture has no valid item/variant identity");
    }
    const pair = `${item}\u0000${variant}`;
    if (actualPairs.has(pair))
      throw new Error(`Duplicate capture identity: ${item} ${variant}`);
    actualItems.add(item);
    actualPairs.add(pair);
    capturedTests.add(capture.testId);
  }
  const emptyTests = manifest.tests.filter(
    (test) => !capturedTests.has(test.id),
  );
  if (emptyTests.length) {
    throw new Error(
      `The @visual suite collected ${emptyTests.length} tests without captures: ${emptyTests.map((test) => test.id).join(", ")}`,
    );
  }
  const missing = [...expectedPairs].filter((pair) => !actualPairs.has(pair));
  if (missing.length) {
    throw new Error(
      `The complete @visual suite missed ${missing.length} trusted variants: ${missing
        .slice(0, 10)
        .map((pair) => pair.replace("\u0000", " "))
        .join(", ")}`,
    );
  }
  return {
    requiredItems: expectedItems.size,
    requiredVariants: expectedPairs.size,
    addedItems: [...actualItems].filter((item) => !expectedItems.has(item))
      .length,
    addedVariants: actualPairs.size - expectedPairs.size,
  };
}
