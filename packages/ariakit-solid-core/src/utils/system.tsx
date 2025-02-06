import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import { type Component, type ValidComponent, createComponent } from "solid-js";
import { As } from "./__as.tsx";
import { type PropsSink, withPropsSink } from "./__props.ts";
import type { HTMLProps, Hook, Options, Props } from "./types.ts";

/**
 * **This is an Ariakit Solid stub.** Original docs below.
 *
 * The same as `React.forwardRef` but passes the `ref` as a prop and returns a
 * component with the same generic type.
 */
export function forwardRef<T extends Component<any>>(component: T) {
  return component;
}

/**
 * Creates a Solid component instance that supports the `render` and
 * `wrapInstance` props.
 */
export function createElement(
  Component: ValidComponent,
  props: Props<ValidComponent, Options>,
) {
  let tree = () => {
    const resolvedComponent = (props.render ?? Component) as ValidComponent;
    let component = resolvedComponent as Component;
    if (typeof resolvedComponent === "string")
      component = (As[resolvedComponent] as any)({}) as Component;
    else if (typeof resolvedComponent !== "function")
      throw new Error("Invalid render prop value");
    // TODO: should this be untracked?
    return component(props);
  };
  // TODO: should this be reactive?
  if (props.wrapInstance) {
    for (const wrapper of props.wrapInstance) {
      const children = tree;
      tree = () =>
        createComponent(wrapper as Component, {
          get children() {
            return children();
          },
        });
    }
  }
  return tree();
}

/**
 * **This is an Ariakit Solid stub.** Original docs below.
 *
 * Creates a component hook that accepts props and returns props so they can be
 * passed to a React element.
 */
export function createHook<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
>(useProps: (props: PropsSink<Props<T, P>>) => HTMLProps<T, P>) {
  const useRole = (props: Props<T, P> = {} as Props<T, P>) => {
    return withPropsSink(props, useProps);
  };
  return useRole as Hook<T, P>;
}
