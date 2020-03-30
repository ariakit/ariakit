import * as React from "react";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { getDocument } from "reakit-utils/getDocument";
import { DialogOptions } from "../Dialog";

function useActiveElementRef(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const activeElementRef = React.useRef<Element | null>(null);

  useIsomorphicEffect(() => {
    if (options.visible) return undefined;
    const document = getDocument(dialogRef.current);
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Element;
      activeElementRef.current = target;
    };
    document.addEventListener("focus", onFocus, true);
    return () => document.removeEventListener("focus", onFocus, true);
  }, [options.visible, dialogRef]);

  return activeElementRef;
}

export function useDisclosuresRef(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const disclosuresRef = React.useRef<HTMLElement[]>([]);
  const activeElementRef = useActiveElementRef(dialogRef, options);

  React.useEffect(() => {
    if (!options.visible) return;

    const document = getDocument(dialogRef.current);
    const selector = `[aria-controls~="${options.baseId}"]`;
    const disclosures = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    );

    if (activeElementRef.current instanceof HTMLElement) {
      if (disclosures.indexOf(activeElementRef.current) !== -1) {
        const withoutActiveElement = disclosures.filter(
          disclosure => disclosure !== activeElementRef.current
        );
        disclosuresRef.current = [
          activeElementRef.current,
          ...withoutActiveElement
        ];
      } else {
        disclosuresRef.current = [activeElementRef.current, ...disclosures];
      }
    } else {
      disclosuresRef.current = disclosures;
    }
  }, [options.visible, dialogRef, options.baseId]);

  return disclosuresRef;
}
