import * as React from "react";

function isDisclosure(refId: string, element: Element) {
  const attribute = element.getAttribute("aria-controls");
  if (!attribute) return false;
  return attribute.split(" ").indexOf(refId) >= 0;
}

export function useDisclosureRef(
  refId: string,
  getContainer?: () => Element | null,
  shouldAssign?: boolean
) {
  const disclosureRef = React.useRef<HTMLElement | null>(null);

  const defaultGetContainer = React.useCallback(() => document.body, []);

  React.useEffect(() => {
    if (!shouldAssign) return;

    const container = (getContainer && getContainer()) || defaultGetContainer();

    disclosureRef.current = (isDisclosure(refId, container)
      ? container
      : container.querySelector(`[aria-controls~="${refId}"]`)) as HTMLElement;
  }, [refId, shouldAssign, defaultGetContainer, getContainer]);

  return disclosureRef;
}
