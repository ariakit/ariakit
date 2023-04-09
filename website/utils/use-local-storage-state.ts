import type { Dispatch, SetStateAction } from "react";
// @ts-expect-error
import _useLocalStorageState from "use-local-storage-state";

export type LocalStorageOptions<T> = {
  defaultValue?: T | (() => T);
  storageSync?: boolean;
  serializer?: {
    stringify: (value: unknown) => string;
    parse: (value: string) => unknown;
  };
};
export type LocalStorageState<T> = [
  T,
  Dispatch<SetStateAction<T>>,
  {
    isPersistent: boolean;
    removeItem: () => void;
  }
];
export default function useLocalStorageState(
  key: string,
  options?: Omit<LocalStorageOptions<unknown>, "defaultValue">
): LocalStorageState<unknown>;
export default function useLocalStorageState<T>(
  key: string,
  options?: Omit<LocalStorageOptions<T | undefined>, "defaultValue">
): LocalStorageState<T | undefined>;
export default function useLocalStorageState<T>(
  key: string,
  options?: LocalStorageOptions<T>
): LocalStorageState<T>;
export default function useLocalStorageState(
  key: string,
  options: LocalStorageOptions<unknown> = {}
) {
  return _useLocalStorageState(key, options);
}
