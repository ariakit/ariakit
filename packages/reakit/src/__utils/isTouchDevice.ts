// TODO: Find a better implementation

export function isTouchDevice() {
  if (process.env.NODE_ENV === "test") return false;
  return (
    typeof window !== "undefined" ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}
