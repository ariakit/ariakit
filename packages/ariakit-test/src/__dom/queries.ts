// Part of this code is based on https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/queries/role.ts
// Part of this code is based on https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/queries/text.ts
// Part of this code is based on https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/queries/label-text.ts
// Part of this code is based on https://github.com/testing-library/dom-testing-library/blob/v10.4.1/src/label-helpers.ts
// Original work licensed under the MIT License, Copyright (c) Kent C. Dodds.
//
// Only the `queryAllBy*` matching primitives are reimplemented here. The
// single-element, "throw if missing", and "wait for it" variants that Testing
// Library derives from these (`queryBy`/`getBy`/`findBy` and friends) are not
// part of `@ariakit/test`'s public API, so `query.ts` builds the behaviors it
// exposes directly on top of these primitives instead of reproducing them.

import {
  computeAccessibleDescription,
  computeAccessibleName,
} from "./accessible-name.ts";
import {
  computeAriaBusy,
  computeAriaChecked,
  computeAriaCurrent,
  computeAriaExpanded,
  computeAriaPressed,
  computeAriaSelected,
  computeAriaValueMax,
  computeAriaValueMin,
  computeAriaValueNow,
  computeAriaValueText,
  computeHeadingLevel,
  elementMatchesRole,
  isInaccessible,
  isSubtreeInaccessible,
} from "./role.ts";
import type { Matcher, MatcherOptions } from "./text-content.ts";
import {
  fuzzyMatches,
  getNodeText,
  makeNormalizer,
  matches,
} from "./text-content.ts";

// Constant `Node.nodeType` for text nodes, see:
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#node_type_constants
const TEXT_NODE = 3;

/**
 * The role matcher accepts a single ARIA role string (the original library also
 * accepts a `RegExp`, but `@ariakit/test` only ever passes a string).
 */
export type ByRoleMatcher = string;

export interface ByRoleOptions {
  /** Include elements that are normally excluded from the accessibility tree. */
  hidden?: boolean;
  /** Filter by accessible name. */
  name?:
    | string
    | RegExp
    | ((accessibleName: string, element: Element) => boolean);
  /** Filter by accessible description. */
  description?:
    | string
    | RegExp
    | ((accessibleDescription: string, element: Element) => boolean);
  /** Filter by `aria-selected` state. */
  selected?: boolean;
  /** Filter by `aria-busy` state. */
  busy?: boolean;
  /** Filter by `aria-checked` state. */
  checked?: boolean;
  /** Filter by `aria-pressed` state. */
  pressed?: boolean;
  /** Filter by `aria-current` state. */
  current?: boolean | string;
  /** Filter by `aria-expanded` state. */
  expanded?: boolean;
  /** Filter `heading` roles by their level. */
  level?: number;
  /** Filter by the element's range value (`aria-valuenow`/min/max/text). */
  value?: {
    now?: number;
    min?: number;
    max?: number;
    text?: Matcher;
  };
  /**
   * Match against every whitespace-separated token of the `role` attribute
   * rather than only the first one.
   */
  queryFallbacks?: boolean;
}

export interface SelectorMatcherOptions extends MatcherOptions {
  /** Restrict matching to elements matching this CSS selector. */
  selector?: string;
  /** Ignore elements matching this CSS selector (or pass `false` to disable). */
  ignore?: string | boolean;
}

// Default CSS selector for `*ByText` queries: ignore non-visible nodes such as
// <script> and <style> that would otherwise leak their text content.
const DEFAULT_IGNORE = "script, style";

//
// Role query (queries/role.ts)
//

// The accessible-name/description matcher allowed by a callback expects a
// non-null `Element`, while the generic `Matcher` callback receives
// `Element | null`. Bridge the two by skipping the (never-occurring) null case
// instead of widening the public option type.
function toAccessibleMatcher(
  matcher: string | RegExp | ((value: string, element: Element) => boolean),
): Matcher {
  if (typeof matcher !== "function") return matcher;
  return (content, element) => (element ? matcher(content, element) : false);
}

