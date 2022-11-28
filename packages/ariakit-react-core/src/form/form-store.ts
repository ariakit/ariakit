import { useCallback, useMemo } from "react";
import {
  FormStore as CoreFormStore,
  FormStoreProps as CoreFormStoreProps,
  FormStoreCallback,
  FormStoreItem,
  FormStoreState,
  FormStoreValues,
  createFormStore,
} from "@ariakit/core/form/form-store";
import { StringLike } from "@ariakit/core/form/types";
import { Store as CoreStore } from "@ariakit/core/utils/store";
import {
  CollectionStoreProps,
  useCollectionStoreOptions,
  useCollectionStoreProps,
} from "../collection/collection-store";
import { useSafeLayoutEffect } from "../utils/hooks";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useFormStoreOptions(props: FormStoreProps) {
  return {
    ...useCollectionStoreOptions(props),
    values: props.values ?? props.getState?.().values ?? props.defaultValues,
    errors: props.errors ?? props.getState?.().errors ?? props.defaultErrors,
    touched:
      props.touched ?? props.getState?.().touched ?? props.defaultTouched,
  };
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
    useSafeLayoutEffect(
      () => store.registerValidateCallback(callback),
      [callback]
    );
  }, []);

  const useSubmit = useCallback<FormStore["useSubmit"]>((callback) => {
    useSafeLayoutEffect(
      () => store.registerSubmitCallback(callback),
      [callback]
    );
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

export function useFormStore<T extends FormStoreValues = FormStoreValues>(
  props: FormStoreProps<T> = {}
): FormStore<T> {
  const options = useFormStoreOptions(props);
  const store = useStore(() => createFormStore({ ...props, ...options }));
  return useFormStoreProps(store, props);
}

export type { FormStoreState, FormStoreItem, FormStoreValues };

export type FormStore<T extends FormStoreValues = FormStoreValues> = Store<
  CoreFormStore<T>
> & {
  useValue: <T = any>(name: StringLike) => T;
  useValidate: (callback: FormStoreCallback) => void;
  useSubmit: (callback: FormStoreCallback) => void;
};

export type FormStoreProps<T extends FormStoreValues = FormStoreValues> = Omit<
  CollectionStoreProps<FormStoreItem>,
  keyof CoreStore
> &
  CoreFormStoreProps<T> & {
    /**
     * The default values of the form.
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
    /**
     * Function that will be called when setting the form `values` state.
     * @example
     * // Uncontrolled example
     * useFormStore({ setValues: (values) => console.log(values) });
     * @example
     * // Controlled example
     * const [values, setValues] = useState({});
     * useFormStore({ values, setValues });
     * @example
     * // Externally controlled example
     * function MyForm({ values, onChange }) {
     *   const form = useFormStore({ values, setValues: onChange });
     * }
     */
    setValues?: (values: FormStoreState<T>["values"]) => void;
    /**
     * Function that will be called when setting the form `errors` state.
     * @example
     * useFormStore({ setErrors: (errors) => console.log(errors) });
     */
    setErrors?: (errors: FormStoreState<T>["errors"]) => void;
    /**
     * Function that will be called when setting the form `touched` state.
     * @example
     * useFormStore({ setTouched: (touched) => console.log(touched) });
     */
    setTouched?: (touched: FormStoreState<T>["touched"]) => void;
  };
