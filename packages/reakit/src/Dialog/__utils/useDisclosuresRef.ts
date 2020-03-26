import * as React from "react";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { getDocument } from "reakit-utils/getDocument";
import { DialogOptions } from "../Dialog";

function useLastActiveElementRef(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const lastActiveElementRef = React.useRef<Element | null>(null);

  useIsomorphicEffect(() => {
    if (options.visible) return undefined;
    const document = getDocument(dialogRef.current);
    const onFocus = (event: FocusEvent) => {
      lastActiveElementRef.current = event.target as Element;
    };
    document.addEventListener("focus", onFocus, true);
    return () => document.removeEventListener("focus", onFocus, true);
  }, [options.visible, dialogRef]);

  return lastActiveElementRef;
}

export function useDisclosuresRef(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const disclosuresRef = React.useRef<HTMLElement[]>([]);
  const lastActiveElementRef = useLastActiveElementRef(dialogRef, options);

  React.useEffect(() => {
    if (!options.visible) return;

    const document = getDocument(dialogRef.current);
    const selector = `[aria-controls~="${options.baseId}"]`;
    const disclosures = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    );

    if (lastActiveElementRef.current instanceof HTMLElement) {
      if (disclosures.indexOf(lastActiveElementRef.current) !== -1) {
        const withoutLastActiveElement = disclosures.filter(
          disclosure => disclosure !== lastActiveElementRef.current
        );
        disclosuresRef.current = [
          lastActiveElementRef.current,
          ...withoutLastActiveElement
        ];
      } else {
        disclosuresRef.current = [lastActiveElementRef.current, ...disclosures];
      }
    } else {
      disclosuresRef.current = disclosures;
    }
  }, [options.visible, dialogRef, options.baseId]);

  return disclosuresRef;
}
