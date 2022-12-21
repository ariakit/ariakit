import {
  CollectionStoreFunctions,
  CollectionStoreItem,
  CollectionStoreOptions,
  CollectionStoreState,
  createCollectionStore,
} from "../collection/collection-store";
import { applyState, defaultValue, isInteger, isObject } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import {
  AnyObject,
  PickRequired,
  SetState,
  SetStateAction,
} from "../utils/types";
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

/**
 * Creates a form store.
 */
export function createFormStore<T extends Values = Values>(
  props: PickRequired<
    FormStoreProps<T>,
    | "values"
    | "defaultValues"
    | "errors"
    | "defaultErrors"
    | "touched"
    | "defaultTouched"
  >
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
    validating: defaultValue(syncState?.validating, false),
    submitting: defaultValue(syncState?.submitting, false),
    submitSucceed: defaultValue(syncState?.submitSucceed, 0),
    submitFailed: defaultValue(syncState?.submitFailed, 0),
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
      const results = callbacks.map((callback) => callback(form.getState()));
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

    onValidate: (callback) => {
      validateCallbacks.add(callback);
      return () => validateCallbacks.delete(callback);
    },
    validate,

    onSubmit: (callback) => {
      submitCallbacks.add(callback);
      return () => submitCallbacks.delete(callback);
    },
    submit: async () => {
      form.setState("submitting", true);
      form.setState("touched", setAll(form.getState().values, true));
      try {
        if (await validate()) {
          const callbacks = [...submitCallbacks];
          const results = callbacks.map((callback) =>
            callback(form.getState())
          );
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

export type FormStoreCallback<T extends FormStoreState = FormStoreState> = (
  state: T
) => void | Promise<void>;

export type FormStoreValues = Values;

export type FormStoreItem = Item;

export interface FormStoreState<T extends Values = Values>
  extends CollectionStoreState<Item> {
  /**
   * Form values.
   * @default {}
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
  /**
   * Whether the form is valid.
   */
  valid: boolean;
  /**
   * Whether the form is validating.
   */
  validating: boolean;
  /**
   * Whether the form is submitting.
   */
  submitting: boolean;
  /**
   * The number of times `form.submit` has been called with a successful
   * response.
   */
  submitSucceed: number;
  /**
   * The number of times `form.submit` has been called with an error response.
   */
  submitFailed: number;
}

export interface FormStoreFunctions<T extends Values = Values>
  extends CollectionStoreFunctions<Item> {
  /**
   * An object containing the names of the form fields for type-safety.
   * @example
   * store.names.name; // "name"
   * store.names.name.first; // "name.first"
   * store.names.name.last; // "name.last"
   */
  names: Names<T>;
  /**
   * Sets the `values` state.
   * @example
   * store.setValues({ name: "John" });
   * store.setValues((values) => ({ ...values, name: "John" }));
   */
  setValues: SetState<FormStoreState<T>["values"]>;
  /**
   * Retrieves a field value.
   * @param name The field name.
   * @example
   * const nameValue = store.getValue("name");
   * // Can also use store.names for type-safety.
   * const emailValue = store.getValue(store.names.email);
   */
  getValue: <T = any>(name: StringLike) => T;
  /**
   * Sets a field value.
   * @param name The field name.
   * @param value The field value.
   * @example
   * store.setValue("name", "John");
   * store.setValue("name", (value) => value + " Doe");
   * // Can also use store.names for type-safety.
   * store.setValue(store.names.name, "John");
   */
  setValue: <T>(name: StringLike, value: SetStateAction<T>) => void;
  /**
   * Pushes a value to an array field.
   * @param name The array field name.
   * @param value The value to push.
   * @example
   * store.pushValue("tags", "new tag");
   * store.pushValue("tags", { id: 1, name: "new tag" });
   * // Can also use store.names for type-safety.
   * store.pushValue(store.names.tags, "new tag");
   */
  pushValue: <T>(name: StringLike, value: T) => void;
  /**
   * Removes a value from an array field.
   * @param name The array field name.
   * @param index The index of the value to remove.
   * @example
   * store.removeValue("tags", 0);
   * store.removeValue("tags", 1);
   * // Can also use store.names for type-safety.
   * store.removeValue(store.names.tags, 0);
   */
  removeValue: (name: StringLike, index: number) => void;
  /**
   * Sets the `errors` state.
   * @example
   * store.setErrors({ name: "Name is required" });
   * store.setErrors((errors) => ({ ...errors, name: "Name is required" }));
   */
  setErrors: SetState<FormStoreState<T>["errors"]>;
  /**
   * Retrieves a field error.
   * @param name The field name.
   * @example
   * const nameError = store.getError("name");
   * // Can also use store.names for type-safety.
   * const emailError = store.getError(store.names.email);
   */
  getError: (name: StringLike) => ErrorMessage;
  /**
   * Sets a field error.
   * @param name The field name.
   * @param error The field error.
   * @example
   * store.setError("name", "Name is required");
   * store.setError("name", (error) => error + "!");
   * // Can also use store.names for type-safety.
   * store.setError(store.names.name, "Name is required");
   */
  setError: (name: StringLike, error: SetStateAction<ErrorMessage>) => void;
  /**
   * Sets the `touched` state.
   * @example
   * store.setTouched({ name: true });
   * store.setTouched((touched) => ({ ...touched, name: true }));
   */
  setTouched: SetState<FormStoreState<T>["touched"]>;
  /**
   * Retrieves a field touched state.
   * @param name The field name.
   * @example
   * const nameTouched = store.getFieldTouched("name");
   * // Can also use store.names for type-safety.
   * const emailTouched = store.getFieldTouched(store.names.email);
   */
  getFieldTouched: (name: StringLike) => boolean;
  /**
   * Sets a field touched state.
   * @param name The field name.
   * @param value The field touched state.
   * @example
   * store.setFieldTouched("name", true);
   * store.setFieldTouched("name", (value) => !value);
   * // Can also use store.names for type-safety.
   * store.setFieldTouched(store.names.name, true);
   */
  setFieldTouched: (name: StringLike, value: SetStateAction<boolean>) => void;
  /**
   * Function that accepts a callback that will be used to validate the form
   * when `validate` is called. It returns a cleanup function that will remove
   * the callback.
   * @param callback The callback function.
   * @example
   * const cleanup = store.onValidate(async (state) => {
   *   const errors = await api.validate(state.values);
   *   if (errors) {
   *     store.setErrors(errors);
   *   }
   * });
   */
  onValidate: (callback: FormStoreCallback<FormStoreState<T>>) => void;
  /**
   * Function that accepts a callback that will be used to submit the form
   * when `submit` is called. It returns a cleanup function that will remove
   * the callback.
   * @param callback The callback function.
   * @example
   * const cleanup = store.onSubmit(async (state) => {
   *   try {
   *     await api.submit(state.values);
   *   } catch (errors) {
   *     store.setErrors(errors);
   *   }
   * });
   */
  onSubmit: (callback: FormStoreCallback<FormStoreState<T>>) => void;
  /**
   * Validates the form.
   * @example
   * if (await store.validate()) {
   *  // Form is valid.
   * }
   */
  validate: () => Promise<boolean>;
  /**
   * Submits the form. This also triggers validation.
   * @example
   * if (await form.submit()) {
   *   // Form is submitted.
   * }
   */
  submit: () => Promise<boolean>;
  /**
   * Resets the form to its default values.
   */
  reset: () => void;
}

export interface FormStoreOptions<T extends Values = Values>
  extends StoreOptions<FormStoreState<T>, "values" | "errors" | "touched">,
    CollectionStoreOptions<Item> {
  /**
   * The default values of the form.
   * @default {}
   */
  defaultValues?: FormStoreState<T>["values"];
  /**
   * The default errors of the form.
   */
  defaultErrors?: FormStoreState<T>["errors"];
  /**
   * The default touched state of the form.
   */
  defaultTouched?: FormStoreState<T>["touched"];
}

export type FormStoreProps<T extends Values = Values> = FormStoreOptions<T> &
  StoreProps<FormStoreState<T>>;

export type FormStore<T extends Values = Values> = FormStoreFunctions<T> &
  Store<FormStoreState<T>>;
