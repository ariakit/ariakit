// Part of this code is based on https://github.com/eps1lon/dom-accessibility-api/blob/v0.5.16/sources/getRole.ts
// and https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/role-helpers.js
// Original work licensed under the MIT License.

// This module resolves ARIA roles two ways, kept deliberately separate:
//   - `getRole`/`getImplicitRole` follow `dom-accessibility-api`'s HTML-AAM
//     mapping and feed the accessible name algorithm (`accessible-name.ts`).
//   - `getQueryImplicitRole` follows `aria-query` and feeds the role queries.
// They differ for a handful of native elements; merging them would change the
// accessible name those elements compute. Neither pulls in `aria-query` as a
// dependency — the data it needs is inlined.

/**
 * Returns the lowercased local name of an element, falling back to the tag
 * name for environments without `localName`.
 */
export function getLocalName(element: Element): string {
  return element.localName ?? element.tagName.toLowerCase();
}

// Maps a tag's local name to its implicit ARIA role, used by the accessible name
// algorithm. This is a faithful copy of `dom-accessibility-api`'s `getRole`
// table; the role *queries* extend it separately (see `getQueryImplicitRole`),
// because adding more roles here would wrongly change the accessible name of
// elements (e.g. name-prohibited or range roles).
const localNameToRoleMappings: { [localName: string]: string } = {
  article: "article",
  aside: "complementary",
  button: "button",
  datalist: "listbox",
  dd: "definition",
  details: "group",
  dialog: "dialog",
  dt: "term",
  fieldset: "group",
  figure: "figure",
  // WARNING: Only with an accessible name
  form: "form",
  footer: "contentinfo",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  header: "banner",
  hr: "separator",
  html: "document",
  legend: "legend",
  li: "listitem",
  math: "math",
  main: "main",
  menu: "list",
  nav: "navigation",
  ol: "list",
  optgroup: "group",
  // WARNING: Only in certain context
  option: "option",
  output: "status",
  progress: "progressbar",
  // WARNING: Only with an accessible name
  section: "region",
  summary: "button",
  table: "table",
  tbody: "rowgroup",
  textarea: "textbox",
  tfoot: "rowgroup",
  // WARNING: Only in certain context
  td: "cell",
  th: "columnheader",
  thead: "rowgroup",
  tr: "row",
  ul: "list",
};

// Roles for which `aria-label`/`aria-labelledby` (and a couple of others) are
// prohibited. Used to decide whether global ARIA attributes should override a
// presentational role.
const prohibitedAttributes: { [role: string]: Set<string> } = {
  caption: new Set(["aria-label", "aria-labelledby"]),
  code: new Set(["aria-label", "aria-labelledby"]),
  deletion: new Set(["aria-label", "aria-labelledby"]),
  emphasis: new Set(["aria-label", "aria-labelledby"]),
  generic: new Set(["aria-label", "aria-labelledby", "aria-roledescription"]),
  insertion: new Set(["aria-label", "aria-labelledby"]),
  paragraph: new Set(["aria-label", "aria-labelledby"]),
  presentation: new Set(["aria-label", "aria-labelledby"]),
  strong: new Set(["aria-label", "aria-labelledby"]),
  subscript: new Set(["aria-label", "aria-labelledby"]),
  superscript: new Set(["aria-label", "aria-labelledby"]),
};

// https://rawgit.com/w3c/aria/stable/#global_states
// Commented-out names in the upstream source are deprecated globals.
const globalAriaAttributes = [
  "aria-atomic",
  "aria-busy",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-details",
  // "disabled",
  "aria-dropeffect",
  // "errormessage",
  "aria-flowto",
  "aria-grabbed",
  // "haspopup",
  "aria-hidden",
  // "invalid",
  "aria-keyshortcuts",
  "aria-label",
  "aria-labelledby",
  "aria-live",
  "aria-owns",
  "aria-relevant",
  "aria-roledescription",
];

// Returns true if the element carries a global ARIA attribute that isn't
// prohibited for the given role. This is what lets a `role="presentation"`
// element fall back to its implicit role.
function hasGlobalAriaAttributes(element: Element, role: string): boolean {
  return globalAriaAttributes.some((attributeName) => {
    if (!element.hasAttribute(attributeName)) return false;
    const prohibited = prohibitedAttributes[role];
    if (prohibited?.has(attributeName)) return false;
    return true;
  });
}

