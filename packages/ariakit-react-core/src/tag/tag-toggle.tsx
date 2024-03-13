import type { ElementType, MouseEvent } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import { useBooleanEvent, useEvent } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import { useTagContext } from "./tag-context.js";
import type { TagStore } from "./tag-store.js";

const TagName = "button" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props to create a `TagToggle` component.
 * @see https://ariakit.org/components/tag
 * @example
 * ```jsx
 * const store = useTagStore();
 * const props = useTagToggle({ store });
 * <Role {...props}>
 *   <Tag>Tag 1</Tag>
 *   <Tag>Tag 2</Tag>
 * </Role>
 * <TagPanel store={store}>Panel 1</TagPanel>
 * <TagPanel store={store}>Panel 2</TagPanel>
 * ```
 */
export const useTagToggle = createHook<TagName, TagToggleOptions>(
  function useTagToggle({ store, value, toggleOnClick = true, ...props }) {
    const context = useTagContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TagToggle must receive a `store` prop or be wrapped in a TagProvider component.",
    );

    const onClickProp = props.onClick;
    const toggleOnClickProp = useBooleanEvent(toggleOnClick);

    const onClick = useEvent((event: MouseEvent<HTMLType>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      if (!toggleOnClickProp(event)) return;
      store.toggleValue(value);
    });

    props = {
      ...props,
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
 *   <TagToggle>
 *     <Tag>Tag 1</Tag>
 *     <Tag>Tag 2</Tag>
 *   </TagToggle>
 *   <TagPanel>Panel 1</TagPanel>
 *   <TagPanel>Panel 2</TagPanel>
 * </TagProvider>
 * ```
 */
export const TagToggle = forwardRef(function TagToggle(props: TagToggleProps) {
  const htmlProps = useTagToggle(props);
  return createElement(TagName, htmlProps);
});

export interface TagToggleOptions<_T extends ElementType = TagName>
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
  value: string;
  /**
   * TODO: Docs
   */
  toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLType>>;
}

export type TagToggleProps<T extends ElementType = TagName> = Props<
  T,
  TagToggleOptions<T>
>;
