const cleanups = Symbol();
type Element$ = Element & { [cleanups]?: Map<string, () => void> };

function orchestrate(element: Element$, key: string, setup: () => () => void) {
  if (!element[cleanups]) {
    element[cleanups] = new Map();
  }

  const elementCleanups = element[cleanups];
  const prevCleanup = elementCleanups.get(key);

  if (!prevCleanup) {
    elementCleanups.set(key, setup());
    return () => {
      elementCleanups.get(key)?.();
      elementCleanups.delete(key);
    };
  }

  const cleanup = setup();

  const nextCleanup = () => {
    cleanup();
    prevCleanup();
    elementCleanups.delete(key);
  };

  elementCleanups.set(key, nextCleanup);

  return () => {
    if (elementCleanups.get(key) !== nextCleanup) return;
    cleanup();
    elementCleanups.set(key, prevCleanup);
  };
}

export function setAttribute(element: Element$, attr: string, value: string) {
  const setup = () => {
    const previousValue = element.getAttribute(attr);
    element.setAttribute(attr, value);
    return () => {
      if (previousValue == null) {
        element.removeAttribute(attr);
      } else {
        element.setAttribute(attr, previousValue);
      }
    };
  };
  return orchestrate(element, attr, setup);
}

export function setProperty<T extends Element$, K extends keyof T & string>(
  element: T,
  property: K,
  value: T[K]
) {
  const setup = () => {
    const exists = property in element;
    const previousValue = element[property];
    element[property] = value;
    return () => {
      if (!exists) {
        delete element[property];
      } else {
        element[property] = previousValue;
      }
    };
  };

  return orchestrate(element, property, setup);
}

export function assignStyle(
  element: HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>
) {
  if (!element) return () => {};

  const setup = () => {
    const prevStyle = element.style.cssText;
    Object.assign(element.style, style);
    return () => {
      element.style.cssText = prevStyle;
    };
  };

  return orchestrate(element, "style", setup);
}

export function setCSSProperty(
  element: HTMLElement | null | undefined,
  property: string,
  value: string
) {
  if (!element) return () => {};

  const setup = () => {
    const previousValue = element.style.getPropertyValue(property);
    element.style.setProperty(property, value);
    return () => {
      if (previousValue) {
        element.style.setProperty(property, previousValue);
      } else {
        element.style.removeProperty(property);
      }
    };
  };

  return orchestrate(element, property, setup);
}