// https://rawgit.com/w3c/aria/stable/#conflict_resolution_presentation_none
function ignorePresentationalRole(
  element: Element,
  implicitRole: string,
): boolean {
  return hasGlobalAriaAttributes(element, implicitRole);
}

/**
 * Returns the first whitespace-delimited token of the element's `role`
 * attribute, or `null` when the attribute is absent or empty.
 */
export function getExplicitRole(element: Element): string | null {
  const role = element.getAttribute("role");
  if (role !== null) {
    // `split(sep, limit)` always returns at least one member as long as the
    // limit is undefined or > 0, so the indexed access is safe.
    const explicitRole = role.trim().split(" ")[0];
    if (explicitRole && explicitRole.length > 0) return explicitRole;
  }
  return null;
}

/**
 * Computes the implicit ARIA role for an element from its tag name and
 * attributes, mirroring `dom-accessibility-api`'s `getImplicitRole`.
 */
export function getImplicitRole(element: Element): string | null {
  const mappedByTag = localNameToRoleMappings[getLocalName(element)];
  if (mappedByTag !== undefined) return mappedByTag;

  switch (getLocalName(element)) {
    case "a":
    case "area":
    case "link":
      if (element.hasAttribute("href")) return "link";
      break;
    case "img":
      if (
        element.getAttribute("alt") === "" &&
        !ignorePresentationalRole(element, "img")
      ) {
        return "presentation";
      }
      return "img";
    case "input": {
      // Read `type` off the input rather than the raw attribute so it reflects
      // the browser's defaulting (e.g. an unknown type becomes "text").
      const { type } = element as HTMLInputElement;
      switch (type) {
        case "button":
        case "image":
        case "reset":
        case "submit":
          return "button";
        case "checkbox":
        case "radio":
          return type;
        case "range":
          return "slider";
        case "email":
        case "tel":
        case "text":
        case "url":
          if (element.hasAttribute("list")) return "combobox";
          return "textbox";
        case "search":
          if (element.hasAttribute("list")) return "combobox";
          return "searchbox";
        case "number":
          return "spinbutton";
        default:
          return null;
      }
    }
    case "select":
      if (
        element.hasAttribute("multiple") ||
        (element as HTMLSelectElement).size > 1
      ) {
        return "listbox";
      }
      return "combobox";
  }
  return null;
}

/**
 * Computes the resolved ARIA role for an element. An explicit `role` wins
 * unless it is `presentation` without conflicting global ARIA attributes, in
 * which case the implicit role is used (W3C presentation conflict resolution).
 */
export function getRole(element: Element): string | null {
  const explicitRole = getExplicitRole(element);
  if (explicitRole === null || explicitRole === "presentation") {
    const implicitRole = getImplicitRole(element);
    if (
      explicitRole !== "presentation" ||
      ignorePresentationalRole(element, implicitRole || "")
    ) {
      return implicitRole;
    }
  }
  return explicitRole;
}

// Native tag→role mappings that `aria-query` (and therefore Testing Library's
// role queries) recognize but `dom-accessibility-api`'s `getRole` omits. These
// are kept OUT of `localNameToRoleMappings` on purpose: that table feeds the
// accessible name algorithm, where giving these elements a role would change the
// name they compute (name-prohibited roles like `code`/`strong` would suppress
// an author label, and `meter` would be treated as a range value).
const queryOnlyRoleMappings: { [localName: string]: string } = {
  address: "group",
  blockquote: "blockquote",
  caption: "caption",
  code: "code",
  del: "deletion",
  dfn: "term",
  em: "emphasis",
  ins: "insertion",
  meter: "meter",
  p: "paragraph",
  strong: "strong",
  sub: "subscript",
  sup: "superscript",
  time: "time",
};

/**
 * Computes an element's implicit role for the purpose of role *queries*, which
 * follow `aria-query` rather than the accessible name algorithm's role table.
 * It extends {@link getImplicitRole} with the native mappings `aria-query`
 * recognizes, distinguishes `<th scope="row">` (`rowheader`) from other `<th>`
 * (`columnheader`), and reports `<summary>` as no role (it's only `button` for
 * the name algorithm's benefit).
 */
