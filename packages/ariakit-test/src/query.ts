// oxlint-disable unbound-method
import { invariant } from "@ariakit/utils";
import type { AriaRole } from "./__aria-role.ts";
import { roles } from "./__aria-role.ts";
import type { ByRoleOptions, SelectorMatcherOptions } from "./__dom/queries.ts";
import {
  queryAllByLabelText,
  queryAllByRole,
  queryAllByText,
} from "./__dom/queries.ts";
import type { Matcher } from "./__dom/text-content.ts";
import type { WaitForOptions } from "./__dom/wait-for.ts";
import { waitFor } from "./__dom/wait-for.ts";

type Query = ReturnType<typeof createRoleQuery>;
type TextQuery = ReturnType<typeof createTextQuery>;
type LabeledQuery = ReturnType<typeof createLabeledQuery>;
type RoleQueries = Record<AriaRole, Query>;

interface QueryObject extends RoleQueries {
  text: TextQuery;
  labeled: LabeledQuery;
  within: (element?: HTMLElement | null) => QueryObject;
}

// Resolves the container a query runs against: the scoped element, or the
// document body when the query is unscoped (`query`/`q`).
function resolveContainer(container?: HTMLElement) {
  return container ?? document.body;
}

// Returns the single match (or `null`), throwing when more than one element
// matched. This is the default `q.<role>()`/`q.text()` behavior.
function single(
  elements: HTMLElement[],
  description: string,
): HTMLElement | null {
  if (elements.length > 1) {
    throw new Error(`Found multiple elements with the ${description}`);
  }
  return elements[0] ?? null;
}

// Returns the single match, throwing when none or more than one matched. Backs
// the `.ensure()` variant and the eventual resolution of `.wait()`.
function ensureSingle(
  elements: HTMLElement[],
  description: string,
): HTMLElement {
  const element = single(elements, description);
  if (element) return element;
  throw new Error(`Unable to find an element with the ${description}`);
}