// Roles that support each non-global ARIA state, mirroring the
// `roles.get(role).props` data `aria-query` exposes (which Testing Library's
// `queryAllByRole` consults to reject unsupported state filters). Derived from
// aria-query@5.3.0, intersected with the roles `@ariakit/test` exposes.
const ROLE_STATE_SUPPORT: {
  readonly [ariaAttribute: string]: ReadonlySet<string>;
} = {
  "aria-selected": new Set([
    "columnheader",
    "gridcell",
    "option",
    "row",
    "rowheader",
    "tab",
    "treeitem",
  ]),
  "aria-checked": new Set([
    "checkbox",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "switch",
    "treeitem",
  ]),
  "aria-pressed": new Set(["button"]),
  "aria-expanded": new Set([
    "application",
    "button",
    "checkbox",
    "columnheader",
    "combobox",
    "gridcell",
    "link",
    "listbox",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "row",
    "rowheader",
    "switch",
    "tab",
    "treeitem",
  ]),
  "aria-valuenow": new Set([
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton",
  ]),
  "aria-valuemax": new Set([
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton",
  ]),
  "aria-valuemin": new Set([
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton",
  ]),
  "aria-valuetext": new Set([
    "meter",
    "progressbar",
    "scrollbar",
    "separator",
    "slider",
    "spinbutton",
  ]),
};

// `aria-busy` and `aria-current` are global states that every role supports
// except `none`, which aria-query gives no ARIA props at all (`presentation`,
// despite being its synonym, does carry the globals). They're validated through
// the fallback branch in `assertRoleSupportsState` rather than their own set.
const ROLES_WITHOUT_GLOBAL_STATES: ReadonlySet<string> = new Set(["none"]);

// Throws when a role-state filter targets a role that can't carry that state,
// matching Testing Library's `queryAllByRole`. Without it, a mistake like
// `query.button("Save", { selected: true })` would silently return nothing
// instead of surfacing the unsupported combination. Non-global states consult
// their support set; the global `aria-busy`/`aria-current` fall back to every
// role but `none`. `queryAllByRole` only ever receives one of the package's
// known roles (the public `query.<role>()` API is built from that fixed list),
// so the global fallback never sees an arbitrary role.
function assertRoleSupportsState(role: string, ariaAttribute: string) {
  const supportingRoles = ROLE_STATE_SUPPORT[ariaAttribute];
  const supported = supportingRoles
    ? supportingRoles.has(role)
    : !ROLES_WITHOUT_GLOBAL_STATES.has(role);
  if (!supported) {
    throw new Error(`"${ariaAttribute}" is not supported on role "${role}".`);
  }
}

/**
 * Returns every element under `container` whose ARIA role is `role` and that
 * satisfies the given {@link ByRoleOptions} (accessible name/description, ARIA
 * state, level, value, and visibility).
 */
