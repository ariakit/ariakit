// TODO: refine
import { Ref } from "react";
import { UnionToIntersection, PickByValue } from "../_utils/types";

function extractProp<T, K extends keyof T>(propsObjects: T[], prop: K) {
  const props: Array<NonNullable<T[K]>> = [];
  const { length } = propsObjects;

  for (let i = 0; i < length; i += 1) {
    const p = propsObjects[i][prop];
    if (p) {
      props.push(p!);
    }
  }

  return props;
}

function mergeRefProps<T>(...propsObjects: Array<{ ref?: Ref<T> }>) {
  const refs = extractProp(propsObjects, "ref");

  if (refs.length === 0) return {};
  if (refs.length === 1) return { ref: refs[0] };

  return {
    ref: (instance: T) => {
      refs.forEach(ref => {
        if (typeof ref === "function") {
          ref(instance);
        } else if (ref) {
          // @ts-ignore
          // eslint-disable-next-line no-param-reassign
          ref.current = instance;
        }
      });
    }
  };
}

function mergeClassNameProps(...propsObjects: Array<{ className?: string }>) {
  const classNames = extractProp(propsObjects, "className");
  if (classNames.length === 0) return {};
  return {
    className: classNames.join(" ")
  };
}

function mergeFunctionProps<T extends { [key: string]: any }>(
  ...propsObjects: T[]
) {
  const fns: { [key: string]: Array<(...args: any[]) => any> } = {};
  const { length } = propsObjects;

  for (let i = 0; i < length; i += 1) {
    const props = propsObjects[i];
    const keys = Object.keys(props);
    for (let key = 0; key < keys.length; key += 1) {
      const value = props[key];
      if (typeof value === "function") {
        fns[key] = [...fns[key], value];
      }
    }
  }

  return Object.keys(fns).reduce(
    (acc, key) => ({
      ...acc,
      [key]: (...args: any[]) => {
        fns[key].forEach(fn => fn(...args));
      }
    }),
    {}
  ) as PickByValue<Required<T>, (...args: any[]) => any>;
}

function mergeStyleProps<T>(...propsObjects: Array<{ style?: T }>) {
  const styles = extractProp(propsObjects, "style");
  if (styles.length === 0) return {};
  if (styles.length === 1) return { style: styles[0] };
  return {
    style: Object.assign({}, ...styles)
  };
}

function mergeProps<T extends any[]>(...propsObjects: T) {
  const allProps = Object.assign({}, ...propsObjects) as UnionToIntersection<
    T[number]
  >;
  const refProps = mergeRefProps(...propsObjects);
  const classNameProps = mergeClassNameProps(...propsObjects);
  const functionProps = mergeFunctionProps(...propsObjects);
  const styleProps = mergeStyleProps(...propsObjects);
  return {
    ...allProps,
    ...refProps,
    ...classNameProps,
    ...functionProps,
    ...styleProps
  };
}

export default mergeProps;
