export function isBackdrop(
  element?: Element | null,
  dialog?: HTMLElement | null
) {
  if (!element) return false;
  const backdrop = element.getAttribute("data-backdrop");
  if (backdrop == null) return false;
  if (backdrop === "") return true;
  if (backdrop === "true") return true;
  const id = dialog?.id;
  if (!id) return false;
  return backdrop === id;
}
