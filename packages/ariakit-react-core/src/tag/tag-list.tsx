import type { ElementType, MouseEvent } from "react";
import { queueBeforeEvent } from "@ariakit/core/utils/events";
import { isFocusable } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { CompositeOptions } from "../composite/composite.js";
import { useComposite } from "../composite/composite.js";
import { useEvent, useWrapElement } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import {
  TagScopedContextProvider,
  useTagProviderContext,
} from "./tag-context.js";
import type { TagStore } from "./tag-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `TagList` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const store = useTagStore();
 * const props = useTagList({ store });
 * <Role {...props}>
 *   <Tag>Tag 1</Tag>
 *   <Tag>Tag 2</Tag>
 * </Role>
 * <TagPanel store={store}>Panel 1</TagPanel>
 * <TagPanel store={store}>Panel 2</TagPanel>
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

    const onMouseDownProp = props.onMouseDown;

    const onMouseDown = useEvent((event: MouseEvent<HTMLType>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      if (target && isFocusable(target)) return;
      const { inputElement } = store.getState();
      queueBeforeEvent(event.currentTarget, "mouseup", () =>
        inputElement?.focus(),
      );
    });

    props = useWrapElement(
      props,
      (element) => (
        <TagScopedContextProvider value={store}>
          {element}
        </TagScopedContextProvider>
      ),
      [store],
    );

    const orientation = store.useState((state) =>
      state.orientation === "both" ? undefined : state.orientation,
    );

    const items = store.useState((state) => state.renderedItems);
    const itemIds = items.filter((item) => !!item.value).map((item) => item.id);

    const children = (
      <>
        <div
          role="listbox"
          aria-orientation={orientation}
          aria-owns={itemIds.join(" ")}
          style={{ position: "fixed" }}
        />
        {props.children}
      </>
    );

    props = {
      ...props,
      children,
      onMouseDown,
    };

    props = useComposite({ store, ...props });

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
 *   <TagList>
 *     <Tag>Tag 1</Tag>
 *     <Tag>Tag 2</Tag>
 *   </TagList>
 *   <TagPanel>Panel 1</TagPanel>
 *   <TagPanel>Panel 2</TagPanel>
 * </TagProvider>
 * ```
 */
export const TagList = forwardRef(function TagList(props: TagListProps) {
  const htmlProps = useTagList(props);
  return createElement(TagName, htmlProps);
});

export interface TagListOptions<T extends ElementType = TagName>
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

export type TagListProps<T extends ElementType = TagName> = Props<
  T,
  TagListOptions<T>
>;
