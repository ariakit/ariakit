// TODO: Typesafe, test
import { Theme } from "./_types";
import extractPropFromObjects from "../_utils/extractPropFromObjects";

function mergeObjects<T extends Theme, K extends keyof T>(
  themes: T[],
  prop: K
) {
  const objects = extractPropFromObjects(themes, prop);
  const { length } = objects;

  if (length === 0) return {};
  if (length === 1) return { [prop]: objects[0] };

  return {
    [prop]: Object.assign({}, ...objects)
  };
}

function mergeHooks<T extends Theme>(...themes: T[]) {
  const hooks = extractPropFromObjects(themes, "hooks");
  const { length } = hooks;

  if (length === 0) return {};
  if (length === 1) return { hooks: hooks[0] };

  const fns: Record<string, Array<(...args: any[]) => any>> = {};

  for (let i = 0; i < length; i += 1) {
    const hook = hooks[i];
    for (const key in hook) {
      if ({}.hasOwnProperty.call(hook, key)) {
        const value = hook[key];
        if (typeof value === "function") {
          fns[key] = [...(fns[key] || []), value];
        }
      }
    }
  }

  return {
    hooks: Object.keys(fns).reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          fns[key].length > 1
            ? fns[key].reduce(
                (lastHook, currHook) => (options: any, props: any) =>
                  currHook(options, lastHook(options, props))
              )
            : fns[key][0]
      }),
      {}
    )
  };
}

export function mergeTheme<T extends Theme[]>(...themes: T) {
  return {
    ...mergeObjects(themes, "constants"),
    ...mergeObjects(themes, "variables"),
    ...mergeObjects(themes, "dynamos"),
    ...mergeHooks(...themes)
  };
}

export default mergeTheme;
