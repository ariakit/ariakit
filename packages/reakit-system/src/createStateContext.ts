import React from "react";
import { StateContext } from "./withStateContextSubscriber";

export function createStateContext<O>(): StateContext<O> {
  return (React.createContext({
    initialState: {},
    subscribe: () => {},
  }) as unknown) as StateContext<O>;
}
