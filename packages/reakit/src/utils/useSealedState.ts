import * as React from "react";

export type unstable_SealedInitialState<T> = T | (() => T);

export function unstable_useSealedState<T>(
  initialState: unstable_SealedInitialState<T>
) {
  const [sealed] = React.useState(initialState);
  return sealed;
}
