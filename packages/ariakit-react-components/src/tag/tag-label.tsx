import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useId,
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { ElementType } from "react";
import { useTagContext } from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";

const TagName = "label" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `TagLabel` component.
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx
 * const props = useTagLabel();
 * <Role.label {...props} />
 * ```
 */
export const useTagLabel = createHook<TagName, TagLabelOptions>(
  function useTagLabel({ store, ...props }) {
    const context = useTagContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TagLabel must receive a `store` prop or be wrapped in a TagProvider component.",
    );

    const id = useId(props.id);
    const inputElement = useStoreState(store, "inputElement");
    useAttribute(inputElement, "id");
    const htmlFor = inputElement?.id;

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
 * Renders a label element for the tag field. It labels the
 * [`TagInput`](https://ariakit.com/reference/tag-input) element and provides
 * the accessible name for both the group element rendered by
 * [`TagControl`](https://ariakit.com/reference/tag-control) and the listbox
 * element rendered by [`TagList`](https://ariakit.com/reference/tag-list).
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx {2}
 * <TagProvider>
 *   <TagLabel>Invitees</TagLabel>
 *   <TagControl>
 *     <TagList style={{ display: "contents" }}>
 *       <TagValues>
 *         {(values) =>
 *           values.map((value) => (
 *             <Tag key={value} value={value}>
 *               {value}
 *               <TagRemove />
 *             </Tag>
 *           ))
 *         }
 *       </TagValues>
 *     </TagList>
 *     <TagInput />
 *   </TagControl>
 * </TagProvider>
 * ```
 */
export const TagLabel = forwardRef(function TagLabel(props: TagLabelProps) {
  const htmlProps = useTagLabel(props);
  return createElement(TagName, htmlProps);
});

export interface TagLabelOptions<
  _T extends ElementType = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.com/reference/use-tag-store) hook. If not
   * provided, the closest
   * [`TagProvider`](https://ariakit.com/reference/tag-provider) component's
   * context will be used.
   */
  store?: TagStore;
}

export type TagLabelProps<T extends ElementType = TagName> = Props<
  T,
  TagLabelOptions<T>
>;
