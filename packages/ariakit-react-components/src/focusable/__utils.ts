import type { AnyFunction } from "@ariakit/utils";

export const accessibleWhenDisabledSymbol = Symbol("accessibleWhenDisabled");

interface AccessibleWhenDisabledProps {
  accessibleWhenDisabled?: boolean;
  onLoadedMetadataCapture?: AnyFunction & {
    [accessibleWhenDisabledSymbol]?: boolean;
  };
}

// Reads the direct or inherited value without replacing the metadata carrier.
// `useCompositeItem` runs before its own `useFocusable` call, and a replacement
// would prevent a composed `useCommand` from propagating its marker.
export function accessibleWhenDisabledFromProps(
  props: AccessibleWhenDisabledProps,
) {
  return (
    props.accessibleWhenDisabled ??
    props.onLoadedMetadataCapture?.[accessibleWhenDisabledSymbol]
  );
}

// Internal marker Focusable stamps after resolving a disabled state. The exact
// boolean string reports whether the element has a keyboard path. Metadata
// props only reach inner components, so a hook that runs before its own
// useFocusable call has to read the element to learn what a component composed
// with `render` below it resolved. Neither `pointer-events` nor `tabIndex` can
// stand in for it: consumers routinely override the former, and roving tabindex
// makes the latter meaningless on composite items.
// https://github.com/ariakit/ariakit/issues/7116
export const trulyDisabledAttribute = "data-truly-disabled";

/**
 * Checks whether Focusable resolved this element as disabled and not keyboard
 * accessible, based on the exact boolean value it stamps on the element.
 */
export function trulyDisabledFromElement(element: Element) {
  return element.getAttribute(trulyDisabledAttribute) === "true";
}

/**
 * Returns the exact disabled result stamped by an active Focusable, or
 * undefined when no active Focusable resolved the element.
 */
export function resolvedTrulyDisabledFromElement(element: Element) {
  const value = element.getAttribute(trulyDisabledAttribute);
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

// Keys that composite widgets move focus with. They're never typing, so they
// count as keyboard navigation whether or not a modifier is held. Keep in sync
// with the key maps in composite.tsx and composite-item.tsx.
export function isCompositeMoveKey(key: string) {
  return (
    key === "ArrowUp" ||
    key === "ArrowRight" ||
    key === "ArrowDown" ||
    key === "ArrowLeft" ||
    key === "Home" ||
    key === "End" ||
    key === "PageUp" ||
    key === "PageDown"
  );
}
