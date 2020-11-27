import React from "react";
import { createHook } from "reakit-system/createHook";
import {
  StateContext,
  StateContextListener,
  StateContextSubscribe,
} from "./useStateContext";

export type useStateContextProviderHTMLProps = React.HTMLAttributes<any> &
  React.RefAttributes<any> & {
    /**
     * Function returned by the hook to wrap the element to which html props
     * will be passed.
     */
    wrapElement?: (element: React.ReactNode) => React.ReactNode;
  };

export const useStateContextProvider = <O,>(context: StateContext<O>) =>
  createHook<O, useStateContextProviderHTMLProps>({
    name: "StateContextProvider",
    useProps: (options, htmlProps) => {
      const wrapElement = (element: React.ReactNode) => {
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