function getQueryImplicitRole(element: Element): string | null {
  const localName = getLocalName(element);
  if (localName === "summary") return null;
  const queryOnlyRole = queryOnlyRoleMappings[localName];
  if (queryOnlyRole !== undefined) return queryOnlyRole;
  if (localName === "th") {
    const scope = element.getAttribute("scope");
    if (scope === "row" || scope === "rowgroup") return "rowheader";
    return "columnheader";
  }
  return getImplicitRole(element);
}

// Whether an element carries an author-supplied accessible name attribute. The
// `form` and `region` landmark roles only apply when such a name is present (a
// `<form>` also accepts the legacy `name` attribute). This mirrors aria-query's
// `[attr]:not([attr=""])` constraint — presence and non-emptiness of the
// attribute, not the full computed accessible name (computing that here would
// recurse back through role resolution).
function hasLandmarkName(element: Element): boolean {
  const label = element.getAttribute("aria-label");
  if (label !== null && label !== "") return true;
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy !== null && labelledBy !== "") return true;
  if (getLocalName(element) === "form") {
    const name = element.getAttribute("name");
    if (name !== null && name !== "") return true;
  }
  return false;
}

/**
 * Decides whether an element belongs to `role`, matching how
 * `@testing-library/dom`'s `queryAllByRole` resolves role membership.
 *
 * When the element has an explicit `role` attribute, the first token must equal
 * `role` (or any token when `queryFallbacks` is set). Otherwise the element's
 * implicit role — resolved by {@link getQueryImplicitRole} to match `aria-query`
 * — is compared, with the landmark `form`/`region` roles additionally gated on
 * an accessible name.
 *
 * The one intentional difference from `aria-query` is the `generic` role:
 * elements it reports as `generic` (`<div>`, `<span>`, `<a>` without `href`,
 * etc.) report no role, so `query.generic()` only matches an explicit
 * `role="generic"`. `generic` is pervasive, never queried by Ariakit, and
 * mapping it would conflict with the name algorithm's required `null` mappings.
 */
export function elementMatchesRole(
  element: Element,
  role: string,
  queryFallbacks = false,
): boolean {
  if (element.hasAttribute("role")) {
    const roleValue = element.getAttribute("role") ?? "";
    if (queryFallbacks) {
      return roleValue
        .split(" ")
        .filter(Boolean)
        .some((token) => token === role);
    }
    // Only the first token is matched, without trimming or filtering — so a
    // leading space yields an empty first token, exactly as upstream does.
    const firstRoleAttributeToken = roleValue.split(" ")[0];
    return firstRoleAttributeToken === role;
  }
  if (getQueryImplicitRole(element) !== role) return false;
  if (role === "form" || role === "region") {
    return hasLandmarkName(element);
  }
  return true;
}

/**
 * Returns true when `element` and its subtree are inaccessible (hidden via the
 * `hidden` attribute, `aria-hidden="true"`, or `display: none`).
 */
export function isSubtreeInaccessible(element: Element): boolean {
  if ((element as HTMLElement).hidden === true) return true;
  if (element.getAttribute("aria-hidden") === "true") return true;
  const window = element.ownerDocument.defaultView;
  if (window && window.getComputedStyle(element).display === "none") {
    return true;
  }
  return false;
}

export interface IsInaccessibleOptions {
  isSubtreeInaccessible?: (element: Element) => boolean;
}

/**
 * Partial implementation of https://www.w3.org/TR/wai-aria-1.2/#tree_exclusion.
 *
 * Returns true when the element is excluded from the accessibility tree:
 * `visibility: hidden` (inherited, so we can exit early) or any ancestor making
 * its subtree inaccessible. An `isSubtreeInaccessible` override may be passed to
 * reuse cached results from previous calls.
 */
export function isInaccessible(
  element: Element,
  options: IsInaccessibleOptions = {},
): boolean {
  const {
    isSubtreeInaccessible: isSubtreeInaccessibleImpl = isSubtreeInaccessible,
  } = options;
  const window = element.ownerDocument.defaultView;
  // Visibility is inherited, so a hidden element can be excluded immediately.
  if (window && window.getComputedStyle(element).visibility === "hidden") {
    return true;
  }
  let currentElement: Element | null = element;
  while (currentElement) {
    if (isSubtreeInaccessibleImpl(currentElement)) return true;
    currentElement = currentElement.parentElement;
  }
  return false;
}

