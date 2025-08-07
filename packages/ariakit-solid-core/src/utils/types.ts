import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import type {
  Component,
  ComponentProps,
  JSX,
  ParentProps,
  ValidComponent,
} from "solid-js";

/**
 * A value that can be rendered when passed to the `render` prop or the
 * `wrapInstance` prop.
 */
export type RenderValue<P extends AnyObject> = JSX.Element | Component<P>;

/**
 * A value passed to the `wrapInstance` prop.
 */
export type WrapInstanceValue = RenderValue<ParentProps>;

/**
 * The `wrapInstance` prop.
 */
export type WrapInstance = Array<WrapInstanceValue>;

/**
 * Custom props including the `render` prop.
 */
export interface Options {
  wrapInstance?: WrapInstance;
  /**
   * Allows the component to be rendered as a different HTML element or Solid
   * component. The value can be an `As` component instance or a function that
   * takes in the original component props and gives back a Solid component
   * instance with the props merged.
   *
   * Check out the [Composition](https://solid.ariakit.org/guide/composition) guide
   * for more details.
   */
  render?: RenderValue<JSX.HTMLAttributes<any>>;
}

/**
 * HTML props based on the element type, excluding custom props.
 * @template T The element type.
 * @template P Custom props.
 * @example
 * type ButtonHTMLProps = HTMLProps<"button", { custom?: boolean }>;
 */
export type HTMLProps<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
> = Omit<ComponentProps<T>, keyof P> & {
  [index: `data-${string}`]: unknown;
};

/**
 * Props based on the element type, including custom props.
 * @template T The element type.
 * @template P Custom props.
 */
export type Props<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
> = P & HTMLProps<T, P>;

/**
 * A component hook that supports the `render` prop and returns HTML props based
 * on the element type.
 * @template T The element type.
 * @template P Custom props.
 * @example
 * type UseButton = Hook<"button", { custom?: boolean }>;
 */
export type Hook<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
> = <ElementType extends ValidComponent = T>(
  props?: Props<ElementType, P>,
) => HTMLProps<ElementType, P>;
