/**
 * Similar to `Element.prototype.contains`.
 */
export function contains(parent: Element, child: Element): boolean {
  return parent === child || parent.contains(child);
}
