import type { ElementType, KeyboardEvent } from "react";
import { useCallback } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import {
  useBooleanEvent,
  useEvent,
  useId,
  useWrapElement,
} from "../utils/hooks.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.js";
import type { VisuallyHiddenOptions } from "../visually-hidden/visually-hidden.js";
import { TagValueContext, useTagContext } from "./tag-context.jsx";
import type { TagStore } from "./tag-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `Tag` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTag();
 * <Role.div {...props} />
 * ```
 */
export const useTag = createHook<TagName, TagOptions>(function useTag({
  store,
  value,
  getItem: getItemProp,
  removeOnKeyPress = true,
  hiddenRemove = true,
  ...props
}) {
  const context = useTagContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "Tag must be wrapped in a TagList component.",
  );

  const id = useId(props.id);

  const getItem = useCallback<NonNullable<CompositeItemOptions["getItem"]>>(
    (item) => {
      const nextItem = { ...item, value };
      if (getItemProp) {
        return getItemProp(nextItem);
      }
      return nextItem;
    },
    [value, getItemProp],
  );

  const onKeyDownProp = props.onKeyDown;
  const removeOnKeyPressProp = useBooleanEvent(removeOnKeyPress);

  const removeValue = useEvent((moveToPrevious = false) => {
    store.removeValue(value);
    const nextId = moveToPrevious
      ? store.previous() || store.next()
      : store.next();
    store.move(nextId);
  });

  const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
    onKeyDownProp?.(event);
    if (event.defaultPrevented) return;
    const { inputElement } = store.getState();

    const isBackspace = event.key === "Backspace";
    const isRemoveKey = isBackspace || event.key === "Delete";

    if (isRemoveKey && removeOnKeyPressProp(event)) {
      event.preventDefault();
      removeValue(isBackspace);
    }

    const isPrintableKey =
      !event.ctrlKey && !event.metaKey && event.key.length === 1;

    if (isPrintableKey) {
      inputElement?.focus();
    }
  });

  props = useWrapElement(
    props,
    (element) => (
      <TagValueContext.Provider value={value}>
        {element}
      </TagValueContext.Provider>
    ),
    [value],
  );

  const removeId = useId();

  // Screen readers don't focus on elements within an option role, and mobile
  // screen reader users can't hit Backspace while focused on the option. Thus,
  // we include a visually hidden button with a button role adjacent to the
  // option. Even if it's not focusable, the button role enables screen readers
  // to move the virtual cursor and interact with it.
  props = useWrapElement(
    props,
    (element) => {
      if (!hiddenRemove) return element;
      const render =
        typeof hiddenRemove !== "boolean" ? hiddenRemove : <button />;
      return (
        <>
          {element}
          <VisuallyHidden
            id={removeId}
            tabIndex={-1}
            aria-labelledby={`${removeId} ${id}`}
            render={render}
            onClick={() => removeValue()}
          >
            Remove
          </VisuallyHidden>
        </>
      );
    },
    [removeId, hiddenRemove, removeValue],
  );

  props = {
    id,
    role: "option",
    children: value,
    ...props,
  };

  props = useCompositeItem<TagName>({
    store,
    ...props,
    getItem,
    onKeyDown,
  });

  return props;
});

/**
 * Renders a tag element inside a
 * [`TagList`](https://ariakit.org/reference/tag-list) wrapper.
 *
 * The user can remove the tag by pressing `Backspace` or `Delete` keys when the
 * tag is focused. The
 * [`removeOnKeyPress`](https://ariakit.org/reference/tag#removeonkeypress) prop
 * can be used to disable this behavior.
 *
 * When a printable key is pressed, the focus is automatically moved to the
 * input element.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {7-10}
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
export const Tag = memo(
  forwardRef(function Tag(props: TagProps) {
    const htmlProps = useTag(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface TagOptions<T extends ElementType = TagName>
  extends CompositeItemOptions<T> {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
   * provided, the closest [`TagList`](https://ariakit.org/reference/tag-list)
   * component's context will be used.
   */
  store?: TagStore;
  /**
   * The unique value of the tag. This is automatically rendered as the tag's
   * content if no children are provided.
   */
  value: string;
  /**
   * Defines the behavior of the `Backspace` and `Delete` keys when the tag is
   * focused. If `true`, the tag is removed. If it's a function, it's invoked
   * with the key event and should return a boolean.
   * @default true
   */
  removeOnKeyPress?: BooleanOrCallback<KeyboardEvent<HTMLType>>;
  /**
   * By default, a visually hidden remove button is rendered next to the tag
   * for mobile screen reader accessibility, where users can't press `Backspace`
   * while focusing on tags. If set to `false`, this element won't be rendered.
   *
   * The accessible label of the remove element is a combination of its own
   * content, which defaults to the English word "Remove", and the tag's
   * content. You can customize this by passing an element with a different
   * content or `aria-label` attribute. When using `aria-label`, you should
   * manually include the tag's content for context.
   * @default true
   * @example
   * You can pass an element with a different content to customize the "Remove"
   * label:
   * ```jsx
   * // Delete element's label: "Eliminar Manzana"
   * <Tag value="Manzana" hiddenRemove={<button>Eliminar</button>} />
   * ```
   * @example
   * You can pass a custom `aria-label` attribute to override the entire label.
   * For example, for languages where the verb doesn't come before the noun:
   * ```jsx
   * // Delete element's label: "사과 삭제"
   * <Tag value="사과" hiddenRemove={<button aria-label="사과 삭제" />} />
   * ```
   */
  hiddenRemove?: boolean | VisuallyHiddenOptions["render"];
}

export type TagProps<T extends ElementType = TagName> = Props<T, TagOptions<T>>;
