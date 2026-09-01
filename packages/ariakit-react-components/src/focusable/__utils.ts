import type { AnyFunction } from "@ariakit/utils";

export const accessibleWhenDisabledSymbol = Symbol("accessibleWhenDisabled");

interface AccessibleWhenDisabledProps {
  accessibleWhenDisabled?: boolean;
  onLoadedMetadataCapture?: AnyFunction & {
    [accessibleWhenDisabledSymbol]?: boolean;
  };
}

export function accessibleWhenDisabledFromProps(
  props: AccessibleWhenDisabledProps,
) {
  return (
    props.accessibleWhenDisabled ??
    props.onLoadedMetadataCapture?.[accessibleWhenDisabledSymbol]
  );
}

// Internal marker Focusable stamps on an element it resolved as disabled with
// no way to reach it by keyboard. Metadata props only reach inner components,
// so a hook that runs before its own useFocusable call has to read the element
// to learn what a component composed with `render` below it resolved. Neither
// `pointer-events` nor `tabIndex` can stand in for it: consumers routinely
// override the former, and roving tabindex makes the latter meaningless on
// composite items.
// https://github.com/ariakit/ariakit/issues/7116
export const trulyDisabledAttribute = "data-truly-disabled";

/**
 * Checks whether Focusable resolved this element as disabled and not keyboard
 * accessible, based on the attribute it stamps on it. Only the exact stamped
 * value counts: a render component may emit the same attribute with a false
 * value for its own styling, which React renders as `"false"`.
 */
export function trulyDisabledFromElement(element: Element) {
  return element.getAttribute(trulyDisabledAttribute) === "true";
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
