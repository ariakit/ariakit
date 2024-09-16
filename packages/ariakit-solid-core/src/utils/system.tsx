import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import { type ValidComponent, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { HTMLProps, Hook, Options, Props } from "./types.ts";

/**
 * Creates a Solid component instance that supports the `render` and
 * `wrapElement` props.
 */
export function createInstance(
  Component: ValidComponent,
  props: Props<ValidComponent, Options>,
) {
  const [features, rest] = splitProps(props, ["render", "wrapElement"]);
  const withRender = () => (
    // TODO: replace with LazyDynamic
    <Dynamic
      {...rest}
      component={(features.render as ValidComponent) ?? Component}
    />
  );
  let tree = withRender;
  if (features.wrapElement) {
    for (const element of features.wrapElement) {
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
>(useProps: (props: Props<T, P>) => HTMLProps<T, P>) {
  return useProps as Hook<T, P>;
}
