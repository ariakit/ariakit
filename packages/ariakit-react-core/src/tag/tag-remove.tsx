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

    const children = (
      <span style={{ fontFamily: "system-ui, sans-serif", userSelect: "none" }}>
        ⌫
      </span>
    );

    props = {
      children,
      "aria-label": withinTag ? "Backspace" : `Remove ${value}`,
      ...props,
      render: withinTag ? <Role.span render={props.render} /> : props.render,
      onClick,
    };

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
 *   <TagRemove>
 *     <Tag>Tag 1</Tag>
 *     <Tag>Tag 2</Tag>
 *   </TagRemove>
 *   <TagPanel>Panel 1</TagPanel>
 *   <TagPanel>Panel 2</TagPanel>
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
   * TODO: Docs
   */
  value?: string;
  /**
   * TODO: Docs
   */
  removeOnClick?: BooleanOrCallback<MouseEvent<HTMLType>>;
}

export type TagRemoveProps<T extends ElementType = TagName> = Props<
  T,
  TagRemoveOptions<T>
>;
