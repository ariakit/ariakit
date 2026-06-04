// Part of this code is based on https://github.com/eps1lon/dom-accessibility-api/blob/v0.5.16/sources/accessible-name-and-description.ts
// Original work licensed under the MIT License, Copyright (c) Sebastian Silbermann.
//
// Implements the W3C accessible name and description computation:
// https://w3c.github.io/accname/

import { getLocalName, getRole } from "./role.ts";

/**
 * Options shared by the accessible name and description computations.
 */
export interface ComputeTextAlternativeOptions {
  /**
   * Whether to compute the accessible "name" or "description". Defaults to
   * "name".
   */
  compute?: "name" | "description";
  /**
   * Whether the provided `getComputedStyle` resolves `::before`/`::after`
   * pseudo-element content. Defaults to `true` when `getComputedStyle` is
   * provided, otherwise `false`.
   */
  computedStyleSupportsPseudoElements?: boolean;
  /**
   * Custom `getComputedStyle` implementation. Defaults to the one from the
   * root's owning window.
   */
  getComputedStyle?: (
    element: Element,
    pseudoElement?: string | null,
  ) => CSSStyleDeclaration;
  /**
   * Treats the root and its subtree as visible even if hidden, mirroring the
   * `aria-labelledby`/`aria-describedby` reference behavior. Defaults to
   * `false`.
   */
  hidden?: boolean;
}

interface InternalContext {
  isEmbeddedInLabel: boolean;
  isReferenced: boolean;
  recursion: boolean;
}

type GetComputedStyle = (
  element: Element,
  pseudoElement?: string | null,
) => CSSStyleDeclaration;

/**
 * A string of characters where all carriage returns, newlines, tabs, and
 * form-feeds are replaced with a single space, and multiple spaces are reduced
 * to a single space. The string contains only character data; it does not
 * contain any markup.
 */
function asFlatString(text: string): string {
  return text.trim().replace(/\s\s+/g, " ");
}

function isElement(node: Node | null): node is Element {
  return node !== null && node.nodeType === node.ELEMENT_NODE;
}

function isHTMLTableCaptionElement(
  node: Node | null,
): node is HTMLTableCaptionElement {
  return isElement(node) && getLocalName(node) === "caption";
}

function isHTMLInputElement(node: Node | null): node is HTMLInputElement {
  return isElement(node) && getLocalName(node) === "input";
}

function isHTMLOptGroupElement(node: Node | null): node is HTMLOptGroupElement {
  return isElement(node) && getLocalName(node) === "optgroup";
}

function isHTMLSelectElement(node: Node | null): node is HTMLSelectElement {
  return isElement(node) && getLocalName(node) === "select";
}

function isHTMLTableElement(node: Node | null): node is HTMLTableElement {
  return isElement(node) && getLocalName(node) === "table";
}

function isHTMLTextAreaElement(node: Node | null): node is HTMLTextAreaElement {
  return isElement(node) && getLocalName(node) === "textarea";
}

function isHTMLFieldSetElement(node: Node | null): node is HTMLFieldSetElement {
  return isElement(node) && getLocalName(node) === "fieldset";
}

function isHTMLLegendElement(node: Node | null): node is HTMLLegendElement {
  return isElement(node) && getLocalName(node) === "legend";
}

function isHTMLSlotElement(node: Node | null): node is HTMLSlotElement {
  return isElement(node) && getLocalName(node) === "slot";
}

function isSVGElement(node: Node | null): node is SVGElement {
  return isElement(node) && (node as SVGElement).ownerSVGElement !== undefined;
}

function isSVGSVGElement(node: Node | null): node is SVGSVGElement {
  return isElement(node) && getLocalName(node) === "svg";
}

function isSVGTitleElement(node: Node | null): node is SVGTitleElement {
  return isSVGElement(node) && getLocalName(node) === "title";
}

function safeWindow(node: Node): Window {
  const { defaultView } =
    node.ownerDocument === null ? (node as Document) : node.ownerDocument;
  if (defaultView === null) {
    throw new TypeError("no window available");
  }
  return defaultView;
}

/**
 * Resolves the elements referenced by a space-separated IDREF list attribute,
 * scoped to the node's root (so shadow DOM is respected).
 */
