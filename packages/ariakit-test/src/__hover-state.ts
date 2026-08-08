interface DocumentWithLastHovered extends Document {
  lastHovered?: Element | null;
}

export function getLastHovered(document: Document) {
  return (document as DocumentWithLastHovered).lastHovered;
}

export function setLastHovered(element: Element) {
  const document = element.ownerDocument as DocumentWithLastHovered;
  document.lastHovered = element;
}
