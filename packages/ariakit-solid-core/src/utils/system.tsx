import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import { type ValidComponent, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { type PropsSink, withPropsSink } from "./props.ts";
import type { HTMLProps, Hook, Options, Props } from "./types.ts";

/**
 * Creates a Solid component instance that supports the `render` and
 * `wrapInstance` props.
 */
export function createInstance(
  Component: ValidComponent,
  props: Props<ValidComponent, Options>,
) {
  // TODO: consider adding a dev-only runtime check to clarify that
  // the JSX.Element type is only accepted through `As`, so that
  // the error is not a vague "value is not a function" error.
  const [features, rest] = splitProps(props, ["render", "wrapInstance"]);
  const withRender = () => (
    // TODO: replace with LazyDynamic
    <Dynamic
      {...rest}
      component={(features.render as ValidComponent) ?? Component}
    />
  );
  let tree = withRender;
  if (features.wrapInstance) {
    for (const element of features.wrapInstance) {
      const children = tree;
      tree = () => (
        // TODO: replace with LazyDynamic
        <Dynamic component={element as ValidComponent}>{children()}</Dynamic>
      );
    }
  }
  return tree();
}

/**
 * Creates a component hook that accepts props and returns props so they can be
 * passed to a Solid component.
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
