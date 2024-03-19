import type { ReactNode } from "react";
import { useStoreState } from "../utils/store.js";
import { useTagContext } from "./tag-context.js";
import type { TagStore, TagStoreState } from "./tag-store.js";

const defaultValues: string[] = [];

/**
 * Renders the current
 * [`value`](https://ariakit.org/reference/use-tag-store#value) state in the
 * [tag store](https://ariakit.org/reference/use-tag-store).
 *
 * As a headless value component, it doesn't render any DOM elements and
 * therefore doesn't accept HTML props. It can optionally accept a
 * [`fallback`](https://ariakit.org/reference/tag-value#fallback) prop to use
 * as a default value if the store's
 * [`value`](https://ariakit.org/reference/use-tag-store#value) is
 * `undefined`.
 *
 * Additionally, it takes a `children` function that gets called with the
 * current value as an argument. This feature is handy for renderind the value
 * in a custom way.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {3}
 * <TagProvider>
 *   <Tag>
 *     <TagValues fallback="Tag a value" />
 *     <TagArrow />
 *   </Tag>
 *   <TagPopover>
 *     <TagItem value="Apple" />
 *     <TagItem value="Banana" />
 *     <TagItem value="Orange" />
 *   </TagPopover>
 * </TagProvider>
 * ```
 */
export function TagValues({ store, children }: TagValuesProps = {}) {
  const context = useTagContext();
  store = store || context;

  const values = useStoreState(
    store,
    (state) => state?.values || defaultValues,
  );

  if (children) {
    return children(values);
  }

  return values;
}

export interface TagValuesProps {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
   * provided, the parent [`TagList`](https://ariakit.org/reference/tag-list) or
   * [`TagPopover`](https://ariakit.org/reference/tag-popover) components'
   * context will be used.
   */
  store?: TagStore;
  /**
   * A function that gets called with the current value as an argument. This
   * feature is handy for renderind the value in a custom way.
   */
  children?: (values: TagStoreState["values"]) => ReactNode;
}
