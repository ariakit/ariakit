import type { AnyFunction } from "@ariakit/utils";

// Focusable passes its resolved `accessibleWhenDisabled` value down through
// metadata props, so a hook that runs before its own useFocusable call can read
// what an outer component composed with `render` already decided.
export const accessibleWhenDisabledSymbol = Symbol("accessibleWhenDisabled");

interface AccessibleWhenDisabledProps {
  onLoadedMetadataCapture?: AnyFunction & {
    [accessibleWhenDisabledSymbol]?: boolean;
  };
}

/**
 * Resolves whether an element should stay accessible while disabled, falling
 * back to the value inherited from an outer component.
 */
export function resolveAccessibleWhenDisabled(
  props: AccessibleWhenDisabledProps,
  accessibleWhenDisabled?: boolean,
) {
  return (
    accessibleWhenDisabled ??
    props.onLoadedMetadataCapture?.[accessibleWhenDisabledSymbol]
  );
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
