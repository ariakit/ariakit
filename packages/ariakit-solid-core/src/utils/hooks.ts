import type { Accessor, ValidComponent } from "solid-js";

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
