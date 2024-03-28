import type { FrameLocator, Locator, Page } from "@playwright/test";
import { roles } from "./__aria-role.ts";
import type { AriaRole } from "./__aria-role.ts";

type RoleQuery = (
  name?: string | RegExp,
  options?: Parameters<Page["getByRole"]>[1],
) => Locator;

type RoleQueries = Record<AriaRole, RoleQuery>;

export function query(locator: Page | Locator | FrameLocator) {
  const roleQueries = roles.reduce((acc, role) => {
    acc[role] = (name, options) =>
      locator.getByRole(role, { name, ...options });
    return acc;
  }, {} as RoleQueries);

  return roleQueries;
}
