import type { ElementType, ReactElement } from "react";
import { forwardRef, memo } from "react";
import { hasOwnProperty } from "@ariakit/core/utils/misc";
import type {
  Component,
  HTMLProps,
  Hook,
  Options,
  Props,
  RenderProp,
} from "./types.js";

function isRenderProp(children: any): children is RenderProp {
  return typeof children === "function";
}

/**
 * Creates a type-safe component with the `as` prop and `React.forwardRef`.
 *
 * @example
 * import { createComponent } from "@ariakit/react-core/utils/system";
 *
 * type Props = {
 *   as?: "div";
 *   customProp?: boolean;
 * };
 *
 * const Component = createComponent<Props>(({ customProp, ...props }) => {
 *   return <div {...props} />;
 * });
 *
 * <Component as="button" customProp />
 */
export function createComponent<O extends Options>(
  render: (props: Props<O>) => ReactElement
) {
  const Role = (props: Props<O>, ref: React.Ref<any>) =>
    render({ ref, ...props });
  return forwardRef(Role) as unknown as Component<O>;
}

/**
 * Creates a type-safe component with the `as` prop, `React.forwardRef` and
 * `React.memo`.
 *
 * @example
 * import { createMemoComponent } from "@ariakit/react-core/utils/system";
 *
 * type Props = {
 *   as?: "div";
 *   customProp?: boolean;
 * };
 *
 * const Component = createMemoComponent<Props>(({ customProp, ...props }) => {
 *   return <div {...props} />;
 * });
 *
 * <Component as="button" customProp />
 */
export function createMemoComponent<O extends Options>(
  render: (props: Props<O>) => ReactElement
) {
  const Role = createComponent(render);
  return memo(Role) as unknown as typeof Role;
}

/**
 * Creates a React element that supports the `as` prop, children as a
 * function (render props) and a `wrapElement` function.
 *
 * @example
 * import { createElement } from "@ariakit/react-core/utils/system";
 *
 * function Component() {
 *   const props = {
 *     as: "button" as const,
 *     children: (htmlProps) => <button {...htmlProps} />,
 *     wrapElement: (element) => <div>{element}</div>,
 *   };
 *   return createElement("div", props);
 * }
 */
export function createElement(Type: ElementType, props: HTMLProps<Options>) {
  const { as: As, wrapElement, render, ...rest } = props;
  let element: ReactElement;
  if (As && typeof As !== "string") {
    element = <As {...rest} render={render} />;
  } else if (render) {
    // @ts-expect-error
    element = render(rest) as ReactElement;
  } else if (isRenderProp(props.children)) {
    const { children, ...otherProps } = rest;
    element = props.children(otherProps) as ReactElement;
  } else if (As) {
    element = <As {...rest} />;
  } else {
    element = <Type {...rest} />;
  }
  if (wrapElement) {
    return wrapElement(element);
  }
  return element;
}

/**
 * Creates a component hook that accepts props and returns props so they can be
 * passed to a React element.
 *
 * @example
 * import { Options, createHook } from "@ariakit/react-core/utils/system";
 *
 * type Props = Options<"div"> & {
 *   customProp?: boolean;
 * };
 *
 * const useComponent = createHook<Props>(({ customProp, ...props }) => {
 *   return props;
 * });
 *
 * const props = useComponent({ as: "button", customProp: true });
 */
export function createHook<O extends Options>(
  useProps: (props: Props<O>) => HTMLProps<O>
) {
  const useRole = (props: Props<O> = {} as Props<O>) => {
    const htmlProps = useProps(props);
    const copy = {} as typeof htmlProps;
    for (const prop in htmlProps) {
      if (hasOwnProperty(htmlProps, prop) && htmlProps[prop] !== undefined) {
        // @ts-expect-error
        copy[prop] = htmlProps[prop];
      }
    }
    return copy;
  };
  return useRole as Hook<O>;
}
