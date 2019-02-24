import { extractPropFromObjects } from "../__utils/extractPropFromObjects";
import { UnionToIntersection } from "../__utils/types";
import { HookContextType } from "./_HookContext";
import { ConstantContextType } from "./_ConstantContext";
import { VariableContextType } from "./_VariableContext";
import { DynamoContextType } from "./_DynamoContext";

type Theme = {
  hooks?: HookContextType;
  constants?: ConstantContextType;
  variables?: VariableContextType;
  dynamos?: DynamoContextType;
};

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

  // TODO: refactor
  for (let i = 0; i < length; i += 1) {
    const hook = hooks[i];
    for (const key in hook) {
      if ({}.hasOwnProperty.call(hook, key)) {
        const value = hook[key];
        if (typeof value === "function") {
          fns[key] = [...(fns[key] || []), value!];
        }
      }
    }
  }

  // TODO: refactor
  return {
    hooks: Object.keys(fns).reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          fns[key].length > 1
            ? fns[key].reduce(
                (lastHook, currHook) => (a: any, b: any, c?: any) =>
                  key === "useCreateElement"
                    ? currHook(a, b, lastHook(a, b, c))
                    : currHook(a, lastHook(a, b))
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
  } as UnionToIntersection<T[number]>;
}
