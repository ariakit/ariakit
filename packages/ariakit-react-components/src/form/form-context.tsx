import type { StringLike } from "@ariakit/components/form/types";
import { createStoreContext, useId } from "@ariakit/react-utils";
import { invariant } from "@ariakit/utils";
import { useCallback, useRef } from "react";
import {
  CollectionContextProvider,
  CollectionScopedContextProvider,
} from "../collection/collection-context.tsx";
import type { CollectionItemOptions } from "../collection/collection-item.tsx";
import type { FormStore, FormStoreItem } from "./form-store.ts";

type FormItemType = FormStoreItem["type"];
type FormItemGetItem = NonNullable<CollectionItemOptions["getItem"]>;

interface FormItemContextOptions {
  store?: FormStore;
  name: StringLike;
  component: string;
}

const ctx = createStoreContext<FormStore>(
  [CollectionContextProvider],
  [CollectionScopedContextProvider],
);

/**
 * Returns the form store from the nearest form container.
 * @example
 * function FormInput() {
 *   const store = useFormContext();
 *
 *   if (!store) {
 *     throw new Error("FormInput must be wrapped in FormProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useFormContext = ctx.useContext;

export function useFormItemContext({
  store,
  name: nameProp,
  component,
}: FormItemContextOptions) {
  const context = useFormContext();
  const form = store || context;

  invariant(
    form,
    process.env.NODE_ENV !== "production" &&
      `${component} must be wrapped in a Form component.`,
  );

  const name = String(nameProp);

  return { store: form, name };
}

interface FormItemOptions extends FormItemContextOptions {
  id?: string;
  type: FormItemType;
  getItem?: CollectionItemOptions["getItem"];
}

export function useFormItem<T extends HTMLElement>({
  id: idProp,
  type,
  getItem: getItemProp,
  ...options
}: FormItemOptions) {
  const { store, name } = useFormItemContext(options);
  const id = useId(idProp);
  const ref = useRef<T>(null);

  const getItem = useCallback<FormItemGetItem>(
    (item) => {
      const nextItem = { ...item, id: id || item.id, name, type };
      if (getItemProp) {
        return getItemProp(nextItem);
      }
      return nextItem;
    },
    [id, name, type, getItemProp],
  );

  return { store, name, id, ref, getItem };
}

export const useFormScopedContext = ctx.useScopedContext;

export const useFormProviderContext = ctx.useProviderContext;

export const FormContextProvider = ctx.ContextProvider;

export const FormScopedContextProvider = ctx.ScopedContextProvider;
