import { useWrapElement } from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { FocusableContext } from "./focusable-context.js";

/**
 * Returns props to create a `FocusableContainer` component.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * const props = useFocusableContainer();
 * <Role {...props} />
 * ```
 */
export const useFocusableContainer =
  createHook2<TagNameFocusableContainerOptions>(
    ({ autoFocusOnShow = true, ...props }) => {
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
    },
  );

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

export type FocusableContainerOptions<T extends ElementType = TagName> =
  Options<T> & {
    /**
     * Determines whether [`Focusable`](https://ariakit.org/reference/focusable)
     * elements inside the container should be automatically focused when the
     * container is shown and they have the
     * [`autoFocus`](https://ariakit.org/reference/focusable#autofocus) prop.
     * @default true
     */
    autoFocusOnShow?: boolean;
  };

export type FocusableContainerProps<T extends ElementType = TagName> = Props<
  FocusableContainerOptions<T>
>;
