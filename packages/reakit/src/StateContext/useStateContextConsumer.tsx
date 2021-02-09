import React from "react";
import { unstable_useId as useId } from "reakit/Id";
import { createHook } from "reakit-system/createHook";
import {
  StateContext,
  StateContextSubscribe,
  useStateContext,
} from "./useStateContext";

export const useStateContextConsumer = <O,>({
  context,
  shouldUpdate,
  updateDependencies = () => [],
}: {
  context: StateContext<O>;
  shouldUpdate: (id: string | undefined, state: O, nextState: O) => boolean;
  updateDependencies: (state: O) => any[];
}) =>
  createHook<O, React.HTMLAttributes<any>>({
    name: "StateContextConsumer",

    useOptions(options, htmlProps) {
      const ctx = useStateContext(context);

      let subscribe: StateContextSubscribe<O> | null = null;
      let initialState: O = {} as O;
      if (ctx) {
        const { subscribe: _subscribe, initialState: _initialState } = ctx;
        subscribe = _subscribe;
        initialState = _initialState;
      }

      const { id } = useId({ ...initialState, ...options, ...htmlProps });
      const [state, setState] = React.useState<any>(initialState);

      React.useEffect(
        () =>
          subscribe
            ? subscribe((nextState: any) => {
                if (shouldUpdate(id, state, nextState)) {
                  setState(nextState);
                }
              })
            : undefined,
        [subscribe, id, htmlProps.id, ...updateDependencies(state)]
      );
      return { ...state, ...options, id };
    },
  });
