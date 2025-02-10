import { useContext } from "solid-js";
import type { ReactNode } from "../utils/__port.ts";
import { $o, withPropsSink } from "../utils/__props.ts";
import { HeadingContext } from "./heading-context.tsx";
import type { HeadingLevels } from "./utils.ts";

/**
 * A component that sets the heading level for its children. It doesn't render
 * any HTML element, just sets the
 * [`level`](https://solid.ariakit.org/reference/heading-level#level) prop on the
 * context.
 * @see https://solid.ariakit.org/components/heading
 * @example
 * ```jsx
 * <HeadingLevel>
 *   <Heading>Heading 1</Heading>
 *   <HeadingLevel>
 *     <Heading>Heading 2</Heading>
 *   </HeadingLevel>
 * </HeadingLevel>
 * ```
 */
function _HeadingLevel(__: HeadingLevelProps) {
  const [_] = $o(__, { level: undefined, children: undefined });
  const contextLevel = useContext(HeadingContext);
  // biome-ignore format: [port]
  const nextLevel = () => Math.max(
    Math.min(_.level || contextLevel() + 1, 6),
    1,
  ) as HeadingLevels;
  return (
    <HeadingContext.Provider value={nextLevel}>
      {_.children}
    </HeadingContext.Provider>
  );
}
export const HeadingLevel = withPropsSink(_HeadingLevel);

export interface HeadingLevelProps {
  /**
   * The heading level. By default, it'll increase the level by 1 based on the
   * context.
   */
  level?: HeadingLevels;
  children?: ReactNode;
}
