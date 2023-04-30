const setups = Symbol();
type Element$ = Element & { [setups]?: Map<string, () => void> };

function orchestrate(
  element: Element$,
  key: string,
  setup: () => void,
  cleanup: () => void
) {
  if (!element[setups]) {
    element[setups] = new Map();
  }

  element[setups].set(key, setup);
  setup();

  return () => {
    cleanup();
    const prevSetup = element[setups]?.get(key);
    if (prevSetup === setup) {
      element[setups]?.delete(key);
    } else if (prevSetup) {
      prevSetup();
    }
  };
}

export function setAttribute(element: Element$, attr: string, value: string) {
  let previousValue = element.getAttribute(attr);

  const setup = () => {
    previousValue = element.getAttribute(attr);
    element.setAttribute(attr, value);
  };

  const cleanup = () => {
    if (previousValue == null) {
      element.removeAttribute(attr);
    } else {
      element.setAttribute(attr, previousValue);
    }
  };

  return orchestrate(element, attr, setup, cleanup);
}

export function setProperty<T extends Element$, K extends keyof T & string>(
  element: T,
  property: K,
  value: T[K]
) {
  let previousValue = element[property];

  const setup = () => {
    previousValue = element[property];
    element[property] = value;
  };

  const cleanup = () => {
    element[property] = previousValue;
  };

  return orchestrate(element, property, setup, cleanup);
}

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

  const cleanup = () => {
    element.style.cssText = prevStyle;
  };

  return orchestrate(element, "style", setup, cleanup);
}

export function setCSSProperty(
  element: HTMLElement | null | undefined,
  property: string,
  value: string
) {
  if (!element) return () => {};
  let previousValue = element.style.getPropertyValue(property);

  const setup = () => {
    previousValue = element.style.getPropertyValue(property);
    element.style.setProperty(property, value);
  };

  const cleanup = () => {
    if (previousValue) {
      element.style.setProperty(property, previousValue);
    } else {
      element.style.removeProperty(property);
    }
  };

  return orchestrate(element, property, setup, cleanup);
}
