import * as React from "react";

/**
 * @template T Object
 * @template K Union of T keys
 */
export type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

/**
 * Render prop type
 * @template P Render prop props
 * @template T Render
 */
export type RenderProp<P = {}> = (props: P) => React.ReactElement<any>;

export type As<P = any> = React.ReactType<P>;

export type PropsWithRef<P, T = any> = P & React.RefAttributes<T>;

export type HTMLAtttributesWithRef<T = any> = PropsWithRef<
  React.HTMLAttributes<T>,
  T
>;

// hmm not using
export type StringToElement<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T] extends React.DetailedHTMLProps<
      React.HTMLAttributes<infer E>,
      infer E
    >
    ? E
    : never
  : T;

export type PropsWithLol<P> = Pick<
  HTMLAtttributesWithRef,
  Extract<keyof HTMLAtttributesWithRef, keyof P>
>;

export type ComponentPropsWithoutAs<T extends As> = Omit<
  React.ComponentPropsWithRef<T>,
  "as"
>;

/**
 * Generic component props
 * @template P Additional props
 * @template T React component or string element
 */
export type ComponentPropsWithAs<T extends As> = {
  as?: T;
  children?: React.ReactNode | RenderProp<PropsWithLol<any>>;
} & ComponentPropsWithoutAs<T>;

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
 * Same as Pick, but with value types instead of key
 * @template T Object
 * @template V Value
 */
export type PickByValue<T, V> = Pick<
  T,
  { [K in keyof T]: T[K] extends V ? K : never }[keyof T]
>;
