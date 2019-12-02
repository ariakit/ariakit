export function subscribeDefaultPrevented(
  element: Element,
  ...eventNames: string[]
) {
  const ref = { current: false, unsubscribe: () => {} };

  const handleEvent = (event: Event) => {
    const preventDefault = event.preventDefault.bind(event);
    event.preventDefault = () => {
      ref.current = true;
      preventDefault();
    };
  };

  eventNames.forEach(eventName => {
    element.addEventListener(eventName, handleEvent);
  });

  ref.unsubscribe = () => {
    eventNames.forEach(eventName => {
      element.removeEventListener(eventName, handleEvent);
    });
  };

  return ref;
}
