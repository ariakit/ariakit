import React from "react";
import { StateContext, StateContextValue } from "./withStateContextSubscriber";

export function useStateContext<O>(ctx: StateContext<O>): StateContextValue<O> {
  return React.useContext(ctx);
}
