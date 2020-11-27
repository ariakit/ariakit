import React from "react";

export type StateContext<O> = React.Context<StateContextValue<O>>;
export type StateContextValue<O> = {
  initialState: O;
  subscribe: StateContextSubscribe<O>;
};
export type StateContextListener<O> = (options: O) => void;
export type StateContextSubscribe<O> = (callback: (options: O) => any) => any;

export function useStateContext<O>(ctx: StateContext<O>): StateContextValue<O> {
  return React.useContext(ctx);
}
