export function isBackdrop(
  element?: Element | null,
  ...ids: Array<string | null | undefined>
) {
  if (!element) return false;
  const backdrop = element.getAttribute("data-backdrop");
  if (backdrop == null) return false;
  if (backdrop === "") return true;
  if (backdrop === "true") return true;
  if (!ids.length) return true;
  return ids.some((id) => backdrop === id);
}
