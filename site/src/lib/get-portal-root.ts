export function getPortalRoot(node: HTMLElement) {
  const id = "portal-root";
  const existingRoot = document.getElementById(id);
  if (existingRoot) return existingRoot;
  const root = document.createElement("div");
  root.id = id;
  node.ownerDocument?.body.appendChild(root);
  return root;
}
