import { combineProps } from "@solid-primitives/props";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import { type Accessor, type ValidComponent, createUniqueId } from "solid-js";
import type { WrapInstance, WrapInstanceValue } from "./types.ts";

/**
 * Generates a unique ID.
 */
export function useId(
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
 *   const tagName = useTagName(ref, "button"); // () => "div"
 *   return <div ref={setRef} {...props} />;
 * }
 */
export function useTagName(
  refOrElement?: MaybeAccessor<HTMLElement | undefined>,
  fallback?: ValidComponent,
) {
  return () => {
    const element = access(refOrElement);
    return (
      element?.tagName.toLowerCase() ??
      (typeof fallback === "string" ? fallback : undefined)
    );
  };
}

/**
 * Returns props with an additional `wrapInstance` prop.
 */
export function useWrapInstance<P, Q = P & { wrapInstance: WrapInstance }>(
  props: P & { wrapInstance?: WrapInstance },
  element: WrapInstanceValue,
): Q {
  const wrapInstance = [...(props.wrapInstance ?? []), element];
  return combineProps(props, { wrapInstance }) as Q;
}
