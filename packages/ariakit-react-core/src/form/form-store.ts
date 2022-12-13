import { useCallback, useMemo } from "react";
import * as Core from "@ariakit/core/form/form-store";
import { StringLike } from "@ariakit/core/form/types";
import {
  CollectionStoreFunctions,
  CollectionStoreOptions,
  CollectionStoreState,
  useCollectionStoreOptions,
  useCollectionStoreProps,
} from "../collection/collection-store";
import { useSafeLayoutEffect } from "../utils/hooks";
import { Store, useStore, useStoreProps } from "../utils/store";

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

export function useFormStore<T extends Values = Values>(
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

export function useFormStore(props: FormStoreProps): FormStore;

export function useFormStore(props: FormStoreProps = {}): FormStore {
  const options = useFormStoreOptions(props);
  const store = useStore(() => Core.createFormStore({ ...props, ...options }));
  return useFormStoreProps(store, props);
}

export type FormStoreItem = Item;

export type FormStoreState<T extends Values = Values> = Core.FormStoreState<T> &
  CollectionStoreState<Item>;

export type FormStoreFunctions<T extends Values = Values> =
  Core.FormStoreFunctions<T> &
    CollectionStoreFunctions<Item> & {
      useValue: <T = any>(name: StringLike) => T;
      useValidate: (callback: Core.FormStoreCallback) => void;
      useSubmit: (callback: Core.FormStoreCallback) => void;
    };

export type FormStoreOptions<T extends Values = Values> =
  Core.FormStoreOptions<T> &
    CollectionStoreOptions<Item> & {
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

export type FormStoreProps<T extends Values = Values> = FormStoreOptions<T> &
  Core.FormStoreProps<T>;

export type FormStore<T extends Values = Values> = FormStoreFunctions<T> &
  Store<Core.FormStore<T>>;
