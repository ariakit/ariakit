import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import type { ComponentProps, JSX, ValidComponent } from "solid-js";

/**
 * The `wrapElement` prop.
 */
export type WrapElement = Array<JSX.Element>;

/**
 * Custom props including the `render` prop.
 */
export interface Options {
  wrapElement?: WrapElement;
  /**
   * Allows the component to be rendered as a different HTML element or Solid
   * component. The value can be an `As` component instance or a function that
   * takes in the original component props and gives back a Solid component
   * instance with the props merged.
   *
   * Check out the [Composition](https://solid.ariakit.org/guide/composition) guide
   * for more details.
   */
  render?: JSX.Element; // TODO: function support
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
