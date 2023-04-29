type ElementWithSetups = Element & { __setups?: Map<string, () => void> };

export function setObservableAttribute(
  element: ElementWithSetups,
  attribute: string,
  value: string
) {
  if (!element.__setups) {
    element.__setups = new Map();
  }

  let previousValue = element.getAttribute(attribute);

  const setup = () => {
    previousValue = element.getAttribute(attribute);
    element.setAttribute(attribute, value);
  };

  element.__setups.set(attribute, setup);
  setup();

  const cleanup = () => {
    if (previousValue == null) {
      element.removeAttribute(attribute);
    } else {
      element.setAttribute(attribute, previousValue);
    }
    const prevSetup = element.__setups?.get(attribute);

    if (prevSetup === setup) {
      element.__setups?.delete(attribute);
    } else if (prevSetup) {
      prevSetup();
    }
  };

  return cleanup;
}

export function setObservableProperty<
  T extends ElementWithSetups,
  K extends keyof T & string
>(element: T, property: K, value: T[K]) {
  if (!element.__setups) {
    element.__setups = new Map();
  }

  let previousValue = element[property];

  const setup = () => {
    previousValue = element[property];
    element[property] = value;
  };

  element.__setups.set(property, setup);
  setup();

  const cleanup = () => {
    element[property] = previousValue;
    const prevSetup = element.__setups?.get(property);

    if (prevSetup === setup) {
      element.__setups?.delete(property);
    } else if (prevSetup) {
      prevSetup();
    }
  };

  return cleanup;
}
