import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, MouseEvent } from "react";
import { useContext, useEffect } from "react";
import { Role } from "../role/role.tsx";
import { useBooleanEvent, useEvent, useId } from "../utils/hooks.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import {
  TagRemoveIdContext,
  TagValueContext,
  useTagContext,
} from "./tag-context.tsx";
import type { TagStore } from "./tag-store.ts";
import { useTouchDevice } from "./utils.ts";

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

    const id = useId(props.id);
    const setRemoveId = useContext(TagRemoveIdContext);
    const valueFromContext = useContext(TagValueContext);
    const withinTag = valueFromContext !== null;
    const value = valueProp ?? valueFromContext;

    useEffect(() => {
      setRemoveId?.(id);
      return () => setRemoveId?.();
    }, [id, setRemoveId]);

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
      <svg
        display="block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        height="1em"
        width="1em"
        aria-hidden
      >
        <path d="M7.28782 5.46243C7.80963 4.92308 8.07054 4.65341 8.37751 4.46038C8.64963 4.28926 8.94749 4.16299 9.25969 4.0864C9.61186 4 9.98709 4 10.7375 4H16.8C17.9201 4 18.4802 4 18.908 4.21799C19.2843 4.40973 19.5903 4.71569 19.782 5.09202C20 5.51984 20 6.0799 20 7.2V16.8C20 17.9201 20 18.4802 19.782 18.908C19.5903 19.2843 19.2843 19.5903 18.908 19.782C18.4802 20 17.9201 20 16.8 20H10.7512C9.99584 20 9.61818 20 9.264 19.9126C8.95004 19.8351 8.65067 19.7073 8.37748 19.5342C8.06931 19.339 7.80802 19.0663 7.28544 18.521L2.59879 13.63C2.03714 13.0439 1.75631 12.7508 1.65115 12.4158C1.55859 12.121 1.55935 11.8048 1.65332 11.5104C1.7601 11.1759 2.04233 10.8842 2.60679 10.3008L7.28782 5.46243Z" />
        <path d="M10.052 9L16 15M15.948 9L10 15" />
      </svg>
    );

    const touchDevice = useTouchDevice() && withinTag;

    props = {
      id,
      children,
      role: touchDevice ? "button" : undefined,
      "aria-hidden": !touchDevice,
      "aria-label": touchDevice
        ? `Remove ${value}`
        : withinTag
          ? "Press Delete or Backspace to remove"
          : undefined,
      ...props,
      onClick,
      render: withinTag ? <Role.span render={props.render} /> : props.render,
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
