export function getFirstInvalidInput(baseId: string) {
  const selector = `[aria-invalid=true][id^=${baseId}]`;
  // TODO
  return document.querySelector<HTMLInputElement | HTMLFieldSetElement>(
    selector
  );
}
