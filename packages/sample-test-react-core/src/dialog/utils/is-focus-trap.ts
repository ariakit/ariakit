export function isFocusTrap(
  element?: Element | null,
  ...ids: Array<string | null | undefined>
) {
  if (!element) return false;
  const attr = element.getAttribute("data-focus-trap");
  if (attr == null) return false;
  if (!ids.length) return true;
  if (attr === "") return false;
  return ids.some((id) => attr === id);
}
