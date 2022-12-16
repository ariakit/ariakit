import {
  CollectionStoreFunctions,
  CollectionStoreItem,
  CollectionStoreOptions,
  CollectionStoreState,
  createCollectionStore,
} from "../collection/collection-store";
import { applyState, defaultValue, isInteger, isObject } from "../utils/misc";
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

export function createFormStore<T extends Values = Values>(
  props: FormStoreProps<T> &
    (
      | Required<Pick<FormStoreProps<T>, "values">>
      | Required<Pick<FormStoreProps<T>, "defaultValues">>
      | Required<Pick<FormStoreProps<T>, "errors">>
      | Required<Pick<FormStoreProps<T>, "defaultErrors">>
      | Required<Pick<FormStoreProps<T>, "touched">>
      | Required<Pick<FormStoreProps<T>, "defaultTouched">>
    )
): FormStore<T>;

export function createFormStore(props: FormStoreProps): FormStore;

export function createFormStore(props: FormStoreProps = {}): FormStore {
  const syncState = props.store?.getState();
  const collection = createCollectionStore(props);

  const values = defaultValue(
    props.values,
    syncState?.values,
    props.defaultValues,
    {}
  );

  const errors = defaultValue(
    props.errors,
    syncState?.errors,
    props.defaultErrors,
    {}
  );

  const touched = defaultValue(
    props.touched,
    syncState?.touched,
    props.defaultTouched,
    {}
  );

  const initialState: FormStoreState = {
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
  const form = createStore(initialState, collection, props.store);

  const validateCallbacks = new Set<FormStoreCallback>();
  const submitCallbacks = new Set<FormStoreCallback>();

  const validate = async () => {
    form.setState("validating", true);
    form.setState("errors", {});
    try {
      const callbacks = [...validateCallbacks];
      const results = callbacks.map((callback) => callback());
      // Wait for the next frame to allow the errors to be set on the state.
      await Promise.all(results).then(nextFrame);
      return !hasMessages(form.getState().errors);
    } finally {
      form.setState("validating", false);
    }
  };

  return {
    ...collection,
    ...form,
    names: createNames(),

    setValues: (values) => form.setState("values", values),
    getValue: (name) => get(form.getState().values, name),
    setValue: (name, value) =>
      form.setState("values", (values) => {
        const prevValue = get(values, name);
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue) return values;
        return set(values, name, nextValue);
      }),
    pushValue: (name, value) =>
      form.setState("values", (values) => {
        const array = get(values, name, [] as unknown[]);
        return set(values, name, [...array, value]);
      }),
    removeValue: (name, index) =>
      form.setState("values", (values) => {
        const array = get(values, name, [] as unknown[]);
        return set(values, name, [
          ...array.slice(0, index),
          null,
          ...array.slice(index + 1),
        ]);
      }),

    setErrors: (errors) => form.setState("errors", errors),
    getError: (name) => get(form.getState().errors, name),
    setError: (name, error) =>
      form.setState("errors", (errors) => {
        const prevError = get(errors, name);
        const nextError = applyState(error, prevError);
        if (nextError === prevError) return errors;
        return set(errors, name, nextError);
      }),

    setTouched: (touched) => form.setState("touched", touched),
    getFieldTouched: (name) => !!get(form.getState().touched, name),
    setFieldTouched: (name, value) =>
      form.setState("touched", (touched) => {
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
      form.setState("submitting", true);
      form.setState("touched", setAll(form.getState().values, true));
      try {
        if (await validate()) {
          const callbacks = [...submitCallbacks];
          const results = callbacks.map((callback) => callback());
          // Wait for the next frame to allow the errors to be set on the state.
          await Promise.all(results).then(nextFrame);
          if (!hasMessages(form.getState().errors)) {
            form.setState("submitSucceed", (count) => count + 1);
            return true;
          }
        }
        form.setState("submitFailed", (count) => count + 1);
        return false;
      } catch (error) {
        form.setState("submitFailed", (count) => count + 1);
        throw error;
      } finally {
        form.setState("submitting", false);
      }
    },

    reset: () => {
      form.setState("values", values);
      form.setState("errors", errors);
      form.setState("touched", touched);
      form.setState("validating", false);
      form.setState("submitting", false);
      form.setState("submitSucceed", 0);
      form.setState("submitFailed", 0);
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
    // TODO: Rename to registerValidate? or onValidate?
    registerValidateCallback: (callback: FormStoreCallback) => void;
    validate: () => Promise<boolean>;
    registerSubmitCallback: (callback: FormStoreCallback) => void;
    submit: () => Promise<boolean>;
    reset: () => void;
  };

export type FormStoreOptions<T extends Values = Values> =
  CollectionStoreOptions<Item> &
    StoreOptions<FormStoreState<T>, "values" | "errors" | "touched"> & {
      defaultValues?: FormStoreState<T>["values"];
      defaultErrors?: FormStoreState<T>["errors"];
      defaultTouched?: FormStoreState<T>["touched"];
    };

export type FormStoreProps<T extends Values = Values> = FormStoreOptions<T> &
  StoreProps<FormStoreState<T>>;

export type FormStore<T extends Values = Values> = FormStoreFunctions<T> &
  Store<FormStoreState<T>>;
