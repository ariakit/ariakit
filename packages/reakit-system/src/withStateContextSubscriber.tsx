import React from "react";
import { unstable_useId as useId } from "reakit/Id";

export type StateContext<O> = React.Context<StateContextValue<O>>;
export type StateContextValue<O> = {
  initialState: O;
  subscribe: StateContextSubscribe<O>;
};
export type StateContextListener<O> = (options: O) => void;
export type StateContextSubscribe<O> = (callback: (options: O) => any) => any;

export function withStateContextSubscriber<
  T extends React.ComponentType<any>,
  O extends React.HTMLAttributes<any>
>(Comp: T, ctx: StateContext<O>): T {
  const inner = (props: O) => {
    const context = React.useContext(ctx);

    let subscribe: StateContextSubscribe<O> | null = null;
    let initialState: O = {} as O;
    if (context) {
      const { subscribe: _subscribe, initialState: _initialState } = context;
      subscribe = _subscribe;
      initialState = _initialState;
    }

    const { id } = useId({ ...initialState, ...props });
    const [state, setState] = React.useState<any>(initialState);

    React.useEffect(
      () =>
        subscribe
          ? subscribe((nextState: any) => {
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

  return (inner as unknown) as T;
}
