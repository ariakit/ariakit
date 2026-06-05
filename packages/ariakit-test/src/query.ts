// oxlint-disable unbound-method typescript/no-unnecessary-type-parameters
import { invariant } from "@ariakit/utils";
import type {
  ByRoleMatcher,
  ByRoleOptions,
  Matcher,
  SelectorMatcherOptions,
  waitForOptions,
} from "@testing-library/dom";
import { queries as baseQueries } from "@testing-library/dom";
import type { AriaRole } from "./__aria-role.ts";
import { roles } from "./__aria-role.ts";

type Query = ReturnType<typeof createRoleQuery>;
type TextQuery = ReturnType<typeof createTextQuery>;
type RoleQueries = Record<AriaRole, Query>;
type AnyQuery = (...args: any[]) => any;
type LazyQuery<T extends AnyQuery> = (
  ...args: Parameters<T>
) => () => ReturnType<T>;
type TextKind = "array" | "nullable" | "value" | "waitArray" | "waitValue";
type TextResult<Kind extends TextKind, T extends HTMLElement> = {
  array: T[];
  nullable: T | null;
  value: T;
  waitArray: Promise<T[]>;
  waitValue: Promise<T>;
}[Kind];

interface ElementQueries {
  queryByRole: RoleNullableMethod;
  queryAllByRole: RoleArrayMethod;
  findByRole: RoleWaitValueMethod;
  findAllByRole: RoleWaitArrayMethod;
  getByRole: RoleValueMethod;
  getAllByRole: RoleArrayMethod;
  queryByText: TextMethod<"nullable", TextQueryArgs>;
  queryAllByText: TextMethod<"array", TextQueryArgs>;
  findByText: TextMethod<"waitValue", TextWaitQueryArgs>;
  findAllByText: TextMethod<"waitArray", TextWaitQueryArgs>;
  getByText: TextMethod<"value", TextQueryArgs>;
  getAllByText: TextMethod<"array", TextQueryArgs>;
  queryByLabelText: TextMethod<"nullable", TextQueryArgs>;
  queryAllByLabelText: TextMethod<"array", TextQueryArgs>;
  findByLabelText: TextMethod<"waitValue", TextWaitQueryArgs>;
  findAllByLabelText: TextMethod<"waitArray", TextWaitQueryArgs>;
  getByLabelText: TextMethod<"value", TextQueryArgs>;
  getAllByLabelText: TextMethod<"array", TextQueryArgs>;
}

interface RoleNullableMethod {
  (role: ByRoleMatcher, options?: ByRoleOptions): HTMLElement | null;
}

interface RoleArrayMethod {
  (role: ByRoleMatcher, options?: ByRoleOptions): HTMLElement[];
}

interface RoleValueMethod {
  (role: ByRoleMatcher, options?: ByRoleOptions): HTMLElement;
}

interface RoleWaitArrayMethod {
  (
    role: ByRoleMatcher,
    options?: ByRoleOptions,
    waitForElementOptions?: waitForOptions,
  ): Promise<HTMLElement[]>;
}

interface RoleWaitValueMethod {
  (
    role: ByRoleMatcher,
    options?: ByRoleOptions,
    waitForElementOptions?: waitForOptions,
  ): Promise<HTMLElement>;
}

interface TextMethod<Kind extends TextKind, Args extends unknown[]> {
  <T extends HTMLElement = HTMLElement>(...args: Args): TextResult<Kind, T>;
}

interface TextVariant<
  Kind extends TextKind,
  Args extends unknown[],
> extends TextMethod<Kind, Args> {
  lazy<T extends HTMLElement = HTMLElement>(
    ...args: Args
  ): () => TextResult<Kind, T>;
}

interface TextQueryParams {
  all: TextMethod<"array", TextQueryArgs>;
  wait: TextMethod<"waitValue", TextWaitQueryArgs>;
  waitAll: TextMethod<"waitArray", TextWaitQueryArgs>;
  ensure: TextMethod<"value", TextQueryArgs>;
  ensureAll: TextMethod<"array", TextQueryArgs>;
}

interface QueryObject extends RoleQueries {
  text: TextQuery;
  labeled: TextQuery;
  within: (element?: HTMLElement | null) => QueryObject;
}

type TextQueryArgs = [id: Matcher, options?: SelectorMatcherOptions];
type TextWaitQueryArgs = [
  id: Matcher,
  options?: SelectorMatcherOptions,
  waitForElementOptions?: waitForOptions,
];

function createQueries(container?: HTMLElement) {
  return Object.entries(baseQueries).reduce((queries, [key, query]) => {
    // @ts-expect-error
    queries[key] = (...args) => query(container || document.body, ...args);
    return queries;
  }, {} as ElementQueries);
}

const documentQueries = createQueries();

function createLazyQuery<T extends AnyQuery>(query: T): LazyQuery<T> {
  return (...args) => {
    return () => query(...args);
  };
}

function assignLazy<T extends AnyQuery>(query: T) {
  return Object.assign(query, { lazy: createLazyQuery(query) });
}

function assignTextLazy<Kind extends TextKind, Args extends unknown[]>(
  query: TextMethod<Kind, Args>,
): TextVariant<Kind, Args> {
  return Object.assign(query, {
    lazy: <T extends HTMLElement = HTMLElement>(...args: Args) => {
      return () => query<T>(...args);
    },
  });
}

function matchName(name: string | RegExp, accessibleName: string | null) {
  if (accessibleName == null) return false;
  if (typeof name === "string") {
    return accessibleName === name;
  }
  return name.test(accessibleName);
}

