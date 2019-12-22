// TODO: Find a better implementation
export function isTouchDevice() {
  if (process.env.NODE_ENV === "test" || typeof window === "undefined")
    return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}
