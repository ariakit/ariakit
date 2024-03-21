import { useContext } from "react";
import type { ElementType, MouseEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import { Role } from "../role/role.js";
import { useBooleanEvent, useEvent } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.jsx";
import type { Options, Props } from "../utils/types.js";
import { TagValueContext, useTagContext } from "./tag-context.jsx";
import type { TagStore } from "./tag-store.js";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

const icon = (
  <span
    aria-hidden
    style={{ fontFamily: "system-ui, sans-serif", userSelect: "none" }}
  >
    ⌫
  </span>
);

/**
 * Returns props to create a `TagRemove` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const props = useTagRemove();
 * <Role.button {...props} />
 * ```
 */
export const useTagRemove = createHook<TagName, TagRemoveOptions>(
  function useTagRemove({
    store,
    value: valueProp,
    removeOnClick = true,
    ...props
  }) {
    const context = useTagContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TagRemove must receive a `store` prop or be wrapped in a TagProvider component.",
    );

    const valueFromContext = useContext(TagValueContext);
    const withinTag = valueFromContext !== null;
    const value = valueProp ?? valueFromContext;

    const onClickProp = props.onClick;
    const removeOnClickProp = useBooleanEvent(removeOnClick);

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      if (!value) return;
      if (!removeOnClickProp(event)) return;
      const { inputElement } = store.getState();
      store.removeValue(value);
      inputElement?.focus();
    });

    props = {
      children: icon,
      ...props,
      render: withinTag ? <Role.span render={props.render} /> : props.render,
      onClick,
    };

    return props;
  },
);

/**
 * Renders a `Backspace` icon inside a
 * [`Tag`](https://ariakit.org/reference/tag) component that removes the tag
 * when clicked with a mouse.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx {9}
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
export const TagRemove = forwardRef(function TagRemove(props: TagRemoveProps) {
  const htmlProps = useTagRemove(props);
  return createElement(TagName, htmlProps);
});

export interface TagRemoveOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`useTagStore`](https://ariakit.org/reference/use-tag-store) hook. If not
   * provided, the closest
   * [`TagProvider`](https://ariakit.org/reference/tag-provider) component's
   * context will be used.
   */
  store?: TagStore;
  /**
   * The value of the tag to remove. If not provided, the value will be inferred
   * from the parent [`Tag`](https://ariakit.org/reference/tag) component.
   */
  value?: string;
  /**
   * Determines if the tag should be removed when clicked with a mouse. If a
   * function is provided, it will be called with the click event and should
   * return a boolean.
   * @default true
   */
  removeOnClick?: BooleanOrCallback<MouseEvent<HTMLType>>;
}

export type TagRemoveProps<T extends ElementType = TagName> = Props<
  T,
  TagRemoveOptions<T>
>;
