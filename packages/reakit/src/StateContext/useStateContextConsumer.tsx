import React from "react";
import { unstable_useId as useId } from "reakit/Id";
import { createHook } from "reakit-system/createHook";
import {
  StateContext,
  StateContextSubscribe,
  useStateContext,
} from "./useStateContext";

export const useStateContextConsumer = <O,>(ctx: StateContext<O>) =>
  createHook<{}, React.HTMLAttributes<any>>({
    name: "StateContextSubscribe",

    useOptions(options, htmlProps) {
      const context = useStateContext(ctx);

      let subscribe: StateContextSubscribe<O> | null = null;
      let initialState: O = {} as O;
      if (context) {
        const { subscribe: _subscribe, initialState: _initialState } = context;
        subscribe = _subscribe;
        initialState = _initialState;
      }

      const { id } = useId({ ...initialState, ...options, ...htmlProps });
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
        [subscribe, state?.currentId, id, htmlProps.id]
      );

      return { ...options, ...state };
    },
  });
