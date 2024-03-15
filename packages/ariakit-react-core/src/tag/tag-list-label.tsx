import type { ElementType } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeOptions } from "../composite/composite.jsx";
import { useId, useMergeRefs } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.jsx";
import type { Props } from "../utils/types.js";
import { useTagContext } from "./tag-context.jsx";
import type { TagStore } from "./tag-store.js";

const TagName = "label" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `TagListLabel` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const store = useTagStore();
 * const props = useTagListLabel({ store });
 * <Role {...props}>
 *   <Tag>Tag 1</Tag>
 *   <Tag>Tag 2</Tag>
 * </Role>
 * <TagPanel store={store}>Panel 1</TagPanel>
 * <TagPanel store={store}>Panel 2</TagPanel>
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
 * Renders a composite tag list wrapper for
 * [`Tag`](https://ariakit.org/reference/tag) elements.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {2-5}
 * <TagProvider>
 *   <TagListLabel>
 *     <Tag>Tag 1</Tag>
 *     <Tag>Tag 2</Tag>
 *   </TagListLabel>
 *   <TagPanel>Panel 1</TagPanel>
 *   <TagPanel>Panel 2</TagPanel>
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
