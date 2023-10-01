import {
  queryByLabelText,
  queryByRole,
  queryByText,
} from "@testing-library/dom";
import type {
  ByRoleOptions,
  Matcher,
  SelectorMatcherOptions,
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

function createRoleQuery(role: AriaRole) {
  const fn = (name?: string | RegExp, options?: ByRoleOptions) => {
    if (!name) {
      return queryByRole(document.body, role, options);
    }

    const matchName = (accessibleName: string) => {
      if (typeof name === "string") {
        return accessibleName === name;
      }
      return name.test(accessibleName);
    };

    return queryByRole(document.body, role, {
      name(accessibleName, element) {
        if (matchName(accessibleName)) return true;
        const labeledBy = element.getAttribute("aria-labelledby");
        if (!labeledBy) return false;
        const label = document.getElementById(labeledBy);
        if (!label?.textContent) return false;
        return matchName(label.textContent);
      },
      ...options,
    });
  };

  const includesHidden = (name?: string | RegExp, options?: ByRoleOptions) =>
    fn(name, { hidden: true, ...options });

  return Object.assign(fn, { includesHidden });
}

const roleQueries = roles.reduce((acc, role) => {
  acc[role] = createRoleQuery(role);
  return acc;
}, {} as RoleQueries);

export const query = {
  ...roleQueries,
  text: (text: Matcher, options?: SelectorMatcherOptions) =>
    queryByText(document.body, text, options),
  labeled: (label: Matcher, options?: SelectorMatcherOptions) =>
    queryByLabelText(document.body, label, options),
};

export const q = query;
