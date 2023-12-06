import { useCallback, useEffect, useMemo } from "react";
import * as Core from "@ariakit/core/form/form-store";
import type { StringLike } from "@ariakit/core/form/types";
import type { PickRequired } from "@ariakit/core/utils/types";
import type {
  CollectionStoreFunctions,
  CollectionStoreOptions,
  CollectionStoreState,
} from "../collection/collection-store.js";
import { useCollectionStoreProps } from "../collection/collection-store.js";
import { useEvent } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useFormStoreProps<
  T extends Omit<FormStore, "useValue" | "useValidate" | "useSubmit">,
>(store: T, update: () => void, props: FormStoreProps) {
  store = useCollectionStoreProps(store, update, props);

  useStoreProps(store, props, "values", "setValues");
  useStoreProps(store, props, "errors", "setErrors");
  useStoreProps(store, props, "touched", "setTouched");

  const useValue = useCallback<FormStore["useValue"]>(
    (name) => store.useState(() => store.getValue(name)),
    [store],
  );

  const useValidate = useCallback<FormStore["useValidate"]>(
    (callback) => {
      callback = useEvent(callback);
      // Whenever the items change (for example, when form fields are lazily
      // rendered), we need to reset the callbacks so they always run in a
      // consistent order.
      const items = store.useState("items");
      useEffect(() => store.onValidate(callback), [items, callback]);
    },
    [store],
  );

  const useSubmit = useCallback<FormStore["useSubmit"]>(
    (callback) => {
      callback = useEvent(callback);
      // Same logic as useValidate.
      const items = store.useState("items");
      useEffect(() => store.onSubmit(callback), [items, callback]);
    },
    [store],
  );

  return useMemo(
    () => ({
      ...store,
      useValue,
      useValidate,
      useSubmit,
    }),
    [],
  );
}

/**
 * Creates a form store.
 * @example
 * ```jsx
 * const form = useFormStore({
 *   defaultValues: {
 *     email: "",
 *   },
 * });
 * <Form store={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 *   <FormError name={form.names.email} />
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export function useFormStore<T extends FormStoreValues = FormStoreValues>(
  props: PickRequired<
    FormStoreProps<T>,
    | "values"
    | "defaultValues"
    | "errors"
    | "defaultErrors"
    | "touched"
    | "defaultTouched"
  >,
): FormStore<T>;

export function useFormStore(props: FormStoreProps): FormStore;

export function useFormStore(props: FormStoreProps = {}): FormStore {
  const [store, update] = useStore(Core.createFormStore, props);
  return useFormStoreProps(store, update, props);
}

export interface FormStoreValues extends Core.FormStoreValues {}

export interface FormStoreItem extends Core.FormStoreItem {}

export interface FormStoreState<T extends FormStoreValues = FormStoreValues>
  extends Core.FormStoreState<T>,
    CollectionStoreState<FormStoreItem> {}

export interface FormStoreFunctions<T extends FormStoreValues = FormStoreValues>
  extends Core.FormStoreFunctions<T>,
    CollectionStoreFunctions<FormStoreItem> {
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

export interface FormStoreOptions<T extends FormStoreValues = FormStoreValues>
  extends Core.FormStoreOptions<T>,
    CollectionStoreOptions<FormStoreItem> {
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

export interface FormStoreProps<T extends FormStoreValues = FormStoreValues>
  extends FormStoreOptions<T>,
    Core.FormStoreProps<T> {}

export interface FormStore<T extends FormStoreValues = FormStoreValues>
  extends FormStoreFunctions<T>,
    Store<Core.FormStore<T>> {}
