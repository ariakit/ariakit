import * as React from "react";
import { StandardProperties } from "csstype";

export type Dictionary<T = any> = { [key: string]: T };

/**
 * @template T Object
 * @template K Union of T keys
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * @template T Object
 * @template K Union of keys (not necessarily present in T)
 */
export type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

/**
 * Transform `"a" | "b"` into `"a" & "b"`
 * @template U Union
 */
export type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends ((k: infer I) => void)
  ? I
  : never;

/**
 * Get component props
 * @template T Component type
 */
export type ComponentToProps<T> = T extends
  | React.ComponentType<infer P>
  | React.Component<infer P>
  ? P
  : never;

/**
 * A single element that can be passed to `as` in
 * `<Foo as={Bar} />`
 * @template P Element props
 */
export type AsElement<P = {}> =
  | keyof JSX.IntrinsicElements
  | React.ComponentType<P>;

/**
 * Remove `as` key from object `T` if it's present
 * @template T Object
 */
export type WithoutAsProp<T> = Without<T, "as">;

/**
 * Grab elements passed to the `as` prop and return their props without `as`
 * @template T Component type
 */
export type InheritedAsProps<T> = WithoutAsProp<
  UnionToIntersection<ComponentToProps<T>>
>;

/**
 * Props of a component enhanced with `as()`
 * @template T The type of the `as` prop
 */
export type AsProps<T extends AsElement> = {
  as?: T | T[];
  nextAs?: T | T[];
  elementRef?: React.Ref<any>;
} & InheritedAsProps<T> &
  StandardProperties<string | number> &
  Omit<React.HTMLProps<any>, "as">;

/**
 * Component enhanced with `as()`
 * @template T Elements passed to `as(Elements)`
 * @template P Props of the component passed to `as(Elements)(Component)`
 */
export interface AsComponent<T extends AsElement, P> {
  <TT extends AsElement>(
    props: WithoutAsProp<P> & InheritedAsProps<T> & AsProps<TT>
  ): JSX.Element;

  displayName: string;

  as: <TT extends AsElement>(
    otherComponents: TT | TT[]
  ) => AsComponent<T & TT, ComponentToProps<AsComponent<T & TT, P>>>;

  asComponents: T | T[];
}
