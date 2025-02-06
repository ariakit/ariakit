import { combineProps } from "@solid-primitives/props";
import {
  type Component,
  type ComponentProps,
  type JSX,
  type ValidComponent,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { isPropsProxy } from "./__props.ts";

// Temporary hack until this lands: https://github.com/solidjs/solid/pull/2422
export function createDynamic<T extends ValidComponent>(
  component: () => T,
  props: ComponentProps<T>,
) {
  // @ts-expect-error This is a temporary hack.
  return <Dynamic component={component()} {...props} />;
}

type AsComponent = <T extends ValidComponent, P = ComponentProps<T>>(
  props: AsProps<T, P>,
) => JSX.Element;

type AsElements = {
  [K in keyof JSX.IntrinsicElements | (string & {})]: Component<
    ComponentProps<K>
  >;
};

const cache = new Map<string, Component<any>>();

// Note: `props` must contain `props.component`!
function createAsComponent<T extends ValidComponent>(
  component: () => T,
  props: ComponentProps<T>,
  parentProps: any,
) {
  const isParentPropsProxy = isPropsProxy(parentProps);
  const parentHasProps =
    isParentPropsProxy || (parentProps && Object.keys(parentProps).length > 0);
  // This is necessary in nested renders, e.g.
  // <Component
  //   render={<As
  //     component={Role.div}
  //     render={...}
  //   />}
  // />
  const parentPropsWithoutRender =
    "render" in parentProps
      ? splitProps(parentProps, ["render"])[1]
      : parentProps;
  const mergedProps = (
    parentHasProps
      ? // TODO: look into potential combineProps optimizations when none are proxies, etc
        combineProps([parentPropsWithoutRender, props], {
          reverseEventHandlers: true,
        })
      : props
  ) as any;
  return createDynamic(component, mergedProps);
}

/**
 * Allows a component to be rendered as a different HTML element or Solid
 * component. Must be passed to the `render` prop of a component that
 * supports it.
 *
 * To render as an HTML element, use `<As.element />` (e.g. `<As.button />`).
 *
 * To render as a component, use `<As component={Component} />` (e.g. `<As
 * component={MyButton} />`).
 *
 * Check out the [Composition](https://solid.ariakit.org/guide/composition)
 * guide for more details.
 * @example
 * ```jsx
 * <Role render={<As component={MyButton} variant="primary" />} />
 * <Role render={<As.button type="button" />} />
 * ```
 */
export const As = new Proxy(
  function As(props: any) {
    return ((parentProps: unknown) =>
      createAsComponent(
        () => props.component,
        props,
        parentProps,
      )) as unknown as JSX.Element;
  } as AsComponent & AsElements,
  {
    get: (_, key: keyof JSX.IntrinsicElements) => {
      let component = cache.get(key);
      if (!component) {
        component = function AsElement(props: any) {
          return ((parentProps: unknown) =>
            createAsComponent(
              () => key,
              props,
              parentProps,
            )) as unknown as JSX.Element;
        };
        cache.set(key, component);
      }
      return component;
    },
  },
);

export type AsProps<T extends ValidComponent, P = ComponentProps<T>> = {
  [K in keyof P]: P[K];
} & { component: T };
