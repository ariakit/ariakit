export function supportsInert() {
  // Debug
  // return false;
  return "inert" in HTMLElement.prototype;
}
