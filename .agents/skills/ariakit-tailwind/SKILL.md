---
name: ariakit-tailwind
description: Instructions for the @ariakit/tailwind package. Always use when planning or implementing changes to the package.
---

# Ariakit Tailwind Instructions

- We're in the process of migrating to a new Tailwind CSS plugin system. You can disregard the existing `plugin.js` and related files. It's fine to use them as a reference when stuck, but we use new patterns in the new system.

## Abstracting constant expressions into `@property` custom properties

To reduce bloat in generated CSS utilities, extract any `calc()` sub-expression that does **not** depend on other CSS custom properties (`var(...)`) into a `@property` custom property with an `initial-value`. This way the expression lives in one place (the `@property` declaration) and every use-site becomes a short `var(--name)` reference instead of inlining the full expression.

### When to apply this pattern

- The expression only depends on color channels (`l`, `c`, `h`) from `oklch(from …)` relative color syntax and/or fixed numeric constants.
- `var()` references to other CSS custom properties are **not** allowed in `initial-value` — only static tokens and color channels.
- The expression appears inside at least one `@utility` body (or is referenced multiple times), so extracting it produces a net reduction in utility body size.

### Where to register these constants

Add the `@property` to `constantMathVars` in `src/input.ts` using `_ak.prop("short-name", { initial: expression })`. The short name is the abbreviated form used in the generated CSS ident (`--_ak-short-name`).

```ts
const constantMathVars = {
  // existing entries …
  myConstant: _ak.prop("mc", { initial: fn.mul(fn.sub(THRESHOLD, "l"), 1e6) }),
};
```

Then reference it via `vars.myConstant` wherever the expression was previously inlined. Because `@property` has `inherits: false`, the initial value is resolved per element inside any `oklch(from … var(--_ak-mc) …)` context without requiring an explicit `var()` fallback.

### Input properties with constant defaults

For input custom properties that have a fixed default value (e.g., `0`, `1`, `0.1`), declare them with `{ initial: N }` instead of passing the number directly. This gives the `@property` an `initial-value` and removes the need for an inline `, N` fallback in every `var(--name)` reference inside the utility body:

```ts
// Before — generates var(--_ak-layer-auto-lightness, 0) everywhere
layerAutoL: _ak.prop("layer-auto-lightness", 0),

// After — @property gets initial-value: 0; references become var(--_ak-layer-auto-lightness)
layerAutoL: _ak.prop("layer-auto-lightness", { initial: 0 }),
```

> **Note:** Do not use `{ initial: someVar }` — `initial-value` cannot contain `var()` references. Only use this pattern for hard-coded numeric or token values.
