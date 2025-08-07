import { invariant } from "@ariakit/core/utils/misc";
import type {
  ByRoleMatcher,
  ByRoleOptions,
  getQueriesForElement,
} from "@testing-library/dom";
import { queries as baseQueries } from "@testing-library/dom";
import type { AriaRole } from "./__aria-role.ts";
import { roles } from "./__aria-role.ts";

type RoleQueries = Record<AriaRole, ReturnType<typeof createRoleQuery>>;
type ElementQueries = ReturnType<
  typeof getQueriesForElement<typeof baseQueries>
>;

function createQueries(container?: HTMLElement) {
  return Object.entries(baseQueries).reduce((queries, [key, query]) => {
    // @ts-expect-error
    queries[key] = (...args) => query(container || document.body, ...args);
    return queries;
  }, {} as ElementQueries);
}

const documentQueries = createQueries();

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

  const createIncludesHidden =
    <T extends ReturnType<typeof createQuery>>(query: T) =>
    (name?: string | RegExp, options?: ByRoleOptions): ReturnType<T> =>
      query(name, { hidden: true, ...options });

  const query = createQuery(queries.queryByRole);
  const allQuery = createQuery(queries.queryAllByRole);
  const waitQuery = createQuery(queries.findByRole);
  const waitAllQuery = createQuery(queries.findAllByRole);
  const ensureQuery = createQuery(queries.getByRole);
  const ensureAllQuery = createQuery(queries.getAllByRole);

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

function createTextQuery(queries = documentQueries) {
  const all = Object.assign(queries.queryAllByText, {
    wait: queries.findAllByText,
    ensure: queries.getAllByText,
  });

  const wait = Object.assign(queries.findByText, {
    all: queries.findAllByText,
  });

  const ensure = Object.assign(queries.getByText, {
    all: queries.getAllByText,
  });

  return Object.assign(queries.queryByText, { all, wait, ensure });
}

function createLabeledQuery(queries = documentQueries) {
  const all = Object.assign(queries.queryAllByLabelText, {
    wait: queries.findAllByLabelText,
    ensure: queries.getAllByLabelText,
  });

  const wait = Object.assign(queries.findByLabelText, {
    all: queries.findAllByLabelText,
  });

  const ensure = Object.assign(queries.getByLabelText, {
    all: queries.getAllByLabelText,
  });

  return Object.assign(queries.queryByLabelText, { all, wait, ensure });
}

function createQueryObject(queries = documentQueries) {
  return {
    ...createRoleQueries(queries),
    text: createTextQuery(queries),
    labeled: createLabeledQuery(queries),
    within: (element?: HTMLElement | null) => {
      invariant(element, "Unable to create queries for null element");
      return createQueryObject(createQueries(element));
    },
  };
}

export const query = createQueryObject();

export const q = query;
