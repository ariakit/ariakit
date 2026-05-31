import {
  createHook,
  createInstance,
  withOptions,
  wrapInstance,
} from "@ariakit/solid-utils";
import type { Options, Props } from "@ariakit/solid-utils";
import type { ValidComponent } from "solid-js";
import { As } from "../as/as.tsx";
import { FocusableContext } from "./focusable-context.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;

/**
 * Returns props to create a `FocusableContainer` component.
 * @see https://solid.ariakit.com/components/focusable
 * @example
 * ```jsx
 * const props = useFocusableContainer();
 * <Role {...props} />
 * ```
 */
export const useFocusableContainer = createHook<
  TagName,
  FocusableContainerOptions
>(
  withOptions(
    { autoFocusOnShow: true },
    function useFocusableContainer(props, options) {
      props = wrapInstance(
        props,
        <As
          component={FocusableContext.Provider}
          value={() => options.autoFocusOnShow}
        />,
      );

      return props;
    },
  ),
);

/**
 * Renders a div that wraps
 * [`Focusable`](https://solid.ariakit.com/reference/focusable) components and
 * controls whether they can be auto-focused.
 * @see https://solid.ariakit.com/components/focusable
 * @example
 * ```jsx
 * <FocusableContainer autoFocusOnShow={false}>
 *   <Focusable autoFocus />
 * </FocusableContainer>
 * ```
 */
export const FocusableContainer = function FocusableContainer(
  props: FocusableContainerProps,
) {
  const htmlProps = useFocusableContainer(props);
  return createInstance(TagName, htmlProps);
};

export interface FocusableContainerOptions<
  _T extends ValidComponent = TagName,
> extends Options {
  /**
   * Determines whether
   * [`Focusable`](https://solid.ariakit.com/reference/focusable) elements inside
   * the container should be automatically focused when the container is shown
   * and they have the
   * [`autoFocus`](https://solid.ariakit.com/reference/focusable#autofocus) prop.
   * @default true
   */
  autoFocusOnShow?: boolean;
}

export type FocusableContainerProps<T extends ValidComponent = TagName> = Props<
  T,
  FocusableContainerOptions<T>
>;
