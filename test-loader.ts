export const allowedTestLoaders = ["react", "solid"] as const;
export type AllowedTestLoader = (typeof allowedTestLoaders)[number];

export function isAllowedTestLoader(value: string): value is AllowedTestLoader {
  return allowedTestLoaders.some((loader) => loader === value);
}

export function getTestLoader(): AllowedTestLoader | undefined;
export function getTestLoader(
  defaultLoader: AllowedTestLoader,
): AllowedTestLoader;
export function getTestLoader(defaultLoader?: AllowedTestLoader) {
  const loader = process.env.ARIAKIT_TEST_LOADER ?? defaultLoader;
  if (!loader) return undefined;
  if (isAllowedTestLoader(loader)) return loader;
  throw new Error(`Invalid loader: ${loader}`);
}
