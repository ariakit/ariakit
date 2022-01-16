import {
  ComponentPropsWithRef,
  ElementType,
  HTMLAttributes,
  ReactNode,
  RefAttributes,
} from "react";

/**
 * Any object.
 */
export type AnyObject = Record<keyof any, any>;

/**
 * Any function.
 */
export type AnyFunction = (...args: any) => any;

/**
 * Workaround for variance issues.
 * @template T The type of the callback.
 */
export type BivariantCallback<T extends AnyFunction> = {
  bivarianceHack(...args: Parameters<T>): ReturnType<T>;
}["bivarianceHack"];

/**
 * @template T The state type.
 */
export type SetStateAction<T> = T | BivariantCallback<(prevState: T) => T>;

/**
 * The type of the `setState` function in `[state, setState] = useState()`.
 * @template T The type of the state.
 */
export type SetState<T> = BivariantCallback<(value: SetStateAction<T>) => void>;

/**
 * A boolean value or a callback that returns a boolean value.
 * @template T The type of the callback parameter. By default, the function will
 * have no parameter.
 */
export type BooleanOrCallback<T = never> =
  | boolean
  | (T extends never ? () => boolean : (arg: T) => boolean);

/**
 * A string that will provide autocomplete for specific strings.
 * @template T The specific strings.
 */
export type StringWithValue<T extends string> =
  | T
  | (string & { [key in symbol]: never });

/**
 * Render prop type.
 * @template P Props
 * @example
 * const children: RenderProp = (props) => <div {...props} />;
 */
export type RenderProp<P = AnyObject> = (props: P) => JSX.Element | null;

/**
 * The `as` prop.
 * @template P Props
 */
export type As<P = any> = ElementType<P>;

/**
 * The `wrapElement` prop.
 */
export type WrapElement = (element: JSX.Element | null) => JSX.Element | null;

/**
 * The `children` prop that supports a function.
 * @template T Element type.
 */
export type Children<T = any> =
  | ReactNode
  | RenderProp<HTMLAttributes<T> & RefAttributes<T>>;

/**
 * Props with the `as` prop.
 * @template T The `as` prop
 * @example
 * type ButtonOptions = Options<"button">;
 */
export type Options<T extends As = any> = { as?: T };

/**
 * Props that automatically includes HTML props based on the `as` prop.
 * @template O Options
 * @example
 * type ButtonHTMLProps = HTMLProps<Options<"button">>;
 */
export type HTMLProps<O extends Options> = {
  wrapElement?: WrapElement;
  children?: Children;
  [index: `data-${string}`]: unknown;
} & Omit<ComponentPropsWithRef<NonNullable<O["as"]>>, keyof O>;

/**
 * Options & HTMLProps
 * @template O Options
 * @example
 * type ButtonProps = Props<Options<"button">>;
 */
export type Props<O extends Options> = O & HTMLProps<O>;

/**
 * A component that supports the `as` prop and the `children` prop as a
 * function.
 * @template O Options
 * @example
 * type ButtonComponent = Component<Options<"button">>;
 */
export type Component<O extends Options> = {
  <T extends As>(
    props: Omit<O, "as"> &
      Omit<HTMLProps<Options<T>>, keyof O> &
      Required<Options<T>>
  ): JSX.Element | null;
  (props: Props<O>): JSX.Element | null;
  displayName?: string;
};

/**
 * A component hook that supports the `as` prop and the `children` prop as a
 * function.
 * @template O Options
 * @example
 * type ButtonHook = Hook<Options<"button">>;
 */
export type Hook<O extends Options> = {
  <T extends As = NonNullable<O["as"]>>(
    props?: Omit<O, "as"> & Omit<HTMLProps<Options<T>>, keyof O> & Options<T>
  ): HTMLProps<Options<T>>;
  displayName?: string;
};
