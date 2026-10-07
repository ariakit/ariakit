import { contains, getDocument, chain } from "@ariakit/utils";
import {
  addAncestorsToWalkTreeSnapshot,
  addToWalkTreeSnapshot,
  getSnapshotAncestorPropertyName,
  getSnapshotPropertyName,
} from "./__walk-tree-snapshot.ts";
import { setProperty } from "./orchestrate.ts";

type Elements = Array<Element | null>;

// We don't need to walk through certain tags.
const ignoreTags = ["SCRIPT", "STYLE"];

function inSnapshot(id: string, element: Element) {
  const doc = getDocument(element);
  const propertyName = getSnapshotPropertyName(id);
  if (!doc.body[propertyName]) return true;
  do {
    if (element === doc.body) return false;
    if (element[propertyName]) return true;
    if (!element.parentElement) return false;
    element = element.parentElement;
    // oxlint-disable-next-line no-constant-condition
  } while (true);
}

function containsSomeElement(element: Element, elements: Elements) {
  return elements.some(
    (enabledElement) => enabledElement && contains(element, enabledElement),
  );
}

function shouldWalkElement(
  id: string,
  element: Element,
  ignoredElements: Elements,
) {
  if (ignoreTags.includes(element.tagName)) return false;
  if (!inSnapshot(id, element)) return false;
  return !containsSomeElement(element, ignoredElements);
}

// The dialog was inside the element when the snapshot was taken, and it isn't
// there anymore, such as after it moved to a portal.
function isFormerAncestor(
  id: string,
  element: Element,
  ignoredElements: Elements,
) {
  if (!element[getSnapshotAncestorPropertyName(id)]) return false;
  return !containsSomeElement(element, ignoredElements);
}

export function walkTreeOutside(
  id: string,
  elements: Elements,
  callback: (element: Element, originalElement: Element) => void,
  ancestorCallback?: (element: Element, originalElement: Element) => void,
) {
  for (let element of elements) {
    if (!element?.isConnected) continue;
    // If the element has already an ancestor element in the list, we skip it.
    const hasAncestorAlready = elements.some((maybeAncestor) => {
      if (!maybeAncestor) return false;
      if (maybeAncestor === element) return false;
      return maybeAncestor.contains(element);
    });
    const doc = getDocument(element);
    const originalElement = element;
    const walkChildren = (parent: Element) => {
      for (const child of parent.children) {
        if (shouldWalkElement(id, child, elements)) {
          callback(child, originalElement);
          continue;
        }
        // The snapshot has the children of a former ancestor that were in the
        // page when it was taken, and not the ancestor itself. The elements
        // that the page added to it later must stay out of the walk, so the
        // walk goes through its children like it did when the dialog was there.
        // https://github.com/ariakit/ariakit/issues/7774
        if (!isFormerAncestor(id, child, elements)) continue;
        ancestorCallback?.(child, originalElement);
        walkChildren(child);
      }
    };
    // Loops through the parent elements and then through each of their
    // children.
    while (element.parentElement && element !== doc.body) {
      ancestorCallback?.(element.parentElement, originalElement);
      if (!hasAncestorAlready) {
        walkChildren(element.parentElement);
      }
      element = element.parentElement;
    }
  }
}

export function createWalkTreeSnapshot(id: string, elements: Elements) {
  const { body } = getDocument(elements[0]);
  const snapshotElements: Element[] = [];
  const ancestors: Element[] = [];

  walkTreeOutside(
    id,
    elements,
    (element) => {
      snapshotElements.push(element);
    },
    (ancestor) => {
      ancestors.push(ancestor);
    },
  );

  return chain(
    setProperty(body, getSnapshotPropertyName(id), true),
    addToWalkTreeSnapshot(id, snapshotElements),
    addAncestorsToWalkTreeSnapshot(id, ancestors),
  );
}
