import { queries as baseQueries } from "@testing-library/dom";
import type {
  ByRoleMatcher,
  ByRoleOptions,
  getQueriesForElement,
} from "@testing-library/dom";

const roles = [
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "blockquote",
  "button",
  "caption",
  "cell",
  "checkbox",
  "code",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "deletion",
  "dialog",
  "directory",
  "document",
  "emphasis",
  "feed",
  "figure",
  "form",
  "generic",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "insertion",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "meter",
  "navigation",
  "none",
  "note",
  "option",
  "paragraph",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "strong",
  "subscript",
  "superscript",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "time",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
] as const;

type AriaRole = (typeof roles)[number];
type RoleQueries = Record<AriaRole, ReturnType<typeof createRoleQuery>>;
type ElementQueries = ReturnType<
  typeof getQueriesForElement<typeof baseQueries>
>;

const queries = Object.entries(baseQueries).reduce((queries, [key, query]) => {
  // @ts-expect-error
  queries[key] = (...args) => query(document.body, ...args);
  return queries;
}, {} as ElementQueries);

function matchName(name: string | RegExp, accessibleName: string | null) {
  if (accessibleName == null) return false;
  if (typeof name === "string") {
    return accessibleName === name;
  }
  return name.test(accessibleName);
}

function getNameOption(name?: string | RegExp) {
  return (accessibleName: string, element: Element | HTMLInputElement) => {
    if (element.closest("[inert]")) return false;
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

function createRoleQuery(role: AriaRole) {
  type GenericQuery = (role: ByRoleMatcher, options?: ByRoleOptions) => any;

  const createQuery = <T extends GenericQuery>(query: T) => {
    return (name?: string | RegExp, options?: ByRoleOptions): ReturnType<T> => {
      return query(role, { name: getNameOption(name), ...options });
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

function createTextQuery() {
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

function createLabeledQuery() {
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

const roleQueries = roles.reduce((acc, role) => {
  acc[role] = createRoleQuery(role);
  return acc;
}, {} as RoleQueries);

export const query = {
  ...roleQueries,
  text: createTextQuery(),
  labeled: createLabeledQuery(),
};

export const q = query;
