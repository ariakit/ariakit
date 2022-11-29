import {
  CollectionStoreFunctions,
  CollectionStoreItem,
  CollectionStoreOptions,
  CollectionStoreState,
  createCollectionStore,
} from "../collection/collection-store";
import { applyState, isInteger, isObject } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { AnyObject, SetState, SetStateAction } from "../utils/types";
import { DeepMap, DeepPartial, Names, StringLike } from "./types";

type Values = AnyObject;
type ErrorMessage = string | undefined | null;
type Item = CollectionStoreItem & {
  type: "field" | "label" | "description" | "error" | "button";
  name: string;
};

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export function hasMessages(object: Values): boolean {
  return Object.keys(object).some((key) => {
    if (isObject(object[key])) {
      return hasMessages(object[key]);
    }
    return !!object[key];
  });
}

export function get<T>(
  values: Values,
  path: StringLike | string[],
  defaultValue?: T
): T {
  const [key, ...rest] = Array.isArray(path) ? path : `${path}`.split(".");
  if (key == null || !values) {
    return defaultValue as T;
  }
  if (!rest.length) {
    return values[key] ?? defaultValue;
  }
  return get(values[key], rest, defaultValue);
}

function set<T extends Values | unknown[]>(
  values: T,
  path: StringLike | string[],
  value: unknown
): T {
  const [k, ...rest] = Array.isArray(path) ? path : `${path}`.split(".");
  if (k == null) return values;
  const key = k as keyof T;
  const isIntegerKey = isInteger(key);
  const nextValues = isIntegerKey ? values || [] : values || {};
  const nestedValues = nextValues[key];
  const result =
    rest.length && (Array.isArray(nestedValues) || isObject(nestedValues))
      ? set(nestedValues, rest, value)
      : value;
  if (isIntegerKey) {
    const index = Number(key);
    if (values) {
      return [
        ...values.slice(0, index),
        result,
        ...values.slice(index + 1),
      ] as T;
    }
    const nextValues = [] as unknown as T;
    nextValues[index as keyof T] = result as T[keyof T];
    return nextValues;
  }
  return { ...values, [key]: result };
}

function setAll<T extends Values, V>(values: T, value: V) {
  const result = {} as Values;
  const keys = Object.keys(values);
  for (const key of keys) {
    const currentValue = values[key];
    if (Array.isArray(currentValue)) {
      result[key] = currentValue.map((v) => {
        if (isObject(v)) {
          return setAll(v, value);
        }
        return value;
      });
    } else if (isObject(currentValue)) {
      result[key] = setAll(currentValue, value);
    } else {
      result[key] = value;
    }
  }
  return result as DeepMap<T, V>;
}

function getNameHandler(cache: Values, prevKeys: Array<string | symbol> = []) {
  const handler: ProxyHandler<Values> = {
    get(target, key) {
      if (["toString", "valueOf", Symbol.toPrimitive].includes(key)) {
        return () => prevKeys.join(".");
      }
      const nextKeys = [...prevKeys, key];
      const nextKey = nextKeys.join(".");
      if (cache[nextKey]) {
        return cache[nextKey];
      }
      const nextProxy = new Proxy(target, getNameHandler(cache, nextKeys));
      cache[nextKey] = nextProxy;
      return nextProxy;
    },
  };
  return handler;
}

function createNames() {
  const cache = Object.create(null);
  return new Proxy(Object.create(null), getNameHandler(cache));
}

