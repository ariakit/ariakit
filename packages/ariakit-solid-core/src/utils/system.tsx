import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import type { ValidComponent } from "solid-js";
import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import type {
  ExtractPropsWithDefaultsExtractedProps,
  ExtractPropsWithDefaultsRestProps,
} from "./reactivity.ts";
import { extractPropsWithDefaults } from "./reactivity.ts";
import type {
  Hook,
  HTMLProps,
  Options,
  Props,
  WrapInstance,
  WrapInstanceValue,
} from "./types.ts";

/**
 * Creates a Solid component instance that supports the `render` and
 * `wrapInstance` props.
 */
export function createInstance(
  Component: ValidComponent,
  props: Props<ValidComponent, Options>,
) {
  // TODO: consider adding a dev-only runtime check to clarify that
  // the JSX.Element type is only accepted through `As`, so that
  // the error is not a vague "value is not a function" error.
  const [features, rest] = splitProps(props, ["render", "wrapInstance"]);
  const withRender = () => (
    // TODO: replace with LazyDynamic
    <Dynamic
      {...rest}
      component={(features.render as ValidComponent) ?? Component}
    />
  );
  let tree = withRender;
  if (features.wrapInstance) {
    for (const element of features.wrapInstance) {
      const children = tree;
      tree = () => (
        // TODO: replace with LazyDynamic
        <Dynamic component={element as ValidComponent}>{children()}</Dynamic>
      );
    }
  }
  return tree();
}

/**
 * Returns props with an additional `wrapInstance` prop.
 */
export function wrapInstance<P, Q = P & { wrapInstance: WrapInstance }>(
  props: P & { wrapInstance?: WrapInstance },
  element: WrapInstanceValue,
): Q {
  const wrapInstance = [...(props.wrapInstance ?? []), element];
  return mergeProps(props, { wrapInstance }) as Q;
}

/**
 * Creates a component hook that accepts props and returns props so they can be
 * passed to a Solid component.
 */
export function createHook<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
>(useProps: (props: Props<T, P>) => HTMLProps<T, P>) {
  return useProps as Hook<T, P>;
}

/**
 * Splits "option props" from the rest in a component hook. Must be called
 * inside `createHook`.
 *
 * The first argument is an object that defines the props that will be extracted,
 * with their default values. To extract a prop without a default, set it to
 * `undefined`.
 *
 * The hook function must be passed as the second argument, and it will receive
 * the rest of the props and the extracted options.
 * @example
 * ```jsx
 * export const useMyComponent = createHook<TagName, MyComponentOptions>(
 *   withOptions(
 *     { orientation: "horizontal" },
 *     function useMyComponent(props, options) {
 *       // ...
 *     },
 *   ),
 * );
 * ```
 */
export function withOptions<
  T extends ValidComponent,
  P extends AnyObject,
  const D extends Partial<ComputedP>,
  ComputedP extends Props<T, P>,
>(
  defaults: D,
  useProps: (
    props: ExtractPropsWithDefaultsRestProps<ComputedP, D>,
    options: ExtractPropsWithDefaultsExtractedProps<ComputedP, D>,
  ) => HTMLProps<T, P>,
): (props: ComputedP) => HTMLProps<T, P> {
  return function usePropsWithOptions(props: ComputedP) {
    const [options, rest] = extractPropsWithDefaults(props, defaults);
    return useProps(rest, options);
  };
}
