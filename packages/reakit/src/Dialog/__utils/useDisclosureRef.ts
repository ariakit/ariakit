import * as React from "react";

export function useDisclosureRef(hiddenId: string, shouldAssign?: boolean) {
  const disclosureRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!shouldAssign) return;
    disclosureRef.current = document.body.querySelector(
      `[aria-controls~="${hiddenId}"]`
    ) as HTMLElement;
  }, [hiddenId, shouldAssign]);

  return disclosureRef;
}