function queryIdRefs(node: Node, attributeName: string): Element[] {
  if (!isElement(node) || !node.hasAttribute(attributeName)) {
    return [];
  }
  const attribute = node.getAttribute(attributeName);
  if (attribute === null) {
    return [];
  }
  const ids = attribute.split(" ");
  // Browsers that don't support shadow DOM won't have getRootNode. The root may
  // be a Document or ShadowRoot at runtime; both expose getElementById.
  const root = (node.getRootNode ? node.getRootNode() : node.ownerDocument) as
    | Document
    | ShadowRoot;
  const elements: Element[] = [];
  for (const id of ids) {
    const element = root.getElementById(id);
    if (element !== null) {
      elements.push(element);
    }
  }
  return elements;
}

function hasAnyConcreteRoles(
  node: Node,
  roles: Array<string | null>,
): node is Element {
  if (isElement(node)) {
    return roles.indexOf(getRole(node)) !== -1;
  }
  return false;
}

/**
 * As defined in step 2E of https://w3c.github.io/accname/#mapping_additional_nd_te
 */
function isControl(node: Node): boolean {
  return (
    hasAnyConcreteRoles(node, ["button", "combobox", "listbox", "textbox"]) ||
    hasAbstractRole(node, "range")
  );
}

function hasAbstractRole(node: Node, role: string): boolean {
  if (!isElement(node)) {
    return false;
  }
  switch (role) {
    case "range":
      return hasAnyConcreteRoles(node, [
        "meter",
        "progressbar",
        "scrollbar",
        "slider",
        "spinbutton",
      ]);
    default:
      throw new TypeError(
        `No knowledge about abstract role '${role}'. This is likely a bug :(`,
      );
  }
}

/**
 * `element.querySelectorAll` but also considers the owned tree (`aria-owns`).
 */
function querySelectorAllSubtree(
  element: Element,
  selectors: string,
): Element[] {
  const elements = Array.from(element.querySelectorAll(selectors));
  for (const root of queryIdRefs(element, "aria-owns")) {
    elements.push(...Array.from(root.querySelectorAll(selectors)));
  }
  return elements;
}

function querySelectedOptions(listbox: Element): ArrayLike<Element> {
  if (isHTMLSelectElement(listbox)) {
    // IE11 polyfill.
    return (
      listbox.selectedOptions || querySelectorAllSubtree(listbox, "[selected]")
    );
  }
  return querySelectorAllSubtree(listbox, '[aria-selected="true"]');
}

function isMarkedPresentational(node: Node): boolean {
  return hasAnyConcreteRoles(node, ["none", "presentation"]);
}

/**
 * Elements specifically listed in html-aam.
 *
 * We don't need this for `label` or `legend` elements. Their implicit roles
 * already allow "naming from content".
 *
 * - https://w3c.github.io/html-aam/#table-element
 */
function isNativeHostLanguageTextAlternativeElement(node: Node): boolean {
  return isHTMLTableCaptionElement(node);
}

/**
 * https://w3c.github.io/aria/#namefromcontent
 */
function allowsNameFromContent(node: Node): boolean {
  return hasAnyConcreteRoles(node, [
    "button",
    "cell",
    "checkbox",
    "columnheader",
    "gridcell",
    "heading",
    "label",
    "legend",
    "link",
    "menuitem",
    "menuitemcheckbox",
    "menuitemradio",
    "option",
    "radio",
    "row",
    "rowheader",
    "switch",
    "tab",
    "tooltip",
    "treeitem",
  ]);
}

/**
 * TODO https://github.com/eps1lon/dom-accessibility-api/issues/100
 */
function isDescendantOfNativeHostLanguageTextAlternativeElement(
  _node: Node,
): boolean {
  return false;
}

function getValueOfTextbox(element: Element): string {
  if (isHTMLInputElement(element) || isHTMLTextAreaElement(element)) {
    return element.value;
  }
  // https://github.com/eps1lon/dom-accessibility-api/issues/4
  return element.textContent || "";
}

