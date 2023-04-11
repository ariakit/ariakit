import _useLocalStorageState from "use-local-storage-state";

export const useLocalStorageState =
  _useLocalStorageState as unknown as (typeof _useLocalStorageState)["default"];
