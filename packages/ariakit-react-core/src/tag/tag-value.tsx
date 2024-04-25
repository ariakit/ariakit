import { invariant } from "@ariakit/core/utils/misc";
import type { ReactNode } from "react";
import { useTagContext } from "./tag-context.tsx";
import type { TagStore, TagStoreState } from "./tag-store.ts";

/**
 * Renders the current
 * [`value`](https://ariakit.org/reference/use-tag-store#value) state in
 * the [tag store](https://ariakit.org/reference/use-tag-store).
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props.
 *
 * It takes a
 * [`children`](https://ariakit.org/reference/tag-value#children) function
 * that gets called with the current value as an argument. This can be used as
 * an uncontrolled API to render the tag value in a custom way.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {3-5}
 * <TagProvider>
 *   <TagInput />
 *   <TagValue>
 *     {(value) => `Current value: ${value}`}
 *   </TagValue>
 * </TagProvider>
 * ```
 */
export function TagValue({ store, children }: TagValueProps = {}) {
  const context = useTagContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "TagValue must receive a `store` prop or be wrapped in a TagProvider component.",
  );

  const value = store.useState("value");

  if (children) {
    return children(value);
  }

  return value;
}

export interface TagValueProps {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.org/reference/use-tag-store)
   * hook. If not provided, the closest
   * [`TagProvider`](https://ariakit.org/reference/tag-provider)
   * component's context will be used.
   */
  store?: TagStore;
  /**
   * A function that gets called with the current value as an argument. It can
   * be used to render the tag value in a custom way.
   */
  children?: (value: TagStoreState["value"]) => ReactNode;
}
