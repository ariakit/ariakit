import React from "react";
import { StateContext } from "./useStateContext";

export function createStateContext<O>(): StateContext<O> {
  return (React.createContext({
    initialState: {},
    subscribe: () => {},
  }) as unknown) as StateContext<O>;
}