export function createFormStore<T extends Values = Values>({
  values = {} as FormStoreState<T>["values"],
  errors = {} as FormStoreState<T>["errors"],
  touched = {} as FormStoreState<T>["touched"],
  ...props
}: FormStoreProps<T> = {}): FormStore<T> {
  const collection = createCollectionStore(props);
  const initialState: FormStoreState<T> = {
    ...collection.getState(),
    values,
    errors,
    touched,
    validating: false,
    submitting: false,
    submitSucceed: 0,
    submitFailed: 0,
    valid: !hasMessages(errors),
  };
  const store = createStore(initialState, collection);

  const validateCallbacks = new Set<FormStoreCallback>();
  const submitCallbacks = new Set<FormStoreCallback>();

  const validate = async () => {
    store.setState("validating", true);
    store.setState("errors", {});
    try {
      const callbacks = [...validateCallbacks];
      const results = callbacks.map((callback) => callback());
      // Wait for the next frame to allow the errors to be set on the state.
      await Promise.all(results).then(nextFrame);
      return !hasMessages(store.getState().errors);
    } finally {
      store.setState("validating", false);
    }
  };

  return {
    ...collection,
    ...store,
    names: createNames(),

    setValues: (values) => store.setState("values", values),
    getValue: (name) => get(store.getState().values, name),
    setValue: (name, value) =>
      store.setState("values", (values) => {
        const prevValue = get(values, name);
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue) return values;
        return set(values, name, nextValue);
      }),
    pushValue: (name, value) =>
      store.setState("values", (values) => {
        const array = get(values, name, [] as unknown[]);
        return set(values, name, [...array, value]);
      }),
    removeValue: (name, index) =>
      store.setState("values", (values) => {
        const array = get(values, name, [] as unknown[]);
        return set(values, name, [
          ...array.slice(0, index),
          null,
          ...array.slice(index + 1),
        ]);
      }),

    setErrors: (errors) => store.setState("errors", errors),
    getError: (name) => get(store.getState().errors, name),
    setError: (name, error) =>
      store.setState("errors", (errors) => {
        const prevError = get(errors, name);
        const nextError = applyState(error, prevError);
        if (nextError === prevError) return errors;
        return set(errors, name, nextError);
      }),

    setTouched: (touched) => store.setState("touched", touched),
    getFieldTouched: (name) => !!get(store.getState().touched, name),
    setFieldTouched: (name, value) =>
      store.setState("touched", (touched) => {
        const prevValue = get(touched, name);
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue) return touched;
        return set(touched, name, nextValue);
      }),

    registerValidateCallback: (callback) => {
      validateCallbacks.add(callback);
      return () => validateCallbacks.delete(callback);
    },
    validate,

    registerSubmitCallback: (callback) => {
      submitCallbacks.add(callback);
      return () => submitCallbacks.delete(callback);
    },
    submit: async () => {
      store.setState("submitting", true);
      store.setState("touched", setAll(store.getState().values, true));
      try {
        if (await validate()) {
          const callbacks = [...submitCallbacks];
          const results = callbacks.map((callback) => callback());
          // Wait for the next frame to allow the errors to be set on the state.
          await Promise.all(results).then(nextFrame);
          if (!hasMessages(store.getState().errors)) {
            store.setState("submitSucceed", (count) => count + 1);
            return true;
          }
        }
        store.setState("submitFailed", (count) => count + 1);
        return false;
      } catch (error) {
        store.setState("submitFailed", (count) => count + 1);
        throw error;
      } finally {
        store.setState("submitting", false);
      }
    },

    reset: () => {
      store.setState("values", values);
      store.setState("errors", errors);
      store.setState("touched", touched);
      store.setState("validating", false);
      store.setState("submitting", false);
      store.setState("submitSucceed", 0);
      store.setState("submitFailed", 0);
    },
  };
}

export type FormStoreCallback = () => void | Promise<void>;

export type FormStoreValues = Values;

export type FormStoreItem = Item;

export type FormStoreState<T extends Values = Values> =
  CollectionStoreState<Item> & {
    /**
     * Form values.
     */
    values: T;
    /**
     * Form errors.
     */
    errors: DeepPartial<DeepMap<T, ErrorMessage>>;
    /**
     * The touched state of the form.
     */
    touched: DeepPartial<DeepMap<T, boolean>>;
    valid: boolean;
    validating: boolean;
    submitting: boolean;
    submitSucceed: number;
    submitFailed: number;
  };

export type FormStoreFunctions<T extends Values = Values> =
  CollectionStoreFunctions<Item> & {
    names: Names<T>;
    setValues: SetState<FormStoreState<T>["values"]>;
    getValue: <T = any>(name: StringLike) => T;
    setValue: <T>(name: StringLike, value: SetStateAction<T>) => void;
    pushValue: <T>(name: StringLike, value: T) => void;
    removeValue: (name: StringLike, index: number) => void;
    setErrors: SetState<FormStoreState<T>["errors"]>;
    getError: (name: StringLike) => ErrorMessage;
    setError: (name: StringLike, error: SetStateAction<ErrorMessage>) => void;
    setTouched: SetState<FormStoreState<T>["touched"]>;
    getFieldTouched: (name: StringLike) => boolean;
    setFieldTouched: (name: StringLike, value: SetStateAction<boolean>) => void;
    registerValidateCallback: (callback: FormStoreCallback) => void;
    validate: () => Promise<boolean>;
    registerSubmitCallback: (callback: FormStoreCallback) => void;
    submit: () => Promise<boolean>;
    reset: () => void;
  };

export type FormStoreOptions<T extends Values = Values> =
  CollectionStoreOptions<Item> &
    StoreOptions<FormStoreState<T>, "values" | "errors" | "touched">;

export type FormStoreProps<T extends Values = Values> = FormStoreOptions<T> &
  StoreProps<FormStoreState<T>>;

export type FormStore<T extends Values = Values> = FormStoreFunctions<T> &
  Store<FormStoreState<T>>;
