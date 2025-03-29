import { useEvent } from "@ariakit/react-core/utils/hooks";
import * as React from "react";

function isUpdater<T>(value: T | ((prev: T) => T)): value is (prev: T) => T {
  return typeof value === "function";
}

/**
 * A hook that creates a state that can be either controlled or uncontrolled.
 * @param state The controlled state value
 * @param setState The controlled state setter function that accepts a direct
 * value
 * @param defaultState The default state value when uncontrolled
 * @returns A tuple containing the current state value and a setter function
 * that supports both direct values and updater functions
 */
export function useControllableState<T>(
  defaultState: T | (() => T),
  state?: T,
  setState?: (value: T) => void,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [internalState, setInternalState] = React.useState<T>(
    state ?? defaultState,
  );

  const isControlled = state !== undefined;
  const currentState = isControlled ? state : internalState;

  const currentSetState = useEvent((value: T | ((prev: T) => T)) => {
    if (!isControlled) {
      return setInternalState(value);
    }
    if (isUpdater(value)) {
      value = value(currentState);
    }
    setState?.(value);
  });

  return [currentState, currentSetState];
}
