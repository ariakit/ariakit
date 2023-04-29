export function setCSSProperty(
  element: HTMLElement | null | undefined,
  property: string,
  value: string
) {
  if (!element) return () => {};
  let previousValue = element.style.getPropertyValue(property);
  element.style.setProperty(property, value);

  const observer = new MutationObserver(() => {
    const currentValue = element.style.getPropertyValue(property);
    if (currentValue === value) return;
    previousValue = element.style.getPropertyValue(property);
    element.style.setProperty(property, value);
  });

  observer.observe(element, { attributeFilter: ["style"] });

  return () => {
    observer.disconnect();
    if (previousValue) {
      element.style.setProperty(property, previousValue);
    } else {
      element.style.removeProperty(property);
    }
  };
}
