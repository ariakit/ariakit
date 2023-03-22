import { useCallback, useMemo } from "react";
import * as Core from "@ariakit/core/form/form-store";
import { StringLike } from "@ariakit/core/form/types";
import { PickRequired } from "@ariakit/core/utils/types";
import {
  CollectionStoreFunctions,
  CollectionStoreOptions,
  CollectionStoreState,
  useCollectionStoreOptions,
  useCollectionStoreProps,
} from "../collection/collection-store.js";
import { useSafeLayoutEffect } from "../utils/hooks.js";
import { Store, useStore, useStoreProps } from "../utils/store.jsx";

type Values = Core.FormStoreValues;
type Item = Core.FormStoreItem;

export function useFormStoreOptions(props: FormStoreProps) {
  return useCollectionStoreOptions(props);
}

export function useFormStoreProps<
  T extends Omit<FormStore, "useValue" | "useValidate" | "useSubmit">
>(store: T, props: FormStoreProps) {
  store = useCollectionStoreProps(store, props);
  useStoreProps(store, props, "values", "setValues");
  useStoreProps(store, props, "errors", "setErrors");
  useStoreProps(store, props, "touched", "setTouched");

  const useValue = useCallback<FormStore["useValue"]>((name) => {
    return store.useState(() => store.getValue(name));
  }, []);

  const useValidate = useCallback<FormStore["useValidate"]>((callback) => {
    useSafeLayoutEffect(() => store.onValidate(callback), [callback]);
  }, []);

  const useSubmit = useCallback<FormStore["useSubmit"]>((callback) => {
    useSafeLayoutEffect(() => store.onSubmit(callback), [callback]);
  }, []);

  return useMemo(
    () => ({
      ...store,
      useValue,
      useValidate,
      useSubmit,
    }),
    []
  );
}

/**
 * Creates a form store.
 * @example
 * ```jsx
 * const form = useFormStore({ defaultValues: { email: "" } });
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 *   <FormError name={form.names.email} />
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export function useFormStore<T extends Values = Values>(
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

export function useFormStore(props: FormStoreProps): FormStore;

export function useFormStore(props: FormStoreProps = {}): FormStore {
  const options = useFormStoreOptions(props);
  const store = useStore(() => Core.createFormStore({ ...props, ...options }));
  return useFormStoreProps(store, props);
}

export type FormStoreItem = Item;

export interface FormStoreState<T extends Values = Values>
  extends Core.FormStoreState<T>,
    CollectionStoreState<Item> {}

export interface FormStoreFunctions<T extends Values = Values>
  extends Core.FormStoreFunctions<T>,
    CollectionStoreFunctions<Item> {
  /**
   * A custom hook that rerenders the component when the value of the given
   * field changes. It returns the value of the field.
   * @param name The name of the field.
   * @example
   * const nameValue = store.useValue("name");
   * // Can also use store.names for type-safety.
   * const emailValue = store.useValue(store.names.email);
   */
  useValue: <T = any>(name: StringLike) => T;
  /**
   * Custom hook that accepts a callback that will be used to validate the form
   * when `form.validate` is called.
   * @param callback The callback that receives the form state as argument.
   * @example
   * store.useValidate(async (state) => {
   *   const errors = await api.validate(state.values);
   *   if (errors) {
   *     store.setErrors(errors);
   *   }
   * });
   */
  useValidate: (callback: Core.FormStoreCallback<FormStoreState<T>>) => void;
  /**
   * Custom hook that accepts a callback that will be used to submit the form
   * when `form.submit` is called.
   * @param callback The callback that receives the form state as argument.
   * @example
   * store.useSubmit(async (state) => {
   *   try {
   *     await api.submit(state.values);
   *   } catch (errors) {
   *     store.setErrors(errors);
   *   }
   * });
   */
  useSubmit: (callback: Core.FormStoreCallback<FormStoreState<T>>) => void;
}

export interface FormStoreOptions<T extends Values = Values>
  extends Core.FormStoreOptions<T>,
    CollectionStoreOptions<Item> {
  /**
   * Function that will be called when `values` state changes.
   * @param values The new values.
   * @example
   * function MyForm({ values, onChange }) {
   *   const form = useFormStore({ values, setValues: onChange });
   * }
   */
  setValues?: (values: FormStoreState<T>["values"]) => void;
  /**
   * Function that will be called when the `errors` state changes.
   * @param errors The new errors.
   * @example
   * useFormStore({ setErrors: (errors) => console.log(errors) });
   */
  setErrors?: (errors: FormStoreState<T>["errors"]) => void;
  /**
   * Function that will be called when the `touched` state changes.
   * @param touched The new touched state.
   * @example
   * useFormStore({ setTouched: (touched) => console.log(touched) });
   */
  setTouched?: (touched: FormStoreState<T>["touched"]) => void;
}

export type FormStoreProps<T extends Values = Values> = FormStoreOptions<T> &
  Core.FormStoreProps<T>;

export type FormStore<T extends Values = Values> = FormStoreFunctions<T> &
  Store<Core.FormStore<T>>;
