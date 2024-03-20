import type {
  ChangeEvent,
  ClipboardEvent,
  ElementType,
  KeyboardEvent,
  SyntheticEvent,
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

type EventWithValues<T extends SyntheticEvent> = T & {
  values: string[];
};

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
    delimiter,
    addValueOnPaste = true,
    addValueOnChange = true,
    setValueOnChange = true,
    removeOnBackspace = true,
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

    const onPasteProp = props.onPaste;
    const addValueOnPasteProp = useBooleanEvent(addValueOnPaste);

    const onPaste = useEvent((event: ClipboardEvent<HTMLType>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;
      const text = event.clipboardData.getData("text");
      const delimiters = getDelimiters(delimiter);
      const values = splitValueByDelimiter(text, delimiters)
        .map((value) => value.trim())
        .filter((value) => value !== "");
      const eventWithValues = Object.assign(event, { values });
      if (!addValueOnPasteProp(eventWithValues)) return;
      if (!values.length) return;
      // TODO: Comment
      event.preventDefault();
      for (const tagValue of values) {
        store.addValue(tagValue);
      }
    });

    const onChangeProp = props.onChange;
    const setValueOnChangeProp = useBooleanEvent(setValueOnChange);
    const addValueOnChangeProp = useBooleanEvent(addValueOnChange);

    const onChange = useEvent((event: ChangeEvent<HTMLType>) => {
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
        let values = splitValueByDelimiter(value, delimiters);
        const trailingvalue = values.pop() || "";
        values = values
          .map((value) => value.trim())
          .filter((value) => value !== "");
        const eventWithValues = Object.assign(event, { values });
        if (values.length && addValueOnChangeProp(eventWithValues)) {
          // TODO: Comment about <TagInput render={<Combobox />} />
          event.preventDefault();
          for (const tagValue of values) {
            store.addValue(tagValue);
          }
          store.setValue(trailingvalue);
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
   * TODO: Docs
   * @default
   * ["\n", /[;,]?\s/]
   */
  delimiter?: string | RegExp | null | (string | RegExp)[];
  /**
   * TODO: Docs
   */
  addValueOnPaste?: BooleanOrCallback<
    EventWithValues<ClipboardEvent<HTMLElement>>
  >;
  /**
   * TODO: Docs
   */
  addValueOnChange?: BooleanOrCallback<
    EventWithValues<ChangeEvent<HTMLElement>>
  >;
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
   * @default true
   */
  tabbable?: CompositeItemOptions<T>["tabbable"];
}

export type TagInputProps<T extends ElementType = TagName> = Props<
  T,
  TagInputOptions<T>
>;
