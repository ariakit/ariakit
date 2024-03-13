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
 * const store = useTagStore();
 * const props = useTag({ store });
 * <TagList store={store}>
 *   <Role {...props}>Tag 1</Role>
 * </TagList>
 * <TagPanel store={store}>Panel 1</TagPanel>
 * ```
 */
export const useTag = createHook<TagName, TagOptions>(function useTag({
  store,
  value,
  removeOnKeyPress = true,
  getItem: getItemProp,
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
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {3,4}
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
   * TODO: Docs
   */
  value: string;
  /**
   * TODO: Docs
   */
  removeOnKeyPress?: BooleanOrCallback<KeyboardEvent<HTMLType>>;
}

export type TagProps<T extends ElementType = TagName> = Props<T, TagOptions<T>>;
