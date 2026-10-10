interface ScrollRequest {
  element: HTMLElement;
  isCurrent: () => boolean;
}

type ScrollListener = (request: ScrollRequest) => (() => void) | undefined;

const listeners = new WeakMap<Element, ScrollListener>();

export function subscribeScrollIntoView(
  renderer: Element,
  listener: ScrollListener,
) {
  listeners.set(renderer, listener);
  return () => listeners.delete(renderer);
}

/** Notifies every containing renderer before a composite presents an item. */
export function prepareScrollIntoView(request: ScrollRequest) {
  const cleanups: Array<() => void> = [];
  let ancestor = request.element.parentElement;
  while (ancestor) {
    const cleanup = listeners.get(ancestor)?.(request);
    if (cleanup) {
      cleanups.push(cleanup);
    }
    ancestor = ancestor.parentElement;
  }
  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}
