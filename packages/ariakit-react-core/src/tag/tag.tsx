import type { ElementType, KeyboardEvent } from "react";
import { useCallback } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import { useBooleanEvent, useEvent, useWrapElement } from "../utils/hooks.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Props } from "../utils/types.js";
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
  ...props
}) {
  const context = useTagContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "Tag must be wrapped in a TagList component.",
  );

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

  const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
    onKeyDownProp?.(event);
    if (event.defaultPrevented) return;
    const { inputElement } = store.getState();

    const isBackspace = event.key === "Backspace";
    const isRemoveKey = isBackspace || event.key === "Delete";

    if (isRemoveKey && removeOnKeyPressProp(event)) {
      event.preventDefault();
      store.removeValue(value);
      const nextId = isBackspace
        ? store.previous() || store.next()
        : store.next();
      store.move(nextId);
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

  props = {
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
}

export type TagProps<T extends ElementType = TagName> = Props<T, TagOptions<T>>;