export function queryAllByRole(
  container: HTMLElement,
  role: ByRoleMatcher,
  {
    hidden = false,
    name,
    description,
    queryFallbacks = false,
    selected,
    busy,
    checked,
    pressed,
    current,
    level,
    expanded,
    // TypeScript only allows a type annotation on the top-level binding
    // pattern, so the inner `value` shape is inferred from `ByRoleOptions`.
    value: {
      now: valueNow,
      min: valueMin,
      max: valueMax,
      text: valueText,
    } = {},
  }: ByRoleOptions = {},
): HTMLElement[] {
  // Reject state filters the role can't carry before querying, in the same order
  // as Testing Library. `level` is valid only on `heading`.
  if (selected !== undefined) assertRoleSupportsState(role, "aria-selected");
  if (busy !== undefined) assertRoleSupportsState(role, "aria-busy");
  if (checked !== undefined) assertRoleSupportsState(role, "aria-checked");
  if (pressed !== undefined) assertRoleSupportsState(role, "aria-pressed");
  if (current !== undefined) assertRoleSupportsState(role, "aria-current");
  if (level !== undefined && role !== "heading") {
    throw new Error(`Role "${role}" cannot have "level" property.`);
  }
  if (valueNow !== undefined) assertRoleSupportsState(role, "aria-valuenow");
  if (valueMax !== undefined) assertRoleSupportsState(role, "aria-valuemax");
  if (valueMin !== undefined) assertRoleSupportsState(role, "aria-valuemin");
  if (valueText !== undefined) assertRoleSupportsState(role, "aria-valuetext");
  if (expanded !== undefined) assertRoleSupportsState(role, "aria-expanded");

  // Cache `isSubtreeInaccessible` per element so the (potentially expensive)
  // visibility computation runs at most once per ancestor across the filter.
  const subtreeIsInaccessibleCache = new WeakMap<Element, boolean>();
  const cachedIsSubtreeInaccessible = (element: Element) => {
    let result = subtreeIsInaccessibleCache.get(element);
    if (result === undefined) {
      result = isSubtreeInaccessible(element);
      subtreeIsInaccessibleCache.set(element, result);
    }
    return result;
  };

  return Array.from(container.querySelectorAll<HTMLElement>("*"))
    .filter((node) => elementMatchesRole(node, role, queryFallbacks))
    .filter((element) => {
      if (selected !== undefined) {
        return selected === computeAriaSelected(element);
      }
      if (busy !== undefined) {
        return busy === computeAriaBusy(element);
      }
      if (checked !== undefined) {
        return checked === computeAriaChecked(element);
      }
      if (pressed !== undefined) {
        return pressed === computeAriaPressed(element);
      }
      if (current !== undefined) {
        return current === computeAriaCurrent(element);
      }
      if (expanded !== undefined) {
        return expanded === computeAriaExpanded(element);
      }
      if (level !== undefined) {
        return level === computeHeadingLevel(element);
      }
      if (
        valueNow !== undefined ||
        valueMax !== undefined ||
        valueMin !== undefined ||
        valueText !== undefined
      ) {
        let valueMatches = true;
        if (valueNow !== undefined) {
          valueMatches &&= valueNow === computeAriaValueNow(element);
        }
        if (valueMax !== undefined) {
          valueMatches &&= valueMax === computeAriaValueMax(element);
        }
        if (valueMin !== undefined) {
          valueMatches &&= valueMin === computeAriaValueMin(element);
        }
        if (valueText !== undefined) {
          valueMatches &&= matches(
            computeAriaValueText(element) ?? null,
            element,
            valueText,
            (text) => text,
          );
        }
        return valueMatches;
      }
      // No state option was provided, so don't filter on state.
      return true;
    })
    .filter((element) => {
      if (name === undefined) return true;
      return matches(
        computeAccessibleName(element),
        element,
        toAccessibleMatcher(name),
        (text) => text,
      );
    })
    .filter((element) => {
      if (description === undefined) return true;
      return matches(
        computeAccessibleDescription(element),
        element,
        toAccessibleMatcher(description),
        (text) => text,
      );
    })
    .filter((element) => {
      if (hidden) return true;
      return !isInaccessible(element, {
        isSubtreeInaccessible: cachedIsSubtreeInaccessible,
      });
    });
}

//
// Text query (queries/text.ts)
//

/**
 * Returns every element under `container` whose own text matches `text`,
 * honoring the standard selector/exact/normalizer/ignore options.
 */
