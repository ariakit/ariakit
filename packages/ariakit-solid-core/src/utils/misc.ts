import type { MaybeAccessor } from "@solid-primitives/utils";
import { access } from "@solid-primitives/utils";
import type { Accessor, ValidComponent } from "solid-js";
import { createUniqueId } from "solid-js";

/**
 * Generates a unique ID.
 */
export function createId(
  defaultId?: MaybeAccessor<string | undefined>,
): Accessor<string> {
  const id = createUniqueId();
  return () => access(defaultId) ?? id;
}

/**
 * Returns the tag name by parsing an element.
 * @example
 * function Component(props) {
 *   const [ref, setRef] = createSignal();
 *   const tagName = extractTagName(ref, "button"); // () => "div"
 *   return <div ref={setRef} {...props} />;
 * }
 */
export function extractTagName(
  element?: MaybeAccessor<HTMLElement | undefined>,
  fallback?: ValidComponent,
) {
  return () => {
    return (
      access(element)?.tagName.toLowerCase() ??
      (typeof fallback === "string" ? fallback : undefined)
    );
  };
}
