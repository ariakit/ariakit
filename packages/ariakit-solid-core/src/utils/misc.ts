import { type MaybeAccessor, access } from "@solid-primitives/utils";
import {
  type Accessor,
  type JSX,
  type ValidComponent,
  createUniqueId,
} from "solid-js";

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

/**
 * Passes metadata props around without leaking them to the DOM.
 */
export function extractMetadataProps<T, K extends keyof any>(
  props: {
    onLoadedMetadata?: JSX.HTMLAttributes<any>["onLoadedMetadata"] & {
      [key in K]?: T;
    };
  },
  key: K,
  value: T,
) {
  const parent = props.onLoadedMetadata;

  const onLoadedMetadata = () => {
    return Object.assign(() => {}, { ...parent, [key]: value });
  };

  return [
    typeof parent === "function"
      ? parent?.[key]
      : parent?.[0](key, parent?.[1]),
    { onLoadedMetadata },
  ] as const;
}
