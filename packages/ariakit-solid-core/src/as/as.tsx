import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { mergeProps } from "../utils/reactivity.ts";

type AsElements = {
  [K in keyof JSX.IntrinsicElements]: Component<ComponentProps<K>>;
};

type AsComponent = <T extends Component<any>, P = ComponentProps<T>>(
  props: AsProps<T, P>,
) => JSX.Element;

const cache = new Map<string, Component<any>>();

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
    return ((parentProps: unknown) => (
      // TODO: replace with LazyDynamic
      <Dynamic
        {...mergeProps(parentProps, props)}
        component={props.component}
      />
    )) as unknown as JSX.Element;
  } as AsComponent & AsElements,
  {
    get: (_, key: keyof JSX.IntrinsicElements) => {
      let component = cache.get(key);
      if (!component) {
        component = function AsElement(props: any): JSX.Element {
          return ((parentProps: unknown) => (
            // TODO: replace with LazyDynamic
            <Dynamic {...mergeProps(parentProps, props)} component={key} />
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
