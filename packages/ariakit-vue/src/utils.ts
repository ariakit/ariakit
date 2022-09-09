/**
 * Stuff in this module can eventually be moved into a separate `ariakit-vue-utils` package
 * but for now, to ease the initial development and exploration, it's easier to just have
 * everything inside a single package.
 */

import {
  Component,
  ComponentOptions,
  DefineComponent,
  Fragment,
  FunctionalComponent,
  Ref,
  Suspense,
  UnwrapRef,
  Text as VueText,
  computed,
  unref,
} from "vue-demi";

// https://github.com/microsoft/TypeScript/issues/32164 prevents us from just using `Parameters<typeof h>[0]`
// `Constructor` is missing from here because Vue does not export the type. It doesn't seem like it would be
// used that often anyway.
export type As =
  | string
  | typeof VueText
  | typeof Fragment
  | typeof Suspense
  | FunctionalComponent
  | Component
  | ComponentOptions
  | DefineComponent;

export interface Options {
  as?: As;
}

/**
 * Reactively pulls a value off a potentially reactive object
 * and automatically unwraps refs.
 */
export const unwrap = <T>(p: T, k: keyof T) => {
  return computed(() => unref(p[k]) as UnwrapRef<T[typeof k]>);
};

export const useTagName = (ref: Ref<HTMLElement | null>, as: Ref<As> | As) => {
  return computed(() => {
    const a = unref(as);
    return (
      ref.value?.tagName.toLowerCase() ||
      (typeof a === "string" ? a : undefined)
    );
  });
};

function addRefToAttributes(
  attributes: Record<string, unknown>,
  ref: [string, Ref<unknown> | unknown]
) {
  const [key, value] = ref;

  // A template ref needs to be kept as is
  if (key === "ref") {
    attributes[key] = value;
  } else {
    attributes[key] = unref(value);
  }
  return attributes;
}

export function refsToAttributes(refs: Record<string, unknown>) {
  return Object.entries(refs).reduce(addRefToAttributes, {});
}
