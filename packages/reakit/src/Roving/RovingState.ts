import * as React from "react";

export type unstable_RovingState = {
  /** TODO: Description */
  refs: any[];
  /** TODO: Description */
  enabled: boolean[];
  /** TODO: Description */
  loop: boolean;
  /** TODO: Description */
  currentRef: any;
  /** TODO: Description */
  currentIndex: number;
  /** TODO: Description */
  nextIndex: number;
  /** TODO: Description */
  previousIndex: number;
  /** TODO: Description */
  firstIndex: number;
  /** TODO: Description */
  lastIndex: number;
};

export type unstable_RovingActions = {
  /** TODO: Description */
  register: (ref: any, disabled?: boolean) => void;
  /** TODO: Description */
  unregister: (ref: any) => void;
  /** TODO: Description */
  select: (ref: any) => void;
  /** TODO: Description */
  next: () => void;
  /** TODO: Description */
  previous: () => void;
  /** TODO: Description */
  first: () => void;
  /** TODO: Description */
  last: () => void;
};

export type unstable_RovingStateOptions = Partial<
  Pick<unstable_RovingState, "loop" | "currentIndex">
>;

export type unstable_RovingStateReturn = unstable_RovingState &
  unstable_RovingActions;

type RovingAction =
  | { type: "register"; ref: any; disabled?: boolean }
  | { type: "unregister"; ref: any }
  | { type: "select"; ref: any }
  | { type: "update" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "first" }
  | { type: "last" };

function findNext({ currentIndex, loop, enabled }: unstable_RovingState) {
  if (enabled.filter(Boolean).length === 0) return -1;
  let i = currentIndex;
  do {
    i = loop && i === enabled.length - 1 ? 0 : i + 1;
  } while (i < enabled.length && !enabled[i]);
  return i < enabled.length ? i : -1;
}

function findPrevious({ currentIndex, loop, enabled }: unstable_RovingState) {
  if (enabled.filter(Boolean).length === 0) return -1;
  let i = currentIndex;
  do {
    i = loop && i === 0 ? enabled.length - 1 : i - 1;
  } while (i >= 0 && !enabled[i]);
  return i;
}

function findFirst({ enabled }: unstable_RovingState) {
  let i = 0;
  while (!enabled[i] && i < enabled.length) {
    i += 1;
  }
  return i < enabled.length ? i : -1;
}

function findLast({ enabled }: unstable_RovingState) {
  let i = enabled.length - 1;
  while (!enabled[i] && i >= 0) {
    i -= 1;
  }
  return i;
}

function reducer(
  state: unstable_RovingState,
  action: RovingAction
): unstable_RovingState {
  const {
    refs,
    enabled,
    currentRef,
    currentIndex,
    nextIndex,
    previousIndex,
    firstIndex,
    lastIndex
  } = state;
  switch (action.type) {
    case "register": {
      const { disabled, ref } = action;
      const index = refs.indexOf(ref);
      const nextState =
        index === -1
          ? {
              ...state,
              refs: [...refs, ref],
              enabled: [...enabled, !disabled]
            }
          : {
              ...state,
              refs: [...refs.slice(0, index), ref, ...refs.slice(index + 1)],
              enabled: [
                ...enabled.slice(0, index),
                Boolean(!disabled),
                ...enabled.slice(index + 1)
              ]
            };
      return reducer(nextState, { type: "update" });
    }
    case "unregister": {
      const { ref } = action;
      const index = refs.indexOf(ref);
      if (index === -1) return state;
      const nextState = {
        ...state,
        refs: [...refs.slice(0, index), ...refs.slice(index + 1)],
        enabled: [...enabled.slice(0, index), ...enabled.slice(index + 1)]
      };
      return reducer(nextState, { type: "update" });
    }
    case "select": {
      const { ref } = action;
      const index = refs.indexOf(ref);
      if (!enabled[index]) return state;
      const nextState = {
        ...state,
        currentRef: ref,
        currentIndex: index
      };
      return reducer(nextState, { type: "update" });
    }
    case "update":
      return {
        ...state,
        currentRef: enabled[refs.indexOf(currentRef)] ? currentRef : null,
        currentIndex: enabled[currentIndex] ? currentIndex : -1,
        nextIndex: findNext(state),
        previousIndex: findPrevious(state),
        firstIndex: findFirst(state),
        lastIndex: findLast(state)
      };
    case "next":
      return reducer(state, { type: "select", ref: refs[nextIndex] });
    case "previous":
      return reducer(state, { type: "select", ref: refs[previousIndex] });
    case "first":
      return reducer(state, { type: "select", ref: refs[firstIndex] });
    case "last":
      return reducer(state, { type: "select", ref: refs[lastIndex] });
    default:
      return state;
  }
}

export function useRovingState({
  currentIndex = -1,
  loop = false
}: unstable_RovingStateOptions = {}): unstable_RovingStateReturn {
  const [state, dispatch] = React.useReducer(reducer, {
    loop,
    currentIndex,
    currentRef: null,
    refs: [],
    enabled: [],
    nextIndex: -1,
    previousIndex: -1,
    firstIndex: -1,
    lastIndex: -1
  });
  return {
    ...state,
    register: React.useCallback(
      (ref, disabled) => dispatch({ type: "register", ref, disabled }),
      []
    ),
    unregister: React.useCallback(
      ref => dispatch({ type: "unregister", ref }),
      []
    ),
    select: React.useCallback(ref => dispatch({ type: "select", ref }), []),
    next: React.useCallback(() => dispatch({ type: "next" }), []),
    previous: React.useCallback(() => dispatch({ type: "previous" }), []),
    first: React.useCallback(() => dispatch({ type: "first" }), []),
    last: React.useCallback(() => dispatch({ type: "last" }), [])
  };
}

const keys: Array<keyof unstable_RovingStateReturn> = [
  "refs",
  "enabled",
  "loop",
  "currentRef",
  "currentIndex",
  "nextIndex",
  "previousIndex",
  "firstIndex",
  "lastIndex",
  "register",
  "unregister",
  "select",
  "next",
  "previous",
  "first",
  "last"
];

useRovingState.keys = keys;
