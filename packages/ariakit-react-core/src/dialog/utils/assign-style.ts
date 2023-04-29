const setups = new WeakMap<HTMLElement, () => void>();

export function assignStyle(
  element: HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>
) {
  if (!element) return () => {};
  let prevStyle = element.style.cssText;

  const setup = () => {
    prevStyle = element.style.cssText;
    Object.assign(element.style, style);
  };

  setup();
  setups.set(element, setup);

  const cleanup = () => {
    element.style.cssText = prevStyle;
    const prevSetup = setups.get(element);

    if (prevSetup === setup) {
      setups.delete(element);
    } else if (prevSetup) {
      prevSetup();
    }
  };

  return cleanup;
}
