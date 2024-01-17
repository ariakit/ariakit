import type { ElementType } from "react";
import { useWrapElement } from "../utils/hooks.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Options, Props } from "../utils/types.js";
import { FocusableContext } from "./focusable-context.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `FocusableContainer` component.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * const props = useFocusableContainer();
 * <Role {...props} />
 * ```
 */
export const useFocusableContainer = createHook<
  TagName,
  FocusableContainerOptions
>(function useFocusableContainer({ autoFocusOnShow = true, ...props }) {
  props = useWrapElement(
    props,
    (element) => (
      <FocusableContext.Provider value={autoFocusOnShow}>
        {element}
      </FocusableContext.Provider>
    ),
    [autoFocusOnShow],
  );

  return props;
});

/**
 * Renders a div that wraps
 * [`Focusable`](https://ariakit.org/reference/focusable) components and
 * controls whether they can be auto-focused.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * <FocusableContainer autoFocusOnShow={false}>
 *   <Focusable autoFocus />
 * </FocusableContainer>
 * ```
 */
export const FocusableContainer = forwardRef(function FocusableContainer(
  props: FocusableContainerProps,
) {
  const htmlProps = useFocusableContainer(props);
  return createElement(TagName, htmlProps);
});

export interface FocusableContainerOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Determines whether [`Focusable`](https://ariakit.org/reference/focusable)
   * elements inside the container should be automatically focused when the
   * container is shown and they have the
   * [`autoFocus`](https://ariakit.org/reference/focusable#autofocus) prop.
   * @default true
   */
  autoFocusOnShow?: boolean;
}

export type FocusableContainerProps<T extends ElementType = TagName> = Props<
  T,
  FocusableContainerOptions<T>
>;
