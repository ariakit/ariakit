import { queueBeforeEvent } from "@ariakit/core/utils/events";
import { getClosestFocusable } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import { isApple } from "@ariakit/core/utils/platform";
import { UndoManager } from "@ariakit/core/utils/undo";
import type { ElementType, KeyboardEvent, MouseEvent } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import { useEvent, useWrapElement } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import {
  TagScopedContextProvider,
  useTagProviderContext,
} from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";
import { useTouchDevice } from "./utils.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `TagList` component.
 * @see https://ariakit.org/components/tag
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

    const onMouseDownProp = props.onMouseDown;

    // Focus on the input element when clicking on the tag list.
    const onMouseDown = useEvent((event: MouseEvent<HTMLType>) => {
      onMouseDownProp?.(event);
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement;
      const currentTarget = event.currentTarget;
      const focusableTarget = getClosestFocusable(target);
      const isSelfFocusable = focusableTarget === currentTarget;
      // If the user clicked on an element that's already focusable, don't focus
      // the input element.
      if (!isSelfFocusable && currentTarget.contains(focusableTarget)) return;
      const { inputElement } = store.getState();
      // We can't immediately focus on mousedown, otherwise the input element
      // will lose focus to the body as an effect of the mousedown event.
      queueBeforeEvent(event.currentTarget, "mouseup", () => {
        inputElement?.focus();
      });
    });

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      const pc = !isApple();
      const z = event.key === "z" || event.key === "Z";
      const mod = pc ? event.ctrlKey : event.metaKey;
      const shiftZ = (event.shiftKey && z) || (pc && event.key === "y");
      if (mod && shiftZ) {
        event.preventDefault();
        UndoManager.redo();
      } else if (mod && z) {
        event.preventDefault();
        UndoManager.undo();
      }
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

    props = {
      ...props,
      onMouseDown,
      onKeyDown,
    };

    props = useComposite({ store, ...props });

    const orientation = store.useState((state) =>
      state.orientation === "both" ? undefined : state.orientation,
    );
    const items = store.useState((state) => state.renderedItems);
    const itemIds = items.filter((item) => !!item.value).map((item) => item.id);
    const labelId = store.useState((state) => state.labelElement?.id);

    // Remove aria attributes from tha TagList element and add them to a
    // separate div that will serve as the accessible listbox element.
    const listboxProps: typeof props = {};
    for (const key in props) {
      if (key === "role" || key.startsWith("aria-")) {
        const prop = key as keyof typeof props;
        listboxProps[prop] = props[prop];
        delete props[prop];
      }
    }

    const touchDevice = useTouchDevice();

    // We can't render TagList as a listbox because it may include an input
    // (textbox) for styling purposes (it must be a sibling of the tags). The
    // listbox role accepts only options as children, so we render a separate
    // listbox element using aria-owns to reference the options.
    const children = (
      <>
        <div
          role={touchDevice ? "list" : "listbox"}
          aria-live="polite"
          aria-relevant="all"
          aria-atomic
          aria-labelledby={labelId}
          aria-orientation={orientation}
          aria-owns={itemIds.join(" ")}
          {...listboxProps}
          style={{ position: "fixed" }}
        />
        {props.children}
      </>
    );

    props = {
      ...props,
      children,
    };

    return props;
  },
);

/**
 * Renders a wrapper for [`Tag`](https://ariakit.org/reference/tag) and
 * [`TagInput`](https://ariakit.org/reference/tag-input) components. This
 * component is typically styled as an input field.
 *
 * The [`TagListLabel`](https://ariakit.org/reference/tag-list-label) component
 * can be used to provide an accessible name for the listbox element that owns
 * the tags.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {3-15}
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
