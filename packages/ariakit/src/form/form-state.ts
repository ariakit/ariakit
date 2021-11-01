import { SetStateAction, useCallback, useMemo, useState } from "react";
import { AnyObject, SetState } from "ariakit-utils/types";
import { useStorePublisher } from "ariakit-utils/store";
import { applyState } from "ariakit-utils/misc";
import {
  useControlledState,
  useInitialValue,
  useLazyRef,
  useLiveRef,
  useSafeLayoutEffect,
} from "ariakit-utils/hooks";
import {
  CollectionState,
  CollectionStateProps,
  useCollectionState,
} from "../collection/collection-state";
import {
  createNames,
  DeepMap,
  DeepPartial,
  get,
  hasMessages,
  Names,
  set,
  setAll,
  StringLike,
} from "./__utils";

type ErrorMessage = string | undefined | null;
type Callback = () => void | Promise<void>;

type Item = CollectionState["items"][number] & {
  type: "field" | "label" | "description" | "error" | "button";
  name: string;
  id?: string;
};

/**
 * Provides state for the `Form` component.
 * @example
 * ```jsx
 * const form = useFormState({ defaultValues: { email: "" } });
 * <Form state={form}>
 *   <FormLabel name={form.names.email}>Email</FormLabel>
 *   <FormInput name={form.names.email} />
 *   <FormError name={form.names.email} />
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export function useFormState<V = AnyObject>(
  props: FormStateProps<V> = {}
): FormState<V> {
  const collection = useCollectionState(props);
  const defaultValues = useInitialValue(
    props.defaultValues || ({} as FormState<V>["values"])
  );
  const [values, setValues] = useControlledState(
    defaultValues,
    props.values,
    props.setValues
  );
  const defaultErrors = useInitialValue(
    props.defaultErrors || ({} as FormState<V>["errors"])
  );
  const [errors, setErrors] = useControlledState(
    defaultErrors,
    props.errors,
    props.setErrors
  );
  const defaultTouched = useInitialValue(
    props.defaultTouched || ({} as FormState<V>["touched"])
  );
  const [touched, setTouched] = useControlledState(
    defaultTouched,
    props.touched,
    props.setTouched
  );
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSucceed, setSubmitSucceed] = useState(0);
  const [submitFailed, setSubmitFailed] = useState(0);
  const valid = useMemo(() => !hasMessages(errors), [errors]);
  const names = useLazyRef(createNames);
  const submitCallbacks = useLazyRef(() => new Set<Callback>());
  const validateCallbacks = useLazyRef(() => new Set<Callback>());

  const getValue: FormState["getValue"] = useCallback(
    (name) => get(values, name),
    [values]
  );

  const setValue: FormState["setValue"] = useCallback(
    (name, value) =>
      setValues((prevValues) => {
        const prevValue = get(prevValues, name);
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue) return prevValues;
        return set(prevValues, name, nextValue);
      }),
    []
  );

  const pushValue: FormState["pushValue"] = useCallback((name, value) => {
    setValues((prevValues) => {
      const array = get(prevValues, name, [] as unknown[]);
      return set(prevValues, name, [...array, value]);
    });
  }, []);

  const removeValue: FormState["removeValue"] = useCallback((name, index) => {
    setValues((prevValues) => {
      const array = get(prevValues, name, [] as unknown[]);
      return set(prevValues, name, [
        ...array.slice(0, index),
        null,
        ...array.slice(index + 1),
      ]);
    });
  }, []);

  const getError: FormState["getError"] = useCallback(
    (name) => get(errors, name),
    [errors]
  );

  const setError: FormState["setError"] = useCallback(
    (name, error) =>
      setErrors((prevErrors) => {
        const prevError = get(prevErrors, name);
        const nextError = applyState(error, prevError);
        if (nextError === prevError) return prevErrors;
        return set(prevErrors, name, nextError);
      }),
    []
  );

  const getFieldTouched: FormState["getFieldTouched"] = useCallback(
    (name) => !!get(touched, name),
    [touched]
  );

  const setFieldTouched: FormState["setFieldTouched"] = useCallback(
    (name, value) =>
      setTouched((prevTouched) => {
        const prevValue = get(prevTouched, name);
        const nextValue = applyState(value, prevValue);
        if (nextValue === prevValue) return prevTouched;
        return set(prevTouched, name, nextValue);
      }),
    []
  );

  const useValidate: FormState["useValidate"] = useCallback((callback) => {
    useSafeLayoutEffect(() => {
      validateCallbacks.add(callback);
      return () => {
        validateCallbacks.delete(callback);
      };
    }, [callback]);
  }, []);

  const useSubmit: FormState["useSubmit"] = useCallback((callback) => {
    useSafeLayoutEffect(() => {
      submitCallbacks.add(callback);
      return () => {
        submitCallbacks.delete(callback);
      };
    }, [callback]);
  }, []);

  const errorsRef = useLiveRef(errors);

  const validate: FormState["validate"] = useCallback(async () => {
    setValidating(true);
    setErrors(defaultErrors);
    try {
      const callbacks = [...validateCallbacks];
      const results = callbacks.map((callback) => callback());
      await Promise.all(results);
      return !hasMessages(errorsRef.current);
    } finally {
      setValidating(false);
    }
  }, [defaultErrors]);

  const valuesRef = useLiveRef(values);

  const submit: FormState["submit"] = useCallback(async () => {
    setSubmitting(true);
    setTouched(setAll(valuesRef.current, true));
    try {
      if (await validate()) {
        const callbacks = [...submitCallbacks];
        const results = callbacks.map((callback) => callback());
        await Promise.all(results);
        if (!hasMessages(errorsRef.current)) {
          setSubmitSucceed((value) => value + 1);
          return true;
        }
      }
      setSubmitFailed((value) => value + 1);
      return false;
    } catch (error) {
      setSubmitFailed((value) => value + 1);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [validate]);

  const reset = useCallback(() => {
    setValues(defaultValues);
    setErrors(defaultErrors);
    setTouched(defaultTouched);
    setValidating(false);
    setSubmitting(false);
    setSubmitSucceed(0);
    setSubmitFailed(0);
  }, [defaultValues, defaultErrors, defaultTouched]);

  const state = useMemo(
    () => ({
      ...collection,
      values,
      setValues,
      errors,
      setErrors,
      touched,
      setTouched,
      validating,
      submitting,
      submitSucceed,
      submitFailed,
      valid,
      names,
      getValue,
      setValue,
      pushValue,
      removeValue,
      getError,
      setError,
      getFieldTouched,
      setFieldTouched,
      useValidate,
      useSubmit,
      validate,
      submit,
      reset,
    }),
    [
      collection,
      values,
      setValues,
      errors,
      setErrors,
      touched,
      setTouched,
      validating,
      submitting,
      submitSucceed,
      submitFailed,
      valid,
      names,
      getValue,
      setValue,
      pushValue,
      removeValue,
      getError,
      setError,
      getFieldTouched,
      setFieldTouched,
      useValidate,
      useSubmit,
      validate,
      submit,
      reset,
    ]
  );

  return useStorePublisher(state);
}

export type FormState<V = AnyObject> = CollectionState<Item> & {
  /**
   * Form values.
   */
  values: V;
  /**
   * Sets `values`.
   * @example
   * const form = useFormState({ defaultValues: { name: "John" } });
   * // Inside an effect or event callback.
   * form.setValues({ name: "Jane" });
   * form.setValues((prevValues) => ({ ...prevValues, name: "John" }));
   */
  setValues: SetState<FormState<V>["values"]>;
  /**
   * Retrieves a field value.
   * @example
   * const form = useFormState({ defaultValues: { firstName: "John" } });
   * form.getValue(form.names.firstName); // "John"
   */
  getValue: <T = any>(name: StringLike) => T;
  /**
   * Sets a field value.
   * @example
   * const form = useFormState({ defaultValues: { firstName: "John" } });
   * // Inside an effect or event callback.
   * form.setValue(form.names.firstName, "Jane");
   * form.setValue(form.names.firstName, (prevValue) => `${prevValue} Doe`);
   */
  setValue: <T>(name: StringLike, value: SetStateAction<T>) => void;
  /**
   * Pushes a value to an array field.
   * @example
   * const form = useFormState({ defaultValues: { tags: [] } });
   * // Inside an effect or event callback.
   * form.pushValue(form.names.tags, "tag");
   */
  pushValue: <T>(name: StringLike, value: T) => void;
  /**
   * Removes a value from an array field.
   * @example
   * const form = useFormState({ defaultValues: { tags: ["tag"] } });
   * // Inside an effect or event callback.
   * form.removeValue(form.names.tags, 0);
   */
  removeValue: (name: StringLike, index: number) => void;
  /**
   * Form errors.
   */
  errors: DeepPartial<DeepMap<V, ErrorMessage>>;
  /**
   * Sets `errors`.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * // Inside an effect or event callback.
   * form.setErrors({ name: "Name is required" });
   */
  setErrors: SetState<FormState<V>["errors"]>;
  /**
   * Retrieves a field error.
   * @example
   * const form = useFormState({ defaultValues: { email: "" } });
   * form.getError(form.names.email); // undefined
   */
  getError: (name: StringLike) => ErrorMessage;
  /**
   * Sets a field error.
   * @example
   * const form = useFormState({ defaultValues: { email: "" } });
   * form.useValidate(() => {
   *   if (!form.getValue(form.names.email)) {
   *     form.setError(form.names.email, "Email is required");
   *   }
   * });
   */
  setError: (name: StringLike, error: SetStateAction<ErrorMessage>) => void;
  /**
   * The touched state of the form.
   */
  touched: DeepPartial<DeepMap<V, boolean>>;
  /**
   * Sets `touched`.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * // Inside an effect or event callback.
   * form.setTouched({ name: true });
   */
  setTouched: SetState<FormState<V>["touched"]>;
  /**
   * Retrieves a field touched state.
   * @example
   * const form = useFormState({ defaultValues: { email: "" } });
   * form.getFieldTouched(form.names.email); // false
   */
  getFieldTouched: (name: StringLike) => boolean;
  /**
   * Sets a field touched state.
   * @example
   * const form = useFormState({ defaultValues: { email: "" } });
   * // Inside an effect or event callback.
   * form.setFieldTouched(form.names.email, true);
   * form.setFieldTouched(form.names.email, (prevTouched) => !prevTouched);
   */
  setFieldTouched: (name: StringLike, value: SetStateAction<boolean>) => void;
  /**
   * An object containing the names of the form fields.
   * @example
   * const form = useFormState({
   *   defaultValues: { name: { first: "", last: "" } },
   * });
   * form.names.name; // "name"
   * form.names.name.first; // "name.first"
   * form.names.name.last; // "name.last"
   */
  names: Names<V>;
  /**
   * Whether the form is valid.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * form.valid; // true
   * // Inside an effect or event callback.
   * form.setError(form.names.name, "Name is required");
   * // On the next render.
   * form.valid; // false
   */
  valid: boolean;
  /**
   * Whether the form is validating.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * form.validating; // false
   * // Inside an effect or event callback.
   * form.validate();
   * // On the next render.
   * form.validating; // true
   * // On the next render.
   * form.validating; // false
   */
  validating: boolean;
  /**
   * Validates the form by running all validation callbacks passed to
   * `form.useValidate`.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * // Inside an effect or event callback.
   * if (await form.validate()) {
   *   // Form is valid.
   * }
   */
  validate: () => Promise<boolean>;
  /**
   * Custom hook that accepts a callback that will be used to validate the form
   * when `form.validate` is called.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * form.useValidate(async () => {
   *   const errors = await api.validate(form.values);
   *   if (errors) {
   *     form.setErrors(errors);
   *   }
   * });
   */
  useValidate: (callback: Callback) => void;
  /**
   * Whether the form is submitting.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * form.submitting; // false
   * // Inside an effect or event callback.
   * form.submit();
   * // On the next render.
   * form.submitting; // true
   * // On the next render.
   * form.submitting; // false
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
  /**
   * Submits the form by running all submit callbacks passed to
   * `form.useSubmit`. This also triggers validation.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * // Inside an effect or event callback.
   * if (await form.submit()) {
   *   // Form is submitted.
   * }
   */
  submit: () => Promise<boolean>;
  /**
   * Custom hook that accepts a callback that will be used to submit the form
   * when `form.submit` is called.
   * @example
   * const form = useFormState({ defaultValues: { name: "" } });
   * form.useSubmit(async () => {
   *   try {
   *     await api.submit(form.values);
   *   } catch (errors) {
   *     form.setErrors(errors);
   *   }
   * });
   */
  useSubmit: (callback: Callback) => void;
  /**
   * Resets the form to its default values.
   */
  reset: () => void;
};

export type FormStateProps<V = AnyObject> = CollectionStateProps<Item> &
  Partial<
    Pick<
      FormState<V>,
      "values" | "setValues" | "errors" | "setErrors" | "touched" | "setTouched"
    >
  > & {
    /**
     * The default values of the form.
     */
    defaultValues?: V;
    /**
     * The default errors of the form.
     */
    defaultErrors?: FormState<V>["errors"];
    /**
     * The default touched state of the form.
     */
    defaultTouched?: FormState<V>["touched"];
  };
