import * as React from "react";
import {
  unstable_SealedInitialState,
  unstable_useSealedState
} from "reakit/utils/useSealedState";

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
  initialState: unstable_SealedInitialState<PlaygroundInitialState> = {}
): PlaygroundStateReturn {
  const { code: initialCode = "" } = unstable_useSealedState(initialState);
  const [code, update] = React.useState(initialCode);
  return { code, update };
}

const keys: Array<keyof PlaygroundStateReturn> = ["code", "update"];

usePlaygroundState.__keys = keys;
