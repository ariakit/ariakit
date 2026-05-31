interface CleanupEntry {
  cleanup: () => void;
  disposed: boolean;
}

const cleanups = new WeakMap<Element, Map<string, CleanupEntry[]>>();

function flushCleanupStack(
  elementCleanups: Map<string, CleanupEntry[]>,
  key: string,
  stack: CleanupEntry[],
) {
  while (stack.length) {
    const entry = stack[stack.length - 1];
    if (!entry) {
      elementCleanups.delete(key);
      return;
    }
    if (!entry.disposed) return;
    stack.pop();
    entry.cleanup();
  }
  elementCleanups.delete(key);
}

export function orchestrate(
  element: Element,
  key: string,
  setup: () => () => void,
) {
  if (!cleanups.has(element)) {
    cleanups.set(element, new Map());
  }

  const elementCleanups = cleanups.get(element)!;
  const stack = elementCleanups.get(key) ?? [];
  const entry: CleanupEntry = { cleanup: setup(), disposed: false };

  if (!stack.length) {
    elementCleanups.set(key, stack);
  }
  stack.push(entry);

  return () => {
    if (!stack.includes(entry)) return;
    entry.disposed = true;
    flushCleanupStack(elementCleanups, key, stack);
  };
}

export function setAttribute(element: Element, attr: string, value: string) {
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

export function setProperty<T extends Element, K extends keyof T & string>(
  element: T,
  property: K,
  value: T[K],
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

  // Debug
  // const unsetProperty = orchestrate(element, property, setup);
  // const unsetAttribute = setAttribute(element, property, `${value}`);
  // return () => {
  //   unsetProperty();
  //   unsetAttribute();
  // };

  return orchestrate(element, property, setup);
}

export function assignStyle(
  element: HTMLElement | null | undefined,
  style: Partial<CSSStyleDeclaration>,
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
  value: string,
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
