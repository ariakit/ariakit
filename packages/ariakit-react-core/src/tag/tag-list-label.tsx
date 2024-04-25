import { invariant } from "@ariakit/core/utils/misc";
import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useId, useMergeRefs } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useTagContext } from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";

const TagName = "label" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `TagListLabel` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTagListLabel();
 * <Role.label {...props} />
 * ```
 */
export const useTagListLabel = createHook<TagName, TagListLabelOptions>(
  function useTagListLabel({ store, ...props }) {
    const context = useTagContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TagListLabel must receive a `store` prop or be wrapped in a TagProvider component.",
    );

    const id = useId(props.id);
    const htmlFor = store.useState((state) => state.inputElement?.id);

    props = {
      id,
      htmlFor,
      ...props,
      ref: useMergeRefs(store.setLabelElement, props.ref),
    };

    return props;
  },
);

/**
 * Renders a label element for the
 * [`TagInput`](https://ariakit.org/reference/tag-input) and also acts as the
 * accessible name for the listbox element rendered by
 * [`TagList`](https://ariakit.org/reference/tag-list).
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {2}
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
export const TagListLabel = forwardRef(function TagListLabel(
  props: TagListLabelProps,
) {
  const htmlProps = useTagListLabel(props);
  return createElement(TagName, htmlProps);
});

export interface TagListLabelOptions<T extends ElementType = TagName>
  extends CompositeOptions<T> {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
   * provided, the closest
   * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
   * context will be used.
   */
  store?: TagStore;
}

export type TagListLabelProps<T extends ElementType = TagName> = Props<
  T,
  TagListLabelOptions<T>
>;
