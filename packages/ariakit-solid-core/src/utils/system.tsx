import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import type { ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { Role } from "../role/role.tsx";
import type { HTMLProps, Hook, Options, Props } from "./types.ts";

// TODO: implement `wrapElement` prop.
/**
 * Creates a Solid component instance that supports the `render` and
 * `wrapElement` props.
 */
export function createInstance(
  Type: keyof typeof Role,
  props: Props<ValidComponent, Options>,
) {
  return (
    <Dynamic {...props} component={(props.render as ValidComponent) ?? Type} />
  );
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
