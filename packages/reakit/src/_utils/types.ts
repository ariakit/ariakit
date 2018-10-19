import * as React from "react";

export type Dictionary<T = any> = { [key: string]: T };

/**
 * @template T Object
 * @template K Union of T keys
 */
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

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
