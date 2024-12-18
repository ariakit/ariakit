import { invariant } from "@ariakit/core/utils/misc";
import type { ReactNode } from "react";
import { useTagContext } from "./tag-context.tsx";
import type { TagStore, TagStoreState } from "./tag-store.ts";

/**
 * Renders the current
 * [`values`](https://ariakit.org/reference/use-tag-store#values) state in the
 * [tag store](https://ariakit.org/reference/use-tag-store).
 *
 * As a value component, it doesn't render any DOM elements and therefore
 * doesn't accept HTML props.
 *
 * It takes a [`children`](https://ariakit.org/reference/tag-values#children)
 * function that gets called with the current values as an argument. This can be
 * used as an uncontrolled API to render
 * [`Tag`](https://ariakit.org/reference/tag) components.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {4-13}
 * <TagProvider>
 *   <TagListLabel>Invitees</TagListLabel>
 *   <TagList>
 *     <TagValues>
 *       {(values) =>
 *         values.map((value) => (
 *           <Tag key={value} value={value}>
 *             {value}
 *             <TagRemove />
 *           </Tag>
 *         ))
 *       }
 *     </TagValues>
 *     <TagInput />
 *   </TagList>
 * </TagProvider>
 * ```
 */
export function TagValues({ store, children }: TagValuesProps = {}) {
  const context = useTagContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "TagValues must receive a `store` prop or be wrapped in a TagProvider component.",
  );

  const values = store.useState("values");

  if (children) {
    return children(values);
  }

  return values;
}

export interface TagValuesProps {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
   * provided, the closest
   * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
   * context will be used.
   */
  store?: TagStore;
  /**
   * A function that gets called with the current values as an argument. This
   * can be used as an uncontrolled API to render
   * [`Tag`](https://ariakit.org/reference/tag) components.
   */
  children?: (values: TagStoreState["values"]) => ReactNode;
}