export function queryAllByText(
  container: HTMLElement,
  text: Matcher,
  {
    selector = "*",
    exact = true,
    collapseWhitespace,
    trim,
    ignore = DEFAULT_IGNORE,
    normalizer,
  }: SelectorMatcherOptions = {},
): HTMLElement[] {
  const matcher = exact ? matches : fuzzyMatches;
  const matchNormalizer = makeNormalizer({
    collapseWhitespace,
    trim,
    normalizer,
  });
  let baseArray: HTMLElement[] = [];
  if (typeof container.matches === "function" && container.matches(selector)) {
    baseArray = [container];
  }
  // `ignore` can be `false` to disable filtering, or a selector to exclude.
  const ignoreSelector = typeof ignore === "string" ? ignore : null;
  return [
    ...baseArray,
    ...Array.from(container.querySelectorAll<HTMLElement>(selector)),
  ]
    .filter((node) => !ignoreSelector || !node.matches(ignoreSelector))
    .filter((node) => matcher(getNodeText(node), node, text, matchNormalizer));
}

//
// Label helpers (label-helpers.ts)
//

interface GetLabelsOptions {
  selector?: string;
}

interface LabelContent {
  content: string | null;
  formControl: HTMLElement | null;
}

// Elements whose own text content should never be treated as label text — they
// expose a value/label of their own instead.
const LABELLED_NODE_NAMES = [
  "button",
  "meter",
  "output",
  "progress",
  "select",
  "textarea",
  "input",
];

// Collects the visible text of a label, skipping the content of nested form
// controls (which contribute their own value, not label text).
function getTextContent(node: Node): string | null {
  if (LABELLED_NODE_NAMES.includes(node.nodeName.toLowerCase())) return "";
  if (node.nodeType === TEXT_NODE) return node.textContent;
  return Array.from(node.childNodes)
    .map((childNode) => getTextContent(childNode))
    .join("");
}

/** Returns the label text for an element (or its own value/text content). */
function getLabelContent(element: HTMLElement): string | null {
  if (element.tagName.toLowerCase() === "label") {
    return getTextContent(element);
  }
  // Non-label elements (e.g. an <input>) contribute their value or text.
  const valueElement = element as HTMLInputElement;
  return valueElement.value || element.textContent;
}

/**
 * Returns the `<label>` elements associated with a form control, falling back
 * to a manual `label.control` scan for environments without `HTMLElement.labels`.
 * Based on https://github.com/eps1lon/dom-accessibility-api/pull/352
 */
function getRealLabels(element: HTMLElement): HTMLLabelElement[] {
  const labelsOwner = element as HTMLInputElement;
  // `labels` is not typed for elements that don't support it, but older
  // browsers may also omit it on elements that do — hence the explicit check.
  if (labelsOwner.labels !== undefined) {
    return labelsOwner.labels ? Array.from(labelsOwner.labels) : [];
  }
  if (!isLabelable(element)) return [];
  const labels = element.ownerDocument.querySelectorAll("label");
  return Array.from(labels).filter((label) => label.control === element);
}

// Whether an element can be associated with a `<label>` per the HTML spec.
function isLabelable(element: HTMLElement): boolean {
  if (/BUTTON|METER|OUTPUT|PROGRESS|SELECT|TEXTAREA/.test(element.tagName)) {
    return true;
  }
  return (
    element.tagName === "INPUT" && element.getAttribute("type") !== "hidden"
  );
}

/**
 * Resolves the labels for an element, preferring `aria-labelledby` references
 * and falling back to its real `<label>` elements (and their nested form
 * control, if any).
 */
function getLabels(
  container: HTMLElement,
  element: HTMLElement,
  { selector = "*" }: GetLabelsOptions = {},
): LabelContent[] {
  const ariaLabelledBy = element.getAttribute("aria-labelledby");
  const labelsId = ariaLabelledBy ? ariaLabelledBy.split(" ") : [];
  if (labelsId.length) {
    return labelsId.map((labelId) => {
      const labellingElement = container.querySelector<HTMLElement>(
        `[id="${labelId}"]`,
      );
      if (!labellingElement) {
        return { content: "", formControl: null };
      }
      return {
        content: getLabelContent(labellingElement),
        formControl: null,
      };
    });
  }
  return Array.from(getRealLabels(element)).map((label) => {
    const textToMatch = getLabelContent(label);
    const formControlSelector =
      "button, input, meter, output, progress, select, textarea";
    const labelledFormControl = Array.from(
      label.querySelectorAll<HTMLElement>(formControlSelector),
    ).filter((formControlElement) => formControlElement.matches(selector))[0];
    return {
      content: textToMatch,
      formControl: labelledFormControl ?? null,
    };
  });
}

