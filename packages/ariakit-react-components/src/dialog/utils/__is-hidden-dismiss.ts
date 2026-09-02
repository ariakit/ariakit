export function isHiddenDismiss(
  element?: Element | null,
  ...ids: Array<string | null | undefined>
) {
  if (!element) return false;
  const dismiss = element.getAttribute("data-dialog-hidden-dismiss");
  if (dismiss == null) return false;
  if (dismiss === "") return true;
  if (!ids.length) return true;
  return ids.some((id) => dismiss === id);
}
