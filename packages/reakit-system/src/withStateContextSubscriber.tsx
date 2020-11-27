import React from "react";
import { unstable_useId as useId } from "reakit/Id";
import { createHook } from "./createHook";
import { useStateContext } from "./useStateContext";

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

export const useStateContextProvider = <O,>(context: StateContext<O>) =>
  createHook<{}, {}>({
    name: "StateContextProvider",
    useProps: (options, htmlProps) => {
      const wrapElement = (element) => {
        const initialState = React.useRef<O>();
        if (!initialState.current) {
          initialState.current = options;
        }

        if (htmlProps.wrapElement) {
          element = htmlProps.wrapElement(element);
        }
        const listenersRef = React.useRef(new Set<StateContextListener<O>>());

        const subscribe: StateContextSubscribe<O> = React.useCallback(
          (listener: StateContextListener<O>) => {
            listenersRef.current.add(listener);
            return () => listenersRef.current.delete(listener);
          },
          []
        );

        React.useEffect(() => {
          for (const listener of listenersRef.current) {
            listener(options);
          }
        }, [options]);

        const value = React.useMemo(
          () => ({ initialState: initialState.current as O, subscribe }),
          [initialState.current, subscribe]
        );
        element = React.createElement(context.Provider, { value }, element);
        return element;
      };

      return {
        ...htmlProps,
        wrapElement,
      };
    },
  });

export const useStateContextSubscribe = <O,>(ctx: StateContext<O>) =>
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
