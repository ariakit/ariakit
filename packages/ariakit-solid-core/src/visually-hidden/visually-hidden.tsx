import { combineStyle } from "@solid-primitives/props";
import type { ValidComponent } from "solid-js";
import { Role } from "../role/role.tsx";
import type { Options, Props } from "../utils/types.ts";

const TagName = "span" satisfies ValidComponent;
type TagName = typeof TagName;
const Element = Role[TagName];

/**
 * Renders an element that's visually hidden, but still accessible to screen
 * readers.
 * @see https://solid.ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * <a href="#">
 *   Learn more<VisuallyHidden> about the Solar System</VisuallyHidden>.
 * </a>
 * ```
 */
export function VisuallyHidden(props: VisuallyHiddenProps) {
  return (
    <Element
      {...props}
      style={combineStyle(
        {
          border: 0,
          clip: "rect(0 0 0 0)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          "white-space": "nowrap",
          width: "1px",
        },
        props.style,
      )}
    />
  );
}

export interface VisuallyHiddenOptions<_T extends ValidComponent = TagName>
  extends Options {}

export type VisuallyHiddenProps = Props<TagName, VisuallyHiddenOptions>;