function getNameOption(name?: string | RegExp, includesHidden?: boolean) {
  return (accessibleName: string, element: Element | HTMLInputElement) => {
    if (!includesHidden && element.closest("[inert]")) return false;
    if (!name) return true;
    if (matchName(name, accessibleName)) return true;
    if (element.getAttribute("aria-label")) return false;
    const labeledBy = element.getAttribute("aria-labelledby");
    if (!labeledBy) {
      const content =
        "placeholder" in element && element.placeholder != null
          ? element.placeholder
          : element.textContent;
      return matchName(name, content);
    }
    const label = document.getElementById(labeledBy);
    if (!label?.textContent) return false;
    return matchName(name, label.textContent);
  };
}

function createRoleQuery(role: AriaRole, queries = documentQueries) {
  type GenericQuery = (role: ByRoleMatcher, options?: ByRoleOptions) => any;

  const createQuery = <T extends GenericQuery>(query: T) => {
    return (name?: string | RegExp, options?: ByRoleOptions): ReturnType<T> => {
      return query(role, {
        name: getNameOption(name, options?.hidden),
        ...options,
      });
    };
  };

  const createIncludesHidden = <T extends ReturnType<typeof createQuery>>(
    query: T,
  ) =>
    assignLazy(
      (name?: string | RegExp, options?: ByRoleOptions): ReturnType<T> =>
        query(name, { hidden: true, ...options }),
    );

  const query = assignLazy(createQuery(queries.queryByRole));
  const allQuery = assignLazy(createQuery(queries.queryAllByRole));
  const waitQuery = assignLazy(createQuery(queries.findByRole));
  const waitAllQuery = assignLazy(createQuery(queries.findAllByRole));
  const ensureQuery = assignLazy(createQuery(queries.getByRole));
  const ensureAllQuery = assignLazy(createQuery(queries.getAllByRole));

  const all = Object.assign(allQuery, {
    includesHidden: createIncludesHidden(allQuery),
    wait: Object.assign(waitAllQuery, {
      includesHidden: createIncludesHidden(waitAllQuery),
    }),
    ensure: Object.assign(ensureAllQuery, {
      includesHidden: createIncludesHidden(ensureAllQuery),
    }),
  });

  const wait = Object.assign(waitQuery, {
    includesHidden: createIncludesHidden(waitQuery),
    all: Object.assign(waitAllQuery, {
      includesHidden: createIncludesHidden(waitAllQuery),
    }),
  });

  const ensure = Object.assign(ensureQuery, {
    includesHidden: createIncludesHidden(ensureQuery),
    all: Object.assign(ensureAllQuery, {
      includesHidden: createIncludesHidden(ensureAllQuery),
    }),
  });

  return Object.assign(query, {
    includesHidden: createIncludesHidden(query),
    all,
    wait,
    ensure,
  });
}

function createRoleQueries(queries = documentQueries) {
  return roles.reduce((acc, role) => {
    acc[role] = createRoleQuery(role, queries);
    return acc;
  }, {} as RoleQueries);
}

function createTextQuery(
  defaultQuery: TextMethod<"nullable", TextQueryArgs>,
  params: TextQueryParams,
) {
  const query = assignTextLazy(defaultQuery);
  const allQuery = assignTextLazy(params.all);

  const wait = Object.assign(assignTextLazy(params.wait), {
    all: assignTextLazy(params.waitAll),
  });

  const ensure = Object.assign(assignTextLazy(params.ensure), {
    all: assignTextLazy(params.ensureAll),
  });

  const all = Object.assign(allQuery, {
    wait: wait.all,
    ensure: ensure.all,
  });

  return Object.assign(query, { all, wait, ensure });
}

function createTextQueryObject(queries = documentQueries) {
  return createTextQuery(queries.queryByText, {
    all: queries.queryAllByText,
    wait: queries.findByText,
    waitAll: queries.findAllByText,
    ensure: queries.getByText,
    ensureAll: queries.getAllByText,
  });
}

function createLabeledQuery(queries = documentQueries) {
  return createTextQuery(queries.queryByLabelText, {
    all: queries.queryAllByLabelText,
    wait: queries.findByLabelText,
    waitAll: queries.findAllByLabelText,
    ensure: queries.getByLabelText,
    ensureAll: queries.getAllByLabelText,
  });
}

function createQueryObject(queries = documentQueries): QueryObject {
  return {
    ...createRoleQueries(queries),
    text: createTextQueryObject(queries),
    labeled: createLabeledQuery(queries),
    within: (element?: HTMLElement | null) => {
      invariant(element, "Unable to create queries for null element");
      return createQueryObject(createQueries(element));
    },
  };
}

/**
 * Queries the DOM by ARIA role, accessible name, text, or label, built on top of
 * Testing Library. Call a role method such as `query.button(name)` or
 * `query.dialog()` to get the matching element (or `null`), passing a string or
 * `RegExp` to match its accessible name. Use `query.text()` and `query.labeled()`
 * to query by text content or associated label, and `query.within(element)` to
 * scope queries to a subtree.
 *
 * Every query also exposes `.lazy` (return a reusable function that runs the
 * query when called), `.all` (return all matches), `.wait` (resolve once the
 * element appears), and `.ensure` (throw when it's missing) variants, and role
 * queries additionally expose `.includesHidden` to include otherwise-hidden
 * elements.
 * @example
 * ```ts
 * await click(query.button("Open"));
 * const dialog = query.dialog.lazy();
 * expect(dialog()).toBeVisible();
 * // Wait for an element to appear, or scope a query to a subtree:
 * await query.alert.wait();
 * query.within(query.dialog()).button("Close");
 * ```
 */
export const query = createQueryObject();

/**
 * Short alias for `query`. Queries the DOM by ARIA role, accessible name, text, or
 * label.
 * @example
 * ```ts
 * await click(q.button("Open"));
 * const dialog = q.dialog.lazy();
 * expect(dialog()).toBeVisible();
 * ```
 */
export const q = query;