//
// Label-text query (queries/label-text.ts)
//

// Matches `aria-label` attributes directly, the fallback the label-text query
// concatenates onto its `<label>`-resolved matches.
function queryAllByAttribute(
  attribute: string,
  container: HTMLElement,
  text: Matcher,
  { exact = true, collapseWhitespace, trim, normalizer }: MatcherOptions = {},
): HTMLElement[] {
  const matcher = exact ? matches : fuzzyMatches;
  const matchNormalizer = makeNormalizer({
    collapseWhitespace,
    trim,
    normalizer,
  });
  return Array.from(
    container.querySelectorAll<HTMLElement>(`[${attribute}]`),
  ).filter((node) =>
    matcher(node.getAttribute(attribute), node, text, matchNormalizer),
  );
}

/**
 * Returns every form control under `container` labelled by text matching
 * `text`, resolved through `<label>` elements, `aria-labelledby`, or
 * `aria-label`.
 */
export function queryAllByLabelText(
  container: HTMLElement,
  text: Matcher,
  {
    selector = "*",
    exact = true,
    collapseWhitespace,
    trim,
    normalizer,
  }: SelectorMatcherOptions = {},
): HTMLElement[] {
  const matcher = exact ? matches : fuzzyMatches;
  const matchNormalizer = makeNormalizer({
    collapseWhitespace,
    trim,
    normalizer,
  });
  const labelledElements = Array.from(
    container.querySelectorAll<HTMLElement>("*"),
  )
    .filter(
      (element) =>
        getRealLabels(element).length ||
        element.hasAttribute("aria-labelledby"),
    )
    .reduce<HTMLElement[]>((matched, labelledElement) => {
      const labelList = getLabels(container, labelledElement, { selector });
      // Match each label's own form control (a label that wraps its control).
      labelList
        .filter((label) => Boolean(label.formControl))
        .forEach((label) => {
          if (
            label.formControl &&
            matcher(label.content, label.formControl, text, matchNormalizer)
          ) {
            matched.push(label.formControl);
          }
        });
      // Match the combined text of all labels against the labelled element.
      const labelsValue = labelList
        .filter((label) => Boolean(label.content))
        .map((label) => label.content);
      if (
        matcher(labelsValue.join(" "), labelledElement, text, matchNormalizer)
      ) {
        matched.push(labelledElement);
      }
      // When several labels point at the same element, also match each label
      // individually (and combinations excluding one), so any single label can
      // resolve the element.
      if (labelsValue.length > 1) {
        labelsValue.forEach((labelValue, index) => {
          if (matcher(labelValue, labelledElement, text, matchNormalizer)) {
            matched.push(labelledElement);
          }
          const labelsFiltered = [...labelsValue];
          labelsFiltered.splice(index, 1);
          if (labelsFiltered.length > 1) {
            if (
              matcher(
                labelsFiltered.join(" "),
                labelledElement,
                text,
                matchNormalizer,
              )
            ) {
              matched.push(labelledElement);
            }
          }
        });
      }
      return matched;
    }, [])
    .concat(
      queryAllByAttribute("aria-label", container, text, {
        exact,
        normalizer: matchNormalizer,
      }),
    );
  // De-duplicate, then keep only elements matching the requested selector.
  return Array.from(new Set(labelledElements)).filter((element) =>
    element.matches(selector),
  );
}
