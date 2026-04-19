import type { FrameLocator, Locator, Page } from "@playwright/test";
import type { AriaRole } from "./__aria-role.ts";
import { roles } from "./__aria-role.ts";

type RoleQuery = (
  name?: string | RegExp,
  options?: Parameters<Page["getByRole"]>[1],
) => Locator;

type RoleQueries = Record<AriaRole, RoleQuery>;

export function query(locator: Page | Locator | FrameLocator) {
  const roleQueries = roles.reduce((acc, role) => {
    acc[role] = (name, options) =>
      locator.getByRole(role, { name, exact: true, ...options });
    return acc;
  }, {} as RoleQueries);

  const text = (
    name: Parameters<Page["getByText"]>[0],
    options?: Parameters<Page["getByText"]>[1],
  ) => locator.getByText(name, { exact: true, ...options });

  return {
    ...roleQueries,
    text,
  };
}

export * from "@playwright/test";
