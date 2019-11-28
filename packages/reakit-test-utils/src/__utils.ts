export function trackEvents(element: Element, ...eventNames: string[]) {
  const ref = { event: new Event("any") };
  eventNames.forEach(eventName => {
    element.addEventListener(eventName, event => {
      ref.event = event;
    });
  });
  return ref;
}