function getTextualContent(declaration: CSSStyleDeclaration): string {
  const content = declaration.getPropertyValue("content");
  if (/^["'].*["']$/.test(content)) {
    return content.slice(1, -1);
  }
  return "";
}

/**
 * https://html.spec.whatwg.org/multipage/forms.html#category-label
 * TODO: form-associated custom elements
 */
function isLabelableElement(element: Element): boolean {
  const localName = getLocalName(element);
  return (
    localName === "button" ||
    (localName === "input" && element.getAttribute("type") !== "hidden") ||
    localName === "meter" ||
    localName === "output" ||
    localName === "progress" ||
    localName === "select" ||
    localName === "textarea"
  );
}

/**
 * > [...], then the first such descendant in tree order is the label element's
 * > labeled control.
 *
 * https://html.spec.whatwg.org/multipage/forms.html#labeled-control
 */
function findLabelableElement(element: Element): Element | null {
  if (isLabelableElement(element)) {
    return element;
  }
  let labelableElement: Element | null = null;
  element.childNodes.forEach((childNode) => {
    if (labelableElement === null && isElement(childNode)) {
      const descendantLabelableElement = findLabelableElement(childNode);
      if (descendantLabelableElement !== null) {
        labelableElement = descendantLabelableElement;
      }
    }
  });
  return labelableElement;
}

/**
 * Polyfill of `HTMLLabelElement.control`.
 * https://html.spec.whatwg.org/multipage/forms.html#labeled-control
 */
function getControlOfLabel(label: HTMLLabelElement): Element | null {
  if (label.control !== undefined) {
    return label.control;
  }
  const htmlFor = label.getAttribute("for");
  if (htmlFor !== null) {
    return label.ownerDocument.getElementById(htmlFor);
  }
  return findLabelableElement(label);
}

/**
 * Polyfill of `HTMLInputElement.labels`.
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/labels
 */
function getLabels(element: Element): HTMLLabelElement[] | null {
  const labelsProperty = (element as HTMLInputElement).labels;
  if (labelsProperty === null) {
    return labelsProperty;
  }
  if (labelsProperty !== undefined) {
    return Array.from(labelsProperty);
  }

  // Polyfill.
  if (!isLabelableElement(element)) {
    return null;
  }
  const document = element.ownerDocument;
  return Array.from(document.querySelectorAll("label")).filter(
    (label) => getControlOfLabel(label) === element,
  );
}

/**
 * Gets the contents of a slot used for computing the accname.
 */
function getSlotContents(slot: HTMLSlotElement): Node[] {
  // Computing the accessible name for elements containing slots is not
  // currently defined in the spec. This implementation reflects the behavior of
  // NVDA 2020.2/Firefox 81 and iOS VoiceOver/Safari 13.6.
  const assignedNodes = slot.assignedNodes();
  if (assignedNodes.length === 0) {
    // If no nodes are assigned to the slot, it displays the default content.
    return Array.from(slot.childNodes);
  }
  return assignedNodes;
}

/**
 * Implements https://w3c.github.io/accname/#mapping_additional_nd_te
 */
function computeTextAlternative(
  root: Node,
  options: ComputeTextAlternativeOptions = {},
): string {
  // Tracks nodes already visited to prevent infinite recursion and duplicate
  // contributions. Native `Set` is sufficient here (the upstream `SetLike`
  // polyfill only matters for environments without `Set`).
  const consultedNodes = new Set<Node>();
  const window = safeWindow(root);
  const {
    compute = "name",
    computedStyleSupportsPseudoElements = options.getComputedStyle !==
      undefined,
    getComputedStyle = window.getComputedStyle.bind(window) as GetComputedStyle,
    hidden = false,
  } = options;

  // 2F.i
  const computeMiscTextAlternative = (
    node: Node,
    context: { isEmbeddedInLabel: boolean; isReferenced: boolean },
  ): string => {
    let accumulatedText = "";
    if (isElement(node) && computedStyleSupportsPseudoElements) {
      const pseudoBefore = getComputedStyle(node, "::before");
      const beforeContent = getTextualContent(pseudoBefore);
      accumulatedText = `${beforeContent} ${accumulatedText}`;
    }

    // FIXME: Including aria-owns is not defined in the spec but it is required
    // in the web-platform-test.
    const childNodes = isHTMLSlotElement(node)
      ? getSlotContents(node)
      : Array.from(node.childNodes).concat(queryIdRefs(node, "aria-owns"));
    childNodes.forEach((child) => {
      const result = computeTextAlternativeForNode(child, {
        isEmbeddedInLabel: context.isEmbeddedInLabel,
        isReferenced: false,
        recursion: true,
      });
      // TODO: Unclear why display affects delimiter.
      // see https://github.com/w3c/accname/issues/3
      const display = isElement(child)
        ? getComputedStyle(child).getPropertyValue("display")
        : "inline";
      const separator = display !== "inline" ? " " : "";
      // Trailing separator for wpt tests.
      accumulatedText += `${separator}${result}${separator}`;
    });
    if (isElement(node) && computedStyleSupportsPseudoElements) {
      const pseudoAfter = getComputedStyle(node, "::after");
      const afterContent = getTextualContent(pseudoAfter);
      accumulatedText = `${accumulatedText} ${afterContent}`;
    }
    return accumulatedText.trim();
  };

  /**
   * Returns a non-empty string or `null`.
   */
  const useAttribute = (
    element: Element,
    attributeName: string,
  ): string | null => {
    const attribute = element.getAttributeNode(attributeName);
    if (
      attribute !== null &&
      !consultedNodes.has(attribute) &&
      attribute.value.trim() !== ""
    ) {
      consultedNodes.add(attribute);
      return attribute.value;
    }
    return null;
  };

  const computeTooltipAttributeValue = (node: Node): string | null => {
    if (!isElement(node)) {
      return null;
    }
    return useAttribute(node, "title");
  };

  const computeElementTextAlternative = (node: Node): string | null => {
    if (!isElement(node)) {
      return null;
    }

    // https://w3c.github.io/html-aam/#fieldset-and-legend-elements
    if (isHTMLFieldSetElement(node)) {
      consultedNodes.add(node);
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (isHTMLLegendElement(child)) {
          return computeTextAlternativeForNode(child, {
            isEmbeddedInLabel: false,
            isReferenced: false,
            recursion: false,
          });
        }
      }
    } else if (isHTMLTableElement(node)) {
      // https://w3c.github.io/html-aam/#table-element
      consultedNodes.add(node);
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (isHTMLTableCaptionElement(child)) {
          return computeTextAlternativeForNode(child, {
            isEmbeddedInLabel: false,
            isReferenced: false,
            recursion: false,
          });
        }
      }
    } else if (isSVGSVGElement(node)) {
      // https://www.w3.org/TR/svg-aam-1.0/
      consultedNodes.add(node);
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (isSVGTitleElement(child)) {
          return child.textContent;
        }
      }
      return null;
    } else if (getLocalName(node) === "img" || getLocalName(node) === "area") {
      // https://w3c.github.io/html-aam/#area-element
      // https://w3c.github.io/html-aam/#img-element
      const nameFromAlt = useAttribute(node, "alt");
      if (nameFromAlt !== null) {
        return nameFromAlt;
      }
    } else if (isHTMLOptGroupElement(node)) {
      const nameFromLabel = useAttribute(node, "label");
      if (nameFromLabel !== null) {
        return nameFromLabel;
      }
    }

    if (
      isHTMLInputElement(node) &&
      (node.type === "button" ||
        node.type === "submit" ||
        node.type === "reset")
    ) {
      // https://w3c.github.io/html-aam/#input-type-text-input-type-password-input-type-search-input-type-tel-input-type-email-input-type-url-and-textarea-element-accessible-description-computation
      const nameFromValue = useAttribute(node, "value");
      if (nameFromValue !== null) {
        return nameFromValue;
      }

      // TODO: l10n
      if (node.type === "submit") {
        return "Submit";
      }
      // TODO: l10n
      if (node.type === "reset") {
        return "Reset";
      }
    }

    const labels = getLabels(node);
    if (labels !== null && labels.length !== 0) {
      consultedNodes.add(node);
      return Array.from(labels)
        .map((element) =>
          computeTextAlternativeForNode(element, {
            isEmbeddedInLabel: true,
            isReferenced: false,
            recursion: true,
          }),
        )
        .filter((label) => label.length > 0)
        .join(" ");
    }

    // https://w3c.github.io/html-aam/#input-type-image-accessible-name-computation
    // TODO: wpt test considers label elements but html-aam does not mention
    // them. We follow existing implementations over spec.
    if (isHTMLInputElement(node) && node.type === "image") {
      const nameFromAlt = useAttribute(node, "alt");
      if (nameFromAlt !== null) {
        return nameFromAlt;
      }
      const nameFromTitle = useAttribute(node, "title");
      if (nameFromTitle !== null) {
        return nameFromTitle;
      }

      // TODO: l10n
      return "Submit Query";
    }

    if (hasAnyConcreteRoles(node, ["button"])) {
      // https://www.w3.org/TR/html-aam-1.0/#button-element
      const nameFromSubTree = computeMiscTextAlternative(node, {
        isEmbeddedInLabel: false,
        isReferenced: false,
      });
      if (nameFromSubTree !== "") {
        return nameFromSubTree;
      }
    }
    return null;
  };

  const computeTextAlternativeForNode = (
    current: Node,
    context: InternalContext,
  ): string => {
    if (consultedNodes.has(current)) {
      return "";
    }

    // 2A
    if (
      !hidden &&
      isHidden(current, getComputedStyle) &&
      !context.isReferenced
    ) {
      consultedNodes.add(current);
      return "";
    }

    // 2B
    const labelAttributeNode = isElement(current)
      ? current.getAttributeNode("aria-labelledby")
      : null;
    // TODO: Do we generally need to block query IdRefs of attributes we have
    // already consulted?
    const labelElements =
      labelAttributeNode !== null && !consultedNodes.has(labelAttributeNode)
        ? queryIdRefs(current, "aria-labelledby")
        : [];
    if (
      compute === "name" &&
      !context.isReferenced &&
      labelElements.length > 0
    ) {
      // Can't be null here, otherwise labelElements would be empty.
      consultedNodes.add(labelAttributeNode as Attr);
      return labelElements
        .map((element) =>
          // TODO: Chrome will consider repeated values i.e. use a node multiple
          // times while we'll bail out in computeTextAlternative.
          computeTextAlternativeForNode(element, {
            isEmbeddedInLabel: context.isEmbeddedInLabel,
            isReferenced: true,
            // This isn't recursion as specified, otherwise we would skip
            // `aria-label` in
            // <input id="myself" aria-label="foo" aria-labelledby="myself"
            recursion: false,
          }),
        )
        .join(" ");
    }

    // 2C
    // Changed from the spec in anticipation of
    // https://github.com/w3c/accname/issues/64
    // The spec says we should only consider skipping if we have a non-empty
    // label.
    const skipToStep2E =
      context.recursion && isControl(current) && compute === "name";
    if (!skipToStep2E) {
      const ariaLabel = (
        (isElement(current) && current.getAttribute("aria-label")) ||
        ""
      ).trim();
      if (ariaLabel !== "" && compute === "name") {
        consultedNodes.add(current);
        return ariaLabel;
      }

      // 2D
      if (!isMarkedPresentational(current)) {
        const elementTextAlternative = computeElementTextAlternative(current);
        if (elementTextAlternative !== null) {
          consultedNodes.add(current);
          return elementTextAlternative;
        }
      }
    }

    // Special casing, cheating to make tests pass.
    // https://github.com/w3c/accname/issues/67
    if (hasAnyConcreteRoles(current, ["menu"])) {
      consultedNodes.add(current);
      return "";
    }

    // 2E
    if (skipToStep2E || context.isEmbeddedInLabel || context.isReferenced) {
      if (hasAnyConcreteRoles(current, ["combobox", "listbox"])) {
        consultedNodes.add(current);
        const selectedOptions = querySelectedOptions(current);
        if (selectedOptions.length === 0) {
          // Defined per test `name_heading_combobox`.
          return isHTMLInputElement(current) ? current.value : "";
        }
        return Array.from(selectedOptions)
          .map((selectedOption) =>
            computeTextAlternativeForNode(selectedOption, {
              isEmbeddedInLabel: context.isEmbeddedInLabel,
              isReferenced: false,
              recursion: true,
            }),
          )
          .join(" ");
      }
      if (hasAbstractRole(current, "range")) {
        consultedNodes.add(current);
        if ((current as Element).hasAttribute("aria-valuetext")) {
          // Safe due to hasAttribute guard.
          return (current as Element).getAttribute("aria-valuetext") as string;
        }
        if ((current as Element).hasAttribute("aria-valuenow")) {
          // Safe due to hasAttribute guard.
          return (current as Element).getAttribute("aria-valuenow") as string;
        }
        // Otherwise, use the value as specified by a host language attribute.
        return (current as Element).getAttribute("value") || "";
      }
      if (hasAnyConcreteRoles(current, ["textbox"])) {
        consultedNodes.add(current);
        return getValueOfTextbox(current);
      }
    }

    // 2F: https://w3c.github.io/accname/#step2F
    if (
      allowsNameFromContent(current) ||
      (isElement(current) && context.isReferenced) ||
      isNativeHostLanguageTextAlternativeElement(current) ||
      isDescendantOfNativeHostLanguageTextAlternativeElement(current)
    ) {
      const accumulatedText2F = computeMiscTextAlternative(current, {
        isEmbeddedInLabel: context.isEmbeddedInLabel,
        isReferenced: false,
      });
      if (accumulatedText2F !== "") {
        consultedNodes.add(current);
        return accumulatedText2F;
      }
    }

    if (current.nodeType === current.TEXT_NODE) {
      consultedNodes.add(current);
      return current.textContent || "";
    }

    if (context.recursion) {
      consultedNodes.add(current);
      return computeMiscTextAlternative(current, {
        isEmbeddedInLabel: context.isEmbeddedInLabel,
        isReferenced: false,
      });
    }

    const tooltipAttributeValue = computeTooltipAttributeValue(current);
    if (tooltipAttributeValue !== null) {
      consultedNodes.add(current);
      return tooltipAttributeValue;
    }

    // TODO should this be reachable?
    consultedNodes.add(current);
    return "";
  };

  return asFlatString(
    computeTextAlternativeForNode(root, {
      isEmbeddedInLabel: false,
      // By spec, computeAccessibleDescription starts with the referenced
      // elements as roots.
      isReferenced: compute === "description",
      recursion: false,
    }),
  );
}

