import { getDocument } from "./getDocument";

export function getActiveElement(element?: Element | Document | null) {
  return getDocument(element).activeElement;
}
