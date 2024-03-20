import { useRef } from "react";
import type {
  ChangeEvent,
  ClipboardEvent,
  ElementType,
  KeyboardEvent,
} from "react";
import { toArray } from "@ariakit/core/utils/array";
import {
  getTextboxSelection,
  setSelectionRange,
} from "@ariakit/core/utils/dom";
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

const DEFAULT_DELIMITER = ["\n", /[;,]?\s/];

function getDelimiters(
  delimiter: TagInputOptions["delimiter"],
  defaultDelimiter = DEFAULT_DELIMITER,
) {
  const finalDelimiter = delimiter === undefined ? defaultDelimiter : delimiter;
  if (!finalDelimiter) return [];
  return toArray(finalDelimiter);
}

function splitValueByDelimiter(value: string, delimiters: (string | RegExp)[]) {
  for (const delimiter of delimiters) {
    let match = value.match(delimiter);
    // Remove delimiter from the start of the string
    while (match?.index === 0) {
      value = value.slice(match[0].length);
      match = value.match(delimiter);
    }
    if (!match) continue;
    return value.split(delimiter);
  }
  return [];
}

/**
 * Returns props to create a `TagInput` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const store = useTagContext();
 * const props = useTagInput({ store });
 *
 * <Role.input {...props} />
 * ```
 */
export const useTagInput = createHook<TagName, TagInputOptions>(
  function useTagInput({
    store,
    tabbable = true,
    setValueOnChange = true,
    removeOnBackspace = true,
    delimiter,
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
    const pastedTextRef = useRef("");

    const onPasteProp = props.onPaste;

    const onPaste = useEvent((event: ClipboardEvent<HTMLType>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;
      const currentTarget = event.currentTarget;
      const { start, end } = getTextboxSelection(currentTarget);
      const { value } = currentTarget;
      const text = event.clipboardData.getData("text");
      // Append the pasted text to the current value based on the current
      // selection
      const newText = value.slice(0, start) + text + value.slice(end);
      pastedTextRef.current = newText;
      // TODO: We probably need to prevent default here and handle the value
      // separately without appending the text. We should also have a function
      // or reuse the same function that's used on the onChange event.
    });

    const onChangeProp = props.onChange;
    const setValueOnChangeProp = useBooleanEvent(setValueOnChange);

    const onChange = useEvent((event: ChangeEvent<HTMLType>) => {
      const pastedText = pastedTextRef.current;
      pastedTextRef.current = "";
      onChangeProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const currentTarget = event.currentTarget;
      const { start, end } = getTextboxSelection(currentTarget);
      const { value } = currentTarget;
      if (setValueOnChangeProp(event)) {
        store.setValue(value);
        // See combobox onChange for explanation
        queueMicrotask(() => {
          setSelectionRange(currentTarget, start, end);
        });
      }
      const isTrailingCaret = start === end && start === value.length;
      if (isTrailingCaret) {
        const delimiters = getDelimiters(delimiter);
        const text = pastedText || value;
        let values = splitValueByDelimiter(text, delimiters);
        const trailingvalue = pastedText ? "" : values.pop() || "";
        values = values
          .map((value) => value.trim())
          .filter((value) => value !== "");
        // TODO: We need a function with these values, returning a boolean.
        // Consider, for example, that we need to run something before adding
        // values (like creating objects).
        if (values.length) {
          for (const tagValue of values) {
            store.addValue(tagValue);
          }
          store.setValue(trailingvalue);
          event.preventDefault();
        }
      }
    });

    const onKeyDownProp = props.onKeyDown;
    const removeOnBackspaceProp = useBooleanEvent(removeOnBackspace);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Backspace" && removeOnBackspaceProp(event)) {
        const { start, end } = getTextboxSelection(event.currentTarget);
        const isLeadingCaret = start === end && start === 0;
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
      onPaste,
      onChange,
      onKeyDown,
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
  removeOnBackspace?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * TODO: Docs
   */
  delimiter?: string | RegExp | null | (string | RegExp)[];
  /**
   * @default true
   */
  tabbable?: CompositeItemOptions<T>["tabbable"];
}

export type TagInputProps<T extends ElementType = TagName> = Props<
  T,
  TagInputOptions<T>
>;
