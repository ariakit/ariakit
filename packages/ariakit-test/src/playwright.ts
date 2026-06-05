import type { FrameLocator, Locator, Page } from "@playwright/test";
import type { AriaRole } from "./__aria-role.ts";
import { roles } from "./__aria-role.ts";

type RoleQuery = (
  name?: string | RegExp,
  options?: Parameters<Page["getByRole"]>[1],
) => Locator;

type TextQuery = (
  name: Parameters<Page["getByText"]>[0],
  options?: Parameters<Page["getByText"]>[1],
) => Locator;

type RoleQueries = Record<AriaRole, RoleQuery>;

type Queries = RoleQueries & { text: TextQuery };

/**
 * Creates role- and text-based query helpers for a Playwright `Page`, `Locator`,
 * or `FrameLocator`. Call a role method such as `query(page).button(name)` to get
 * a `Locator` from `getByRole`, or `query(page).text(name)` to match by text
 * content.
 *
 * Names are matched exactly by default. This mirrors the role-based `query` from
 * the package root for end-to-end Playwright tests.
 * @example
 * ```ts
 * const { button, dialog } = query(page);
 * await button("Open").click();
 * await expect(dialog()).toBeVisible();
 * ```
 */
export function query(locator: Page | Locator | FrameLocator): Queries {
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
