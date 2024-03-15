import type { ChangeEvent, ElementType, KeyboardEvent } from "react";
import {
  getTextboxSelection,
  setSelectionRange,
} from "@ariakit/core/utils/dom";
import { focusIntoView } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import { useCompositeItem } from "../composite/composite-item.js";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useBooleanEvent, useEvent, useMergeRefs } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.jsx";
import type { Props } from "../utils/types.js";
import { useTagContext } from "./tag-context.jsx";
import type { TagStore } from "./tag-store.js";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `TagInput` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const store = useTagStore();
 * const props = useTagInput({ store });
 * <Role {...props}>
 *   <Tag>Tag 1</Tag>
 *   <Tag>Tag 2</Tag>
 * </Role>
 * <TagPanel store={store}>Panel 1</TagPanel>
 * <TagPanel store={store}>Panel 2</TagPanel>
 * ```
 */
export const useTagInput = createHook<TagName, TagInputOptions>(
  function useTagInput({
    store,
    setValueOnChange = true,
    tabbable = true,
    delimiter = " ",
    ...props
  }) {
    const context = useTagContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TagInput must receive a `store` prop or be wrapped in a TagProvider component.",
    );

    const value = store.useState("value");

    const onChangeProp = props.onChange;
    const setValueOnChangeProp = useBooleanEvent(setValueOnChange);

    const onChange = useEvent((event: ChangeEvent<HTMLType>) => {
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const currentTarget = event.currentTarget;
      const { value } = currentTarget;
      const { start, end } = getTextboxSelection(currentTarget);
      if (start === value.length && delimiter && value.endsWith(delimiter)) {
        const tagValue = value.slice(0, -delimiter.length).trim();
        if (tagValue) {
          store.addValue(tagValue);
          store.setValue("");
          requestAnimationFrame(() => {
            focusIntoView(currentTarget);
          });
        }
        return;
      }
      if (setValueOnChangeProp(event)) {
        store.setValue(value);
        // See combobox onChange for explanation
        queueMicrotask(() => {
          setSelectionRange(currentTarget, start, end);
        });
      }
    });

    const onKeyDownProp = props.onKeyDown;

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Backspace") {
        const { start, end } = getTextboxSelection(event.currentTarget);
        const isLeadingCaret = start === 0 && end === 0;
        if (!isLeadingCaret) return;
        store.setValues((values) => {
          if (!values.length) return values;
          return values.slice(0, -1);
        });
      }
    });

    props = {
      value,
      ...props,
      ref: useMergeRefs(store.setInputElement, props.ref),
      onKeyDown,
      onChange,
    };

    props = useCompositeItem<TagName>({ store, tabbable, ...props });

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
 *   <TagInput>
 *     <Tag>Tag 1</Tag>
 *     <Tag>Tag 2</Tag>
 *   </TagInput>
 *   <TagPanel>Panel 1</TagPanel>
 *   <TagPanel>Panel 2</TagPanel>
 * </TagProvider>
 * ```
 */
export const TagInput = forwardRef(function TagInput(props: TagInputProps) {
  const htmlProps = useTagInput(props);
  return createElement(TagName, htmlProps);
});

export interface TagInputOptions<T extends ElementType = TagName>
  extends CompositeItemOptions<T> {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
   * provided, the closest
   * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
   * context will be used.
   */
  store?: TagStore;
  /**
   * Whether the tag
   * [`value`](https://ariakit.org/reference/tag-provider#value) state
   * should be updated when the input value changes. This is useful if you want
   * to customize how the store
   * [`value`](https://ariakit.org/reference/tag-provider#value) is updated
   * based on the input element's value.
   * @default true
   */
  setValueOnChange?: BooleanOrCallback<ChangeEvent<HTMLElement>>;
  /**
   * TODO: Docs
   */
  delimiter?: string | null;
  /**
   * @default true
   */
  tabbable?: CompositeItemOptions<T>["tabbable"];
}

export type TagInputProps<T extends ElementType = TagName> = Props<
  T,
  TagInputOptions<T>
>;
