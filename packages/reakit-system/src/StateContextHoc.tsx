import React from "react";
import { unstable_useId as useId } from "reakit/Id";

export const StateContextHoc = (Comp, ctx) => (props) => {
  const context = React.useContext(ctx);

  let subscribe;
  let initialState;
  if (context) {
    const { subscribe: _subscribe, ..._initialState } = context;
    subscribe = _subscribe;
    initialState = _initialState;
  }

  const { id } = useId({ ...initialState, ...props });
  const [state, setState] = React.useState(initialState);

  React.useEffect(
    () =>
      subscribe
        ? subscribe((nextState) => {
            if (
              state.currentId === null ||
              id === state.currentId ||
              id === nextState.currentId
            ) {
              setState(nextState);
            }
          })
        : undefined,
    [subscribe, state?.currentId, id, props.id]
  );

  return <Comp {...state} {...props} id={id} />;
};
