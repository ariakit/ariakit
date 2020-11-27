import React from "react";
import { createHook } from "./createHook";
import {
  StateContext,
  StateContextListener,
  StateContextSubscribe,
} from "./useStateContext";

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
