import { toArray } from "reakit-utils/toArray";
import { deepEqual } from "./__utils/deepEqual";
import { useOptions } from "./useOptions";
import { useProps } from "./useProps";

type Hook<O = any, P = any> = {
  (options?: O, htmlProps?: P, unstable_ignoreUseOptions?: boolean): P;
  __keys: ReadonlyArray<any>;
  __useOptions: (options: O, htmlProps: P) => O;
  __propsAreEqual?: (prev: O & P, next: O & P) => boolean;
};

type CreateHookOptions<O, P> = {
  name?: string;
  compose?: Hook | Hook[];
  useState?: { (): any; __keys: ReadonlyArray<any> };
  useOptions?: (options: O, htmlProps: P) => O;
  useProps?: (options: O, htmlProps: P) => P;
  useComposeOptions?: (options: O, htmlProps: P) => O;
  useComposeProps?: (options: O, htmlProps: P) => P;
  propsAreEqual?: (prev: O & P, next: O & P) => boolean | undefined | null;
  keys?: ReadonlyArray<keyof O>;
};

/**
 * Creates a React custom hook that will return component props.
 *
 * @example
 * import { createHook } from "reakit-system";
 *
 * const useA = createHook({
 *   name: "A",
 *   keys: ["url"], // custom props/options keys
 *   useProps(options, htmlProps) {
 *     return {
 *       ...htmlProps,
 *       href: options.url
 *     };
 *   }
 * });
 *
 * function A({ url, ...htmlProps }) {
 *   const props = useA({ url }, htmlProps);
 *   return <a {...props} />;
 * }
 *
 * @param options
 */
export function createHook<O, P>(options: CreateHookOptions<O, P>) {
  const composedHooks = toArray(options.compose) as Hook[];

  const __useOptions = (hookOptions: O, htmlProps: P) => {
    // Call the current hook's useOptions first
    if (options.useOptions) {
      hookOptions = options.useOptions(hookOptions, htmlProps);
    }
    // If there's name, call useOptions from the system context
    if (options.name) {
      hookOptions = useOptions(options.name, hookOptions, htmlProps);
    }
    // Run composed hooks useOptions
    if (options.compose) {
      composedHooks.forEach(hook => {
        hookOptions = hook.__useOptions(hookOptions, htmlProps);
      });
    }

    return hookOptions;
  };

  const useHook: Hook<O, P> = (
    hookOptions = {} as O,
    htmlProps = {} as P,
    unstable_ignoreUseOptions = false
  ) => {
    // This won't execute when useHook was called from within another useHook
    if (!unstable_ignoreUseOptions) {
      hookOptions = __useOptions(hookOptions, htmlProps);
    }
    // Call the current hook's useProps
    if (options.useProps) {
      htmlProps = options.useProps(hookOptions, htmlProps);
    }
    // If there's name, call useProps from the system context
    if (options.name) {
      htmlProps = useProps(options.name, hookOptions, htmlProps) as P;
    }
    if (options.compose) {
      if (options.useComposeOptions) {
        hookOptions = options.useComposeOptions(hookOptions, htmlProps);
      }
      if (options.useComposeProps) {
        htmlProps = options.useComposeProps(hookOptions, htmlProps);
      } else {
        composedHooks.forEach(hook => {
          htmlProps = hook(hookOptions, htmlProps, true);
        });
      }
    }
    return htmlProps;
  };

  if (process.env.NODE_ENV !== "production" && options.name) {
    Object.defineProperty(useHook, "name", {
      value: `use${options.name}`
    });
  }

  useHook.__useOptions = __useOptions;

  // It's used by createComponent to split option props (keys) and html props
  useHook.__keys = [
    ...composedHooks.reduce((allKeys, hook) => {
      allKeys.push(...(hook.__keys || []));
      return allKeys;
    }, [] as string[]),
    ...(options.useState ? options.useState.__keys : []),
    ...(options.keys || [])
  ];

  const hasPropsAreEqual = Boolean(
    options.propsAreEqual ||
      composedHooks.find(hook => Boolean(hook.__propsAreEqual))
  );

  if (hasPropsAreEqual) {
    useHook.__propsAreEqual = (prev, next) => {
      const result = options.propsAreEqual && options.propsAreEqual(prev, next);
      if (result != null) {
        return result;
      }

      for (const hook of composedHooks) {
        const propsAreEqual = hook.__propsAreEqual;
        const hookResult = propsAreEqual && propsAreEqual(prev, next);
        if (hookResult != null) {
          return hookResult;
        }
      }

      // @ts-ignore
      if (prev.children !== next.children) {
        return false;
      }

      return deepEqual(prev, next);
    };
  }

  return useHook;
}