/**
 * As defined in step 2A of https://w3c.github.io/accname/#mapping_additional_nd_te
 */
function isHidden(node: Node, getComputedStyle: GetComputedStyle): boolean {
  if (!isElement(node)) {
    return false;
  }
  if (
    node.hasAttribute("hidden") ||
    node.getAttribute("aria-hidden") === "true"
  ) {
    return true;
  }
  const style = getComputedStyle(node);
  return (
    style.getPropertyValue("display") === "none" ||
    style.getPropertyValue("visibility") === "hidden"
  );
}

/**
 * https://w3c.github.io/aria/#namefromprohibited
 */
function prohibitsNaming(node: Node): boolean {
  return hasAnyConcreteRoles(node, [
    "caption",
    "code",
    "deletion",
    "emphasis",
    "generic",
    "insertion",
    "paragraph",
    "presentation",
    "strong",
    "subscript",
    "superscript",
  ]);
}

/**
 * Computes the accessible name of an element following the W3C accname
 * algorithm.
 *
 * Implements https://w3c.github.io/accname/#mapping_additional_nd_name
 */
export function computeAccessibleName(
  root: Element,
  options: ComputeTextAlternativeOptions = {},
): string {
  if (prohibitsNaming(root)) {
    return "";
  }
  return computeTextAlternative(root, options);
}

/**
 * Computes the accessible description of an element following the W3C accname
 * algorithm.
 */
export function computeAccessibleDescription(
  root: Element,
  options: ComputeTextAlternativeOptions = {},
): string {
  let description = queryIdRefs(root, "aria-describedby")
    .map((element) =>
      computeTextAlternative(element, { ...options, compute: "description" }),
    )
    .join(" ");

  // TODO: Technically we need to make sure that node wasn't used for the
  // accessible name. This causes `description_1.0_combobox-focusable-manual` to
  // fail.
  //
  // https://www.w3.org/TR/html-aam-1.0/#accessible-name-and-description-computation
  // says for so many elements to use the `title` that we assume all elements
  // are considered.
  if (description === "") {
    const title = root.getAttribute("title");
    description = title === null ? "" : title;
  }
  return description;
}
