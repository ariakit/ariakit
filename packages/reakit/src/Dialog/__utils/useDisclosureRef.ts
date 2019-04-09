import * as React from "react";
import { DialogOptions } from "../Dialog";

export function useDisclosureRef(options: DialogOptions) {
  const disclosureRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!options.visible) return;
    const selector = `[aria-controls~="${options.unstable_hiddenId}"]`;
    disclosureRef.current = document.querySelector(selector) as HTMLElement;
  }, [options.unstable_hiddenId, options.visible]);

  return disclosureRef;
}
