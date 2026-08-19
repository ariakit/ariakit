import { useStoreState } from "@ariakit/react-store";
import {
  useAttribute,
  useEvent,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  queueBeforeEvent,
  getClosestFocusable,
  invariant,
  isApple,
  UndoManager,
} from "@ariakit/utils";
import type { ElementType, KeyboardEvent, MouseEvent } from "react";
import { TagContextProvider, useTagProviderContext } from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `TagControl` component.
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx
 * const props = useTagControl();
 * <Role.div {...props} />
 * ```
 */
export const useTagControl = createHook<TagName, TagControlOptions>(
  function useTagControl({ store, ...props }) {
    const context = useTagProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TagControl must receive a `store` prop or be wrapped in a TagProvider component.",
    );

    const labelElement = useStoreState(store, "labelElement");
    useAttribute(labelElement, "id");
    const labelId = labelElement?.id;

    const onMouseDownProp = props.onMouseDown;

    // Focus on the input element when clicking on the control.
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

    // The tag list and the tag input are siblings, so the undo/redo shortcuts
    // are handled here, where the events from both of them bubble through.
    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      const pc = !isApple();
      const z = event.key === "z" || event.key === "Z";
      const mod = pc ? event.ctrlKey : event.metaKey;
      const shiftZ = (event.shiftKey && z) || (pc && event.key === "y");
      if (mod && shiftZ) {
        event.preventDefault();
        void UndoManager.redo();
      } else if (mod && z) {
        event.preventDefault();
        void UndoManager.undo();
      }
    });

    // The tag list and the tag input are siblings, so this element is the
    // closest shared ancestor that can pass the store down to both.
    props = useWrapElement(
      props,
      (element) => (
        <TagContextProvider value={store}>{element}</TagContextProvider>
      ),
      [store],
    );

    props = {
      // The tags and the input are separate widgets that look like a single
      // input field, so this element groups them under the same label.
      role: "group",
      "aria-labelledby": props["aria-label"] != null ? undefined : labelId,
      ...props,
      onMouseDown,
      onKeyDown,
    };

    return props;
  },
);

/**
 * Renders a wrapper for the [`TagList`](https://ariakit.com/reference/tag-list)
 * and [`TagInput`](https://ariakit.com/reference/tag-input) components. This
 * component is typically styled as an input field.
 *
 * Clicking on this element focuses the input element, and the undo and redo
 * keyboard shortcuts are handled here, so both the tags and the input are
 * covered by a single element.
 *
 * The tags and the input are separate widgets for assistive technologies, so
 * this component renders a `group` element that keeps them together. The
 * [`TagLabel`](https://ariakit.com/reference/tag-label) component provides its
 * accessible name.
 * @see https://ariakit.com/components/tag
 * @example
 * ```jsx {3-17}
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
export const TagControl = forwardRef(function TagControl(
  props: TagControlProps,
) {
  const htmlProps = useTagControl(props);
  return createElement(TagName, htmlProps);
});

export interface TagControlOptions<
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

export type TagControlProps<T extends ElementType = TagName> = Props<
  T,
  TagControlOptions<T>
>;
