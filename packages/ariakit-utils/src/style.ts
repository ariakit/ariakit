/**
 * CSS style helpers.
 * @module Style utilities
 */

/**
 * The CSS properties used to visually hide an element while keeping it
 * available to assistive technologies.
 */
interface VisuallyHiddenStyle {
  borderWidth: number;
  clipPath: string;
  height: string;
  margin: string;
  overflow: string;
  padding: number;
  position: "absolute";
  whiteSpace: "nowrap";
  width: string;
}

type MergeStyle<T extends object> = Omit<VisuallyHiddenStyle, keyof T> & T;

/**
 * Returns styles to visually hide an element while keeping it accessible to
 * screen readers.
 */
export function getVisuallyHiddenStyle(): VisuallyHiddenStyle;
export function getVisuallyHiddenStyle<T extends object>(
  style: T,
): MergeStyle<T>;
export function getVisuallyHiddenStyle<T extends object>(style?: T) {
  return {
    borderWidth: 0,
    clipPath: "inset(50%)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
    ...style,
  };
}
