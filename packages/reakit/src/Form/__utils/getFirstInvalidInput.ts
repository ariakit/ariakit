import { getDocument } from "reakit-utils/dom";

export function getFirstInvalidInput(baseId: string, target?: Element | null) {
  const document = getDocument(target);
  const selector = `[aria-invalid=true][id^=${baseId}]`;
  return document.querySelector<HTMLInputElement | HTMLFieldSetElement>(
    selector
  );
}
