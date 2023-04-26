import { useWrapElement } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { FocusableContext } from "./focusable-context.js";

/**
 * Description for my component hook.
 * @see https://ariakit.org/components/my-component
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
 * Description for my component.
 * @see https://ariakit.org/components/my-component
 * @example
 * ```jsx
 * <FocusableContainer />
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
