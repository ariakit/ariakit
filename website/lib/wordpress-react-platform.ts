import { createPortal, flushSync } from "react-dom";
import { createRoot, hydrateRoot } from "react-dom/client";

export { createPortal, createRoot, flushSync, hydrateRoot };

type Container = Element | DocumentFragment;
type Root = ReturnType<typeof createRoot>;
type Children = Parameters<Root["render"]>[0];

const roots = new WeakMap<Container, Root>();

export function render(children: Children, container: Container) {
  const root = roots.get(container) ?? createRoot(container);
  roots.set(container, root);
  root.render(children);
  return null;
}

export function hydrate(children: Children, container: Element) {
  const root = hydrateRoot(container, children);
  roots.set(container, root);
  return null;
}

export function unmountComponentAtNode(container: Container) {
  const root = roots.get(container);
  if (!root) return false;
  root.unmount();
  roots.delete(container);
  return true;
}

export function findDOMNode() {
  return null;
}
