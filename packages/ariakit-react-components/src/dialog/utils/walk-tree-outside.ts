import { contains, getDocument, chain } from "@ariakit/utils";
import {
  addToWalkTreeSnapshot,
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

function shouldWalkElement(
  id: string,
  element: Element,
  ignoredElements: Elements,
) {
  if (ignoreTags.includes(element.tagName)) return false;
  if (!inSnapshot(id, element)) return false;
  return !ignoredElements.some(
    (enabledElement) => enabledElement && contains(element, enabledElement),
  );
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
    // Loops through the parent elements and then through each of their
    // children.
    while (element.parentElement && element !== doc.body) {
      ancestorCallback?.(element.parentElement, originalElement);
      if (!hasAncestorAlready) {
        for (const child of element.parentElement.children) {
          if (shouldWalkElement(id, child, elements)) {
            callback(child, originalElement);
          }
        }
      }
      element = element.parentElement;
    }
  }
}

export function createWalkTreeSnapshot(id: string, elements: Elements) {
  const { body } = getDocument(elements[0]);
  const snapshotElements: Element[] = [];

  walkTreeOutside(id, elements, (element) => {
    snapshotElements.push(element);
  });

  return chain(
    setProperty(body, getSnapshotPropertyName(id), true),
    addToWalkTreeSnapshot(id, snapshotElements),
  );
}
