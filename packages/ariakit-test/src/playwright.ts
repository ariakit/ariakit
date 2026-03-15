import type { Page } from "@playwright/test";
import type { AriaRole } from "./__aria-role.ts";
import { roles } from "./__aria-role.ts";

interface QueryRoot<TLocator extends QueryRoot<TLocator>> {
  getByRole(
    role: AriaRole,
    options?: Parameters<Page["getByRole"]>[1],
  ): TLocator;
  getByText(...args: Parameters<Page["getByText"]>): TLocator;
}

type RoleQuery<TLocator extends QueryRoot<TLocator>> = (
  name?: string | RegExp,
  options?: Parameters<Page["getByRole"]>[1],
) => TLocator;

type RoleQueries<TLocator extends QueryRoot<TLocator>> = Record<
  AriaRole,
  RoleQuery<TLocator>
>;

type WithinQuery<TLocator extends QueryRoot<TLocator>> = ((
  locator: QueryRoot<TLocator>,
) => QueryObject<TLocator>) &
  Record<
    AriaRole,
    (
      name?: string | RegExp,
      options?: Parameters<Page["getByRole"]>[1],
    ) => QueryObject<TLocator>
  > & {
    text: (...args: Parameters<Page["getByText"]>) => QueryObject<TLocator>;
  };

interface QueryObject<TLocator extends QueryRoot<TLocator>>
  extends RoleQueries<TLocator> {
  text: (...args: Parameters<Page["getByText"]>) => TLocator;
  within: WithinQuery<TLocator>;
}

function createRoleQueries<T>(
  getQuery: (role: AriaRole) => T,
): Record<AriaRole, T> {
  return roles.reduce(
    (acc, role) => {
      acc[role] = getQuery(role);
      return acc;
    },
    {} as Record<AriaRole, T>,
  );
}

function createWithinQuery<TLocator extends QueryRoot<TLocator>>(
  locator: QueryRoot<TLocator>,
): WithinQuery<TLocator> {
  const within = ((root) => query(root)) as WithinQuery<TLocator>;

  const roleQueries = createRoleQueries((role) => {
    return (
      name?: string | RegExp,
      options?: Parameters<Page["getByRole"]>[1],
    ) => query(locator.getByRole(role, { name, ...options }));
  });

  const text = (...args: Parameters<Page["getByText"]>) =>
    query(locator.getByText(...args));

  return Object.assign(within, roleQueries, { text });
}

export function query<TLocator extends QueryRoot<TLocator>>(
  locator: QueryRoot<TLocator>,
): QueryObject<TLocator> {
  const roleQueries = createRoleQueries((role) => {
    return (
      name?: string | RegExp,
      options?: Parameters<Page["getByRole"]>[1],
    ) => locator.getByRole(role, { name, ...options });
  });

  const text = (...args: Parameters<Page["getByText"]>) =>
    locator.getByText(...args);

  return {
    ...roleQueries,
    text,
    within: createWithinQuery(locator),
  };
}

export * from "@playwright/test";
