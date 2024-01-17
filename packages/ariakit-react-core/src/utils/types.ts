import type * as React from "react";
import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";

/**
 * Render prop type.
 * @template P Props
 * @example
 * const children: RenderProp = (props) => <div {...props} />;
 */
export type RenderProp<
  P = React.HTMLAttributes<any> & React.RefAttributes<any>,
> = (props: P) => React.ReactNode;

/**
 * The `wrapElement` prop.
 */
export type WrapElement = (element: React.ReactElement) => React.ReactElement;

/**
 * Custom props including the `render` prop.
 */
export interface Options {
  wrapElement?: WrapElement;
  render?: RenderProp | React.ReactElement;
}

/**
 * HTML props based on the element type, excluding custom props.
 * @template T The element type.
 * @template P Custom props.
 * @example
 * type ButtonHTMLProps = HTMLProps<"button", { custom?: boolean }>;
 */
export type HTMLProps<
  T extends React.ElementType,
  P extends AnyObject = EmptyObject,
> = Omit<React.ComponentPropsWithRef<T>, keyof P> & {
  [index: `data-${string}`]: unknown;
};

/**
 * Props based on the element type, including custom props.
 * @template T The element type.
 * @template P Custom props.
 */
export type Props<
  T extends React.ElementType,
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
export interface Hook<
  T extends React.ElementType,
  P extends AnyObject = EmptyObject,
> {
  <ElementType extends React.ElementType = T>(
    props?: Props<ElementType, P>,
  ): HTMLProps<ElementType, P>;
}
