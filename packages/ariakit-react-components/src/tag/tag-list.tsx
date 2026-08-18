import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useEvent,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import {
  queueBeforeEvent,
  getClosestFocusable,
  invariant,
} from "@ariakit/utils";
import type { ElementType, KeyboardEvent, MouseEvent } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import { useComposite } from "../composite/composite.tsx";
import {
  TagScopedContextProvider,
  useTagProviderContext,
} from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";
import { handleUndoRedoShortcut, useTouchDevice } from "./utils.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

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
      handleUndoRedoShortcut(event);
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
      onMouseDown,
      onKeyDown,
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
 * input field, wrap both in a container element and give this component a
 * `display: contents` style.
 *
 * Because this component is the listbox element, any element rendered between
 * it and the tags can stop assistive technologies from seeing the tags as
 * options of this listbox.
 *
 * Clicking this element focuses the input element. This doesn't apply when the
 * element generates no box, such as with a `display: contents` style, so a
 * container element that is styled as an input field should handle this on its
 * own.
 *
 * The [`TagListLabel`](https://ariakit.com/reference/tag-list-label) component
 * can be used to provide an accessible name for the listbox element.
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx {4-15}
 * <TagProvider>
 *   <TagListLabel>Invitees</TagListLabel>
 *   <div className="tag-list">
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
 *   </div>
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
