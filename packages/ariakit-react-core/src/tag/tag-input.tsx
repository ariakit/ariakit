import { toArray } from "@ariakit/core/utils/array";
import {
  getTextboxSelection,
  setSelectionRange,
} from "@ariakit/core/utils/dom";
import { getInputType } from "@ariakit/core/utils/events";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import { UndoManager } from "@ariakit/core/utils/undo";
import type {
  ChangeEvent,
  ClipboardEvent,
  ElementType,
  KeyboardEvent,
  SyntheticEvent,
} from "react";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import { useCompositeItem } from "../composite/composite-item.tsx";
import { useBooleanEvent, useEvent, useMergeRefs } from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useTagContext } from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

type EventWithValues<T extends SyntheticEvent> = T & {
  values: string[];
};

const DEFAULT_DELIMITER = ["\n", ";", ",", /\s/];

function getDelimiters(
  delimiter: TagInputOptions["delimiter"],
  defaultDelimiter: TagInputOptions["delimiter"] = DEFAULT_DELIMITER,
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
 * const props = useTagInput();
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

    const value = useStoreState(store, "value");

    const onPasteProp = props.onPaste;
    const addValueOnPasteProp = useBooleanEvent(addValueOnPaste);

    const onPaste = useEvent((event: ClipboardEvent<HTMLType>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;
      const text = event.clipboardData.getData("text");
      const delimiters = getDelimiters(delimiter);
      const values = splitValueByDelimiter(text.trim(), delimiters)
        .map((value) => value.trim())
        .filter((value) => value !== "");
      // Create a new event with the values extracted from the clipboard text so
      // that the user can use the values in the event handler.
      const eventWithValues = Object.assign(event, { values });
      if (!addValueOnPasteProp(eventWithValues)) return;
      if (!values.length) return;
      // Prevent pasting the text into the input
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
      const { value: prevValue } = store.getState();
      const inputType = getInputType(event);
      const currentTarget = event.currentTarget;
      const { start, end } = getTextboxSelection(currentTarget);
      const { value } = currentTarget;
      // Set the value in the store if the value changes
      if (setValueOnChangeProp(event)) {
        UndoManager.execute(() => {
          store.setValue(value);
          // When the value is not set synchronously, the selection range may be
          // lost.
          queueMicrotask(() => {
            setSelectionRange(currentTarget, start, end);
          });
          if (value === prevValue) return;
          return () => store.setValue(prevValue);
        }, inputType);
      }
      // Add values to the store if the input value ends with a delimiter
      const isTrailingCaret = start === end && start === value.length;
      if (isTrailingCaret) {
        const delimiters = getDelimiters(delimiter);
        // Split values and get the trailing value that will remain in the input
        let values = splitValueByDelimiter(value, delimiters);
        const trailingvalue = values.pop() || "";
        values = values
          .map((value) => value.trim())
          .filter((value) => value !== "");
        const eventWithValues = Object.assign(event, { values });
        if (values.length && addValueOnChangeProp(eventWithValues)) {
          // We need to prevent the default behavior here in case the tag input
          // component is combined with another component that also listens to the
          // change event and updates the store value, such as Combobox. In this
          // case, the tag input logic should take precedence even if this event
          // handler is called first.
          event.preventDefault();
          for (const tagValue of values) {
            store.addValue(tagValue);
          }
          UndoManager.execute(() => {
            store.setValue(trailingvalue);
            if (trailingvalue === prevValue) return;
            return () => store.setValue(prevValue);
          }, inputType);
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
 * Renders an input element within a
 * [`TagList`](https://ariakit.org/reference/tag-list) component. This component
 * lets users input tag values that are added to the store when the input value
 * changes or when the user pastes text into the input element, based on the
 * [`delimiter`](https://ariakit.org/reference/tag-input#delimiter) prop.
 *
 * This component can be combined with a
 * [`Combobox`](https://ariakit.org/reference/combobox) component using the
 * [`render`](https://ariakit.org/reference/tag-input#render) prop to create a
 * tag input with suggestions.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {14}
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
   * The string or pattern employed to break the input value into multiple tags.
   * This could be a string, a regular expression, an array of strings and
   * regular expressions, or `null` to prevent splitting on input.
   *
   * When an array is given, the input value is split by the first matching
   * delimiter. All other delimiters are disregarded for the same input event.
   * For example, if the delimiters are `["\n", ","]` and the user pastes text
   * containing commas and newlines, the text will be split solely by newlines.
   * The commas will be preserved in the tag values. If you want to split by
   * both commas and newlines, you should use a regular expression that matches
   * both characters (e.g., `/[\n,]/`).
   * @default ["\n", ";", ",", /\s/]
   */
  delimiter?: string | RegExp | null | (string | RegExp)[];
  /**
   * Determines if tag values should be added to the store when the input value
   * is pasted. The values are extracted from the clipboard text and
   * automatically processed with the
   * [`delimiter`](https://ariakit.org/reference/tag-input#delimiter) prop.
   *
   * This can be either a boolean or a callback that receives an event with an
   * extra `values` property and should return a boolean.
   * @default true
   */
  addValueOnPaste?: BooleanOrCallback<
    EventWithValues<ClipboardEvent<HTMLElement>>
  >;
  /**
   * Determines if the tag value should be added to the store when the input
   * value changes. The tag value is automatically processed with the
   * [`delimiter`](https://ariakit.org/reference/tag-input#delimiter) prop.
   *
   * This can be either a boolean or a callback that receives an event with an
   * extra `values` property and should return a boolean.
   * @default true
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
   * Determines whether the last tag value should be removed from the store when
   * the `Backspace` key is pressed and the cursor is at the start of the input
   * value.
   * @default true
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
