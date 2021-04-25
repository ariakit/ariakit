import * as React from "react";
import { InitialState, useInitialValue } from "reakit-utils";

export type PlaygroundState = {
  /** TODO: Description */
  code: string;
};

export type PlaygroundActions = {
  /** TODO: Description */
  update: React.Dispatch<React.SetStateAction<string>>;
};

export type PlaygroundInitialState = Partial<PlaygroundState>;

export type PlaygroundStateReturn = PlaygroundState & PlaygroundActions;

export function usePlaygroundState(
  initialState: InitialState<PlaygroundInitialState> = {}
): PlaygroundStateReturn {
  const { code: initialCode = "" } = useInitialValue(initialState);
  const [code, update] = React.useState(initialCode);
  return { code, update };
}

const keys: Array<keyof PlaygroundStateReturn> = ["code", "update"];

usePlaygroundState.__keys = keys;
