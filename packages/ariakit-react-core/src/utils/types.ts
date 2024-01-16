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
 * The `as` prop.
 * @template P Props
 */
export type As<P = any> = React.ElementType<P>;

/**
 * The `wrapElement` prop.
 */
export type WrapElement = (element: React.ReactElement) => React.ReactElement;

/**
 * Props with the `as` prop.
 * @template T The `as` prop
 * @example
 * type ButtonOptions = Options<"button">;
 */
export type Options<T extends As = any> = {
  /**
   * @deprecated
   * Use the [`render`](https://ariakit.org/guide/composition) prop instead.
   */
  as?: T;
};

/**
 * Props that automatically includes HTML props based on the `as` prop.
 * @template O Options
 * @example
 * type ButtonHTMLProps = HTMLProps<Options<"button">>;
 */
export type HTMLProps<O extends Options> = {
  wrapElement?: WrapElement;
  render?: RenderProp | React.ReactElement;
  [index: `data-${string}`]: unknown;
} & Omit<React.ComponentPropsWithRef<NonNullable<O["as"]>>, keyof O>;

/**
 * Options & HTMLProps
 * @template O Options
 * @example
 * type ButtonProps = Props<Options<"button">>;
 */
export type Props<O extends Options> = O & HTMLProps<O>;

export type Options2 = {
  wrapElement?: WrapElement;
  render?: RenderProp | React.ReactElement;
};

export type HTMLProps2<
  T extends React.ElementType,
  P extends AnyObject = EmptyObject,
> = Omit<React.ComponentPropsWithRef<T>, keyof P> & {
  [index: `data-${string}`]: unknown;
};

export type Props2<
  T extends React.ElementType,
  P extends AnyObject = EmptyObject,
> = P & HTMLProps2<T, P>;

export interface Hook2<
  T extends React.ElementType,
  O extends AnyObject = EmptyObject,
> {
  <ElementType extends React.ElementType = T>(
    props?: Props2<ElementType, O>,
  ): HTMLProps2<ElementType, O>;
}

/**
 * A component that supports the `as` prop and the `children` prop as a
 * function.
 * @template O Options
 * @example
 * type ButtonComponent = Component<Options<"button">>;
 */
export interface Component<O extends Options> {
  <T extends As>(
    props: Props<{ as: T } & Omit<O, "as">>,
  ): React.ReactElement | null;
  (props: Props<O>): React.ReactElement | null;
  displayName?: string;
}

/**
 * A component hook that supports the `as` prop and the `children` prop as a
 * function.
 * @template O Options
 * @example
 * type ButtonHook = Hook<Options<"button">>;
 */
export interface Hook<O extends Options> {
  <T extends As = NonNullable<O["as"]>>(
    props?: Props<Options<T> & Omit<O, "as">>,
  ): HTMLProps<Options<T>>;
  displayName?: string;
}
