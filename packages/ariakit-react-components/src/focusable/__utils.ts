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

export const trulyDisabledAttribute = "data-truly-disabled";

export function trulyDisabledFromElement(element: Element) {
  return element.getAttribute(trulyDisabledAttribute) === "true";
}

// Consumers may set data-truly-disabled to true or false for their own styling.
// This reserved marker carries the accessible-disabled result and takes
// precedence when both attributes are present.
// https://github.com/ariakit/ariakit/pull/7376#discussion_r3904009762
export const accessibleDisabledAttribute =
  "data-focusable-accessible-when-disabled";

export function resolvedTrulyDisabledFromElement(element: Element) {
  if (element.getAttribute(accessibleDisabledAttribute) === "true") {
    return false;
  }
  if (trulyDisabledFromElement(element)) return true;
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
