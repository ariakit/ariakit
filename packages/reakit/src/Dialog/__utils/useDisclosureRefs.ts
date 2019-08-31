import * as React from "react";
import { DialogOptions } from "../Dialog";

export function useDisclosureRefs(options: DialogOptions) {
  const disclosureRefs = React.useRef<HTMLElement[]>([]);
  const lastActiveElement = React.useRef<Element | null>(null);

  React.useEffect(() => {
    if (options.visible) return undefined;
    const onFocus = () => {
      lastActiveElement.current = document.activeElement;
    };
    document.addEventListener("focus", onFocus, true);
    return () => document.removeEventListener("focus", onFocus, true);
  }, [options.visible]);

  React.useEffect(() => {
    if (!options.visible) return;

    const selector = `[aria-controls~="${options.unstable_hiddenId}"]`;
    const disclosures = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    );

    if (lastActiveElement.current instanceof HTMLElement) {
      if (disclosures.indexOf(lastActiveElement.current) !== -1) {
        disclosureRefs.current = [
          lastActiveElement.current,
          ...disclosures.filter(
            disclosure => disclosure !== lastActiveElement.current
          )
        ];
      } else {
        disclosureRefs.current = [lastActiveElement.current, ...disclosures];
      }
    } else {
      disclosureRefs.current = disclosures;
    }
  }, [options.unstable_hiddenId, options.visible]);

  return disclosureRefs;
}