// Returns true/false for an explicit boolean ARIA attribute, or undefined when
// the attribute is absent or not a recognized boolean value.
function checkBooleanAttribute(
  element: Element,
  attribute: string,
): boolean | undefined {
  const attributeValue = element.getAttribute(attribute);
  if (attributeValue === "true") return true;
  if (attributeValue === "false") return false;
  return undefined;
}

/**
 * Returns false/true if (not) selected, or undefined when the element is not
 * selectable.
 */
export function computeAriaSelected(element: Element): boolean | undefined {
  // Implicit value from the HTML-AAM mappings: an <option>'s selected state.
  if (element.tagName === "OPTION")
    return (element as HTMLOptionElement).selected;
  return checkBooleanAttribute(element, "aria-selected");
}

/**
 * Returns true when the element is marked busy via `aria-busy="true"`.
 */
export function computeAriaBusy(element: Element): boolean {
  return element.getAttribute("aria-busy") === "true";
}

/**
 * Returns false/true if (not) checked, or undefined when the element is not
 * checkable. Indeterminate inputs report undefined.
 */
export function computeAriaChecked(element: Element): boolean | undefined {
  // Implicit value from the HTML-AAM mappings: a checkbox/radio's state.
  if (
    "indeterminate" in element &&
    (element as HTMLInputElement).indeterminate
  ) {
    return undefined;
  }
  if ("checked" in element) return (element as HTMLInputElement).checked;
  return checkBooleanAttribute(element, "aria-checked");
}

/**
 * Returns false/true if (not) pressed, or undefined when the element is not
 * pressable.
 */
export function computeAriaPressed(element: Element): boolean | undefined {
  return checkBooleanAttribute(element, "aria-pressed");
}

/**
 * Returns the `aria-current` state: an explicit boolean, the raw token string,
 * or false when the attribute is absent.
 */
export function computeAriaCurrent(element: Element): boolean | string {
  return (
    checkBooleanAttribute(element, "aria-current") ??
    element.getAttribute("aria-current") ??
    false
  );
}

/**
 * Returns false/true if (not) expanded, or undefined when the element is not
 * expandable.
 */
export function computeAriaExpanded(element: Element): boolean | undefined {
  return checkBooleanAttribute(element, "aria-expanded");
}

// Implicit heading levels from the HTML-AAM mapping.
const implicitHeadingLevels: { [tagName: string]: number } = {
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6,
};

/**
 * Returns the heading level from an explicit `aria-level` or an implicit
 * `<h1>`-`<h6>` tag, or undefined when neither applies.
 */
export function computeHeadingLevel(element: Element): number | undefined {
  // An explicit `aria-level` takes precedence over the implicit tag level.
  const ariaLevel = element.getAttribute("aria-level");
  const ariaLevelAttribute = ariaLevel && Number(ariaLevel);
  return ariaLevelAttribute || implicitHeadingLevels[element.tagName];
}

/**
 * Returns the numeric `aria-valuenow`, or undefined when absent.
 */
export function computeAriaValueNow(element: Element): number | undefined {
  const valueNow = element.getAttribute("aria-valuenow");
  return valueNow === null ? undefined : +valueNow;
}

/**
 * Returns the numeric `aria-valuemax`, or undefined when absent.
 */
export function computeAriaValueMax(element: Element): number | undefined {
  const valueMax = element.getAttribute("aria-valuemax");
  return valueMax === null ? undefined : +valueMax;
}

/**
 * Returns the numeric `aria-valuemin`, or undefined when absent.
 */
export function computeAriaValueMin(element: Element): number | undefined {
  const valueMin = element.getAttribute("aria-valuemin");
  return valueMin === null ? undefined : +valueMin;
}

/**
 * Returns the `aria-valuetext` string, or undefined when absent.
 */
export function computeAriaValueText(element: Element): string | undefined {
  const valueText = element.getAttribute("aria-valuetext");
  return valueText === null ? undefined : valueText;
}
