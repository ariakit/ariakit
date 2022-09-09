import { ComponentPropsWithRef, ElementType, HTMLAttributes, ReactElement, ReactNode, RefAttributes } from "react";
import type { AnyObject } from "ariakit-utils/types";
/**
 * Render prop type.
 * @template P Props
 * @example
 * const children: RenderProp = (props) => <div {...props} />;
 */
export declare type RenderProp<P = AnyObject> = (props: P) => ReactNode;
/**
 * The `as` prop.
 * @template P Props
 */
export declare type As<P = any> = ElementType<P>;
/**
 * The `wrapElement` prop.
 */
export declare type WrapElement = (element: ReactElement) => ReactElement;
/**
 * The `children` prop that supports a function.
 * @template T Element type.
 */
export declare type Children<T = any> = ReactNode | RenderProp<HTMLAttributes<T> & RefAttributes<T>>;
/**
 * Props with the `as` prop.
 * @template T The `as` prop
 * @example
 * type ButtonOptions = Options<"button">;
 */
export declare type Options<T extends As = any> = {
    as?: T;
};
/**
 * Props that automatically includes HTML props based on the `as` prop.
 * @template O Options
 * @example
 * type ButtonHTMLProps = HTMLProps<Options<"button">>;
 */
export declare type HTMLProps<O extends Options> = {
    wrapElement?: WrapElement;
    children?: Children;
    [index: `data-${string}`]: unknown;
} & Omit<ComponentPropsWithRef<NonNullable<O["as"]>>, keyof O | "children">;
/**
 * Options & HTMLProps
 * @template O Options
 * @example
 * type ButtonProps = Props<Options<"button">>;
 */
export declare type Props<O extends Options> = O & HTMLProps<O>;
/**
 * A component that supports the `as` prop and the `children` prop as a
 * function.
 * @template O Options
 * @example
 * type ButtonComponent = Component<Options<"button">>;
 */
export declare type Component<O extends Options> = {
    <T extends As>(props: Omit<O, "as"> & Omit<HTMLProps<Options<T>>, keyof O> & Required<Options<T>>): JSX.Element | null;
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
export declare type Hook<O extends Options> = {
    <T extends As = NonNullable<O["as"]>>(props?: Omit<O, "as"> & Omit<HTMLProps<Options<T>>, keyof O> & Options<T>): HTMLProps<Options<T>>;
    displayName?: string;
};
