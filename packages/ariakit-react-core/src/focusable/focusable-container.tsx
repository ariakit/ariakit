import { useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
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
export const useFocusableContainer = createHook<FocusableContainerOptions>(
  ({ autoFocusOnShow = true, ...props }) => {
    props = useWrapElement(
      props,
      (element) => (
        <FocusableContext.Provider value={autoFocusOnShow}>
          {element}
        </FocusableContext.Provider>
      ),
      [autoFocusOnShow]
    );

    return props;
  }
);

/**
 * Renders a div that wraps `Focusable` components and controls whether they
 * can be auto focused.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * <FocusableContainer autoFocusOnShow={false}>
 *   <Focusable autoFocus />
 * </FocusableContainer>
 * ```
 */
export const FocusableContainer = createComponent<FocusableContainerOptions>(
  (props) => {
    const htmlProps = useFocusableContainer(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  FocusableContainer.displayName = "FocusableContainer";
}

export type FocusableContainerOptions<T extends As = "div"> = Options<T> & {
  /**
   * Determines whether focusable elements inside the container should be
   * automatically focused when the container is shown and they have the
   * `autoFocus` prop.
   * @default true
   */
  autoFocusOnShow?: boolean;
};

export type FocusableContainerProps<T extends As = "div"> = Props<
  FocusableContainerOptions<T>
>;
