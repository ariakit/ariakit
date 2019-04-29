import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { toArray } from "../__utils/toArray";
import { deepEqual } from "../__utils/deepEqual";

type Hook<O = any, P = any> = {
  (options?: O, htmlProps?: P): P;
  __keys: ReadonlyArray<any>;
  __propsAreEqual?: (prev: O & P, next: O & P) => boolean;
};

type CreateHookOptions<O, P> = {
  name: string;
  compose?: Hook | Hook[];
  useState?: { (): any; __keys: ReadonlyArray<any> };
  useOptions?: (options: O, htmlProps: P) => O;
  useProps?: (options: O, htmlProps: P) => P;
  useCompose?: (options: O, htmlProps: P) => P;
  propsAreEqual?: (prev: O & P, next: O & P) => boolean | undefined | null;
  keys?: ReadonlyArray<keyof O>;
};

export function unstable_createHook<O, P>(options: CreateHookOptions<O, P>) {
  const composedHooks = toArray(options.compose) as Hook[];

  const useHook: Hook<O, P> = (hookOptions = {} as O, htmlProps = {} as P) => {
    if (options.useOptions) {
      hookOptions = options.useOptions(hookOptions, htmlProps);
    }
    hookOptions = unstable_useOptions(options.name, hookOptions, htmlProps);
    if (options.useProps) {
      htmlProps = options.useProps(hookOptions, htmlProps);
    }
    htmlProps = unstable_useProps(options.name, hookOptions, htmlProps) as P;
    if (options.useCompose) {
      htmlProps = options.useCompose(hookOptions, htmlProps);
    } else if (options.compose) {
      composedHooks.forEach(hook => {
        htmlProps = hook(hookOptions, htmlProps);
      });
    }
    return htmlProps;
  };

  if (process.env.NODE_ENV !== "production") {
    Object.defineProperty(useHook, "name", {
      value: options.name
    });
  }

  useHook.__keys = [
    ...composedHooks.reduce(
      (allKeys, hook) => [...allKeys, ...(hook.__keys || [])],
      [] as string[]
    ),
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

      return deepEqual(prev, next);
    };
  }

  return useHook;
}
