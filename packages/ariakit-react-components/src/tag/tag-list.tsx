import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import {
  TagScopedContextProvider,
  useTagProviderContext,
} from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";
import { useTouchDevice } from "./utils.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `TagList` component.
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx
 * const props = useTagList();
 * <Role.div {...props} />
 * ```
 */
export const useTagList = createHook<TagName, TagListOptions>(
  function useTagList({ store, ...props }) {
    const context = useTagProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TagList must receive a `store` prop or be wrapped in a TagProvider component.",
    );

    props = useWrapElement(
      props,
      (element) => (
        <TagScopedContextProvider value={store}>
          {element}
        </TagScopedContextProvider>
      ),
      [store],
    );

    const orientation = useStoreState(store, ["orientation"], (state) =>
      state.orientation === "both" ? undefined : state.orientation,
    );
    const labelElement = useStoreState(store, "labelElement");
    useAttribute(labelElement, "id");
    const labelId = labelElement?.id;
    const touchDevice = useTouchDevice();

    props = {
      // The listbox role accepts only options as children, so the input element
      // must be rendered as a sibling of this element.
      role: touchDevice ? "list" : "listbox",
      "aria-live": "polite",
      "aria-relevant": "all",
      "aria-atomic": true,
      "aria-orientation": orientation,
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
      ...props,
    };

    props = useComposite({ store, ...props });

    return props;
  },
);

/**
 * Renders a listbox element that wraps
 * [`Tag`](https://ariakit.com/reference/tag) components.
 *
 * The [`TagInput`](https://ariakit.com/reference/tag-input) component must be
 * rendered as a sibling of this component. To style them together as a single
 * input field, wrap both in a
 * [`TagControl`](https://ariakit.com/reference/tag-control) component and give
 * this component a `display: contents` style.
 *
 * Because this component is the listbox element, any element rendered between
 * it and the tags can stop assistive technologies from seeing the tags as
 * options of this listbox.
 *
 * Clicking the field to focus the input and the undo and redo keyboard
 * shortcuts are handled by
 * [`TagControl`](https://ariakit.com/reference/tag-control), so render one even
 * when there's no [`TagInput`](https://ariakit.com/reference/tag-input).
 *
 * The [`TagLabel`](https://ariakit.com/reference/tag-label) component can be
 * used to provide an accessible name for the listbox element.
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx {4-15}
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
export const TagList = forwardRef(function TagList(props: TagListProps) {
  const htmlProps = useTagList(props);
  return createElement(TagName, htmlProps);
});

export interface TagListOptions<
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

export type TagListProps<T extends ElementType = TagName> = Props<
  T,
  TagListOptions<T>
>;