// Returns all matches, throwing when none matched. Backs `.all.ensure()` and the
// resolution of `.all.wait()`.
function ensureAll(
  elements: HTMLElement[],
  description: string,
): HTMLElement[] {
  if (elements.length) return elements;
  throw new Error(`Unable to find an element with the ${description}`);
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

function describeRole(role: AriaRole, name?: string | RegExp) {
  if (name === undefined) return `role "${role}"`;
  if (typeof name === "string") return `role "${role}" and name "${name}"`;
  return `role "${role}" and name \`${String(name)}\``;
}

function createRoleQuery(role: AriaRole, container?: HTMLElement) {
  // All elements matching `role` and the given name/options. `getNameOption`
  // applies this package's accessible-name matching (placeholder/label
  // fallbacks) on top of the role query.
  const all = (
    name?: string | RegExp,
    options?: ByRoleOptions,
  ): HTMLElement[] =>
    queryAllByRole(resolveContainer(container), role, {
      name: getNameOption(name, options?.hidden),
      ...options,
    });

  const query = (name?: string | RegExp, options?: ByRoleOptions) =>
    single(all(name, options), describeRole(role, name));

  const allQuery = (name?: string | RegExp, options?: ByRoleOptions) =>
    all(name, options);

  const ensureQuery = (name?: string | RegExp, options?: ByRoleOptions) =>
    ensureSingle(all(name, options), describeRole(role, name));

  const ensureAllQuery = (name?: string | RegExp, options?: ByRoleOptions) =>
    ensureAll(all(name, options), describeRole(role, name));

  const waitQuery = (
    name?: string | RegExp,
    options?: ByRoleOptions,
    waitOptions?: WaitForOptions,
  ) =>
    waitFor(() => ensureSingle(all(name, options), describeRole(role, name)), {
      container: resolveContainer(container),
      ...waitOptions,
    });

  const waitAllQuery = (
    name?: string | RegExp,
    options?: ByRoleOptions,
    waitOptions?: WaitForOptions,
  ) =>
    waitFor(() => ensureAll(all(name, options), describeRole(role, name)), {
      container: resolveContainer(container),
      ...waitOptions,
    });

  const createIncludesHidden =
    <Result>(
      query: (name?: string | RegExp, options?: ByRoleOptions) => Result,
    ) =>
    (name?: string | RegExp, options?: ByRoleOptions): Result =>
      query(name, { hidden: true, ...options });

  const allVariant = Object.assign(allQuery, {
    includesHidden: createIncludesHidden(allQuery),
    wait: Object.assign(waitAllQuery, {
      includesHidden: createIncludesHidden(waitAllQuery),
    }),
    ensure: Object.assign(ensureAllQuery, {
      includesHidden: createIncludesHidden(ensureAllQuery),
    }),
  });

  const waitVariant = Object.assign(waitQuery, {
    includesHidden: createIncludesHidden(waitQuery),
    all: Object.assign(waitAllQuery, {
      includesHidden: createIncludesHidden(waitAllQuery),
    }),
  });

  const ensureVariant = Object.assign(ensureQuery, {
    includesHidden: createIncludesHidden(ensureQuery),
    all: Object.assign(ensureAllQuery, {
      includesHidden: createIncludesHidden(ensureAllQuery),
    }),
  });

  return Object.assign(query, {
    includesHidden: createIncludesHidden(query),
    all: allVariant,
    wait: waitVariant,
    ensure: ensureVariant,
  });
}

function createRoleQueries(container?: HTMLElement) {
  return roles.reduce((acc, role) => {
    acc[role] = createRoleQuery(role, container);
    return acc;
  }, {} as RoleQueries);
}

// Builds the `.all`/`.wait`/`.ensure` shape shared by the text and label-text
// queries from a `queryAllBy*` primitive. These have no name option or
// `.includesHidden` variant, so the structure is simpler than the role query.
function createTextLikeQuery(
  queryAll: (
    container: HTMLElement,
    text: Matcher,
    options?: SelectorMatcherOptions,
  ) => HTMLElement[],
  describe: (text: Matcher) => string,
  container?: HTMLElement,
) {
  const all = (text: Matcher, options?: SelectorMatcherOptions) =>
    queryAll(resolveContainer(container), text, options);

  const queryBy = (text: Matcher, options?: SelectorMatcherOptions) =>
    single(all(text, options), describe(text));

  const getAllBy = (text: Matcher, options?: SelectorMatcherOptions) =>
    ensureAll(all(text, options), describe(text));

  const getBy = (text: Matcher, options?: SelectorMatcherOptions) =>
    ensureSingle(all(text, options), describe(text));

  const findAllBy = (
    text: Matcher,
    options?: SelectorMatcherOptions,
    waitOptions?: WaitForOptions,
  ) =>
    waitFor(() => getAllBy(text, options), {
      container: resolveContainer(container),
      ...waitOptions,
    });

  const findBy = (
    text: Matcher,
    options?: SelectorMatcherOptions,
    waitOptions?: WaitForOptions,
  ) =>
    waitFor(() => getBy(text, options), {
      container: resolveContainer(container),
      ...waitOptions,
    });

  return Object.assign(queryBy, {
    all: Object.assign(all, { wait: findAllBy, ensure: getAllBy }),
    wait: Object.assign(findBy, { all: findAllBy }),
    ensure: Object.assign(getBy, { all: getAllBy }),
  });
}

function createTextQuery(container?: HTMLElement) {
  return createTextLikeQuery(
    queryAllByText,
    (text) => `text: ${String(text)}`,
    container,
  );
}

function createLabeledQuery(container?: HTMLElement) {
  return createTextLikeQuery(
    queryAllByLabelText,
    (text) => `label text: ${String(text)}`,
    container,
  );
}

function createQueryObject(container?: HTMLElement): QueryObject {
  return {
    ...createRoleQueries(container),
    text: createTextQuery(container),
    labeled: createLabeledQuery(container),
    within: (element?: HTMLElement | null) => {
      invariant(element, "Unable to create queries for null element");
      return createQueryObject(element);
    },
  };
}

/**
 * Queries the DOM by ARIA role, accessible name, text, or label. Call a role
 * method such as `query.button(name)` or
 * `query.dialog()` to get the matching element (or `null`), passing a string or
 * `RegExp` to match its accessible name. Use `query.text()` and `query.labeled()`
 * to query by text content or associated label, and `query.within(element)` to
 * scope queries to a subtree.
 *
 * Every query also exposes `.all` (return all matches), `.wait` (resolve once the
 * element appears), and `.ensure` (throw when it's missing) variants, and role
 * queries additionally expose `.includesHidden` to include otherwise-hidden
 * elements.
 * @example
 * ```ts
 * await click(query.button("Open"));
 * expect(query.dialog()).toBeVisible();
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
 * expect(q.dialog()).toBeVisible();
 * ```
 */
export const q = query;
