import { combineProps } from "@solid-primitives/props";
import type { Accessor, JSX, ValidComponent } from "solid-js";
import type { WrapElement } from "./types.ts";

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
  refOrElement?: Accessor<HTMLElement | undefined> | HTMLElement,
  fallback?: ValidComponent,
) {
  return () => {
    const element =
      typeof refOrElement === "function" ? refOrElement() : refOrElement;
    return (
      element?.tagName.toLowerCase() ??
      (typeof fallback === "string" ? fallback : undefined)
    );
  };
}

/**
 * Returns props with an additional `wrapElement` prop.
 */
export function useWrapElement<P, Q = P & { wrapElement: WrapElement }>(
  props: P & { wrapElement?: WrapElement },
  element: JSX.Element,
): Q {
  const wrapElement = [...(props.wrapElement ?? []), element];
  return combineProps(props, { wrapElement }) as Q;
}
