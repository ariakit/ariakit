export default function assignStyle(
  element: HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>
) {
  if (!element) return () => {};

  const previousStyle = element.style.cssText;

  Object.assign(element.style, style);

  const restorePreviousStyle = () => {
    element.style.cssText = previousStyle;
  };
  return restorePreviousStyle;
}
