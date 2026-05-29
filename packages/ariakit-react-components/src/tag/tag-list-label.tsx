import { useStoreState } from "@ariakit/react-store";
import {
  useId,
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useTagContext } from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";

const TagName = "label" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `TagListLabel` component.
 * @see https://ariakit.com/components/tag
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
    const htmlFor = useStoreState(store, (state) => state.inputElement?.id);

    props = {
      htmlFor,
      ...props,
      id,
      ref: useMergeRefs(store.setLabelElement, props.ref),
    };

    return props;
  },
);

/**
 * Renders a label element for the
 * [`TagInput`](https://ariakit.com/reference/tag-input) and also acts as the
 * accessible name for the listbox element rendered by
 * [`TagList`](https://ariakit.com/reference/tag-list).
 * @see https://ariakit.com/components/tag
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

export interface TagListLabelOptions<
  T extends ElementType = TagName,
> extends CompositeOptions<T> {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.com/reference/use-tag-store) hook. If not
   * provided, the closest
   * [`TagProvider`](https://ariakit.com/reference/tag-provider) component's
   * context will be used.
   */
  store?: TagStore;
}

export type TagListLabelProps<T extends ElementType = TagName> = Props<
  T,
  TagListLabelOptions<T>
>;
