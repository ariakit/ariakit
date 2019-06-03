import * as React from "react";

export type SealedInitialState<T> = T | (() => T);

export function useSealedState<T>(initialState: SealedInitialState<T>) {
  const [sealed] = React.useState(initialState);
  return sealed;
}
