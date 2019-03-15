import * as React from "react";

export type unstable_RoverState = {
  /** TODO: Description */
  orientation?: "horizontal" | "vertical";
  /** TODO: Description */
  refs: any[];
  /** TODO: Description */
  enabled: boolean[];
  /** TODO: Description */
  activeRef: any;
  /** TODO: Description */
  lastActiveRef: any;
  /** TODO: Description */
  loop: boolean;
};

export type unstable_RoverSelectors = {
  /** TODO: Description */
  getNext: (ref?: any) => any;
  /** TODO: Description */
  getPrevious: (ref?: any) => any;
  /** TODO: Description */
  getFirst: () => any;
  /** TODO: Description */
  getLast: () => any;
};

export type unstable_RoverActions = {
  /** TODO: Description */
  register: (ref: any, disabled?: boolean) => void;
  /** TODO: Description */
  unregister: (ref: any) => void;
  /** TODO: Description */
  moveTo: (ref: any) => void;
  /** TODO: Description */
  next: () => void;
  /** TODO: Description */
  previous: () => void;
  /** TODO: Description */
  first: () => void;
  /** TODO: Description */
  last: () => void;
  /** TODO: Description */
  orientate: (orientation: unstable_RoverState["orientation"]) => void;
};

export type unstable_RoverInitialState = Partial<
  Pick<unstable_RoverState, "orientation" | "activeRef" | "loop">
>;

export type unstable_RoverStateReturn = unstable_RoverState &
  unstable_RoverSelectors &
  unstable_RoverActions;

type RoverAction =
  | { type: "register"; ref: any; disabled?: boolean }
  | { type: "unregister"; ref: any }
  | { type: "sync"; activeRef: any; lastActiveRef: any }
  | { type: "moveTo"; ref: any }
  | { type: "next" }
  | { type: "previous" }
  | { type: "first" }
  | { type: "last" }
  | {
      type: "orientate";
      orientation?: unstable_RoverState["orientation"];
    };

function getNext({
  refs,
  enabled,
  loop,
  activeRef
}: Pick<unstable_RoverState, "refs" | "enabled" | "loop" | "activeRef">) {
  if (!enabled.find(Boolean)) return null;
  const index = refs.indexOf(activeRef);
  const reordered = [
    ...refs.slice(index + 1),
    ...(loop ? refs.slice(0, index) : [])
  ];
  return reordered.find(r => enabled[refs.indexOf(r)]);
}

function getPrevious({
  refs,
  enabled,
  ...state
}: Pick<unstable_RoverState, "refs" | "enabled" | "loop" | "activeRef">) {
  return getNext({
    refs: refs.slice().reverse(),
    enabled: enabled.slice().reverse(),
    ...state
  });
}

function getFirst({
  refs,
  enabled
}: Pick<unstable_RoverState, "refs" | "enabled">) {
  return refs.find((_, i) => enabled[i]);
}

function getLast({
  refs,
  enabled
}: Pick<unstable_RoverState, "refs" | "enabled">) {
  return getFirst({
    refs: refs.slice().reverse(),
    enabled: enabled.slice().reverse()
  });
}

function reducer(
  state: unstable_RoverState,
  action: RoverAction
): unstable_RoverState {
  const { refs, enabled, activeRef, lastActiveRef } = state;

  switch (action.type) {
    case "register": {
      const { disabled, ref } = action;
      const index = refs.indexOf(ref);
      let nextState = {} as unstable_RoverState;

      if (index === -1) {
        // create
        nextState = {
          ...state,
          refs: [...refs, ref],
          enabled: [...enabled, !disabled]
        };
      } else {
        // update
        nextState = {
          ...state,
          enabled: [
            ...enabled.slice(0, index),
            !disabled,
            ...enabled.slice(index + 1)
          ]
        };
      }

      if (disabled && lastActiveRef === ref) {
        nextState = { ...nextState, lastActiveRef: null };
      }

      if (disabled && activeRef === ref) {
        nextState = reducer(nextState, {
          type: "moveTo",
          ref:
            nextState.lastActiveRef || getNext(nextState) || getFirst(nextState)
        });
      }

      return nextState;
    }
    case "unregister": {
      const { ref } = action;
      const index = refs.indexOf(ref);
      if (index === -1) return state;

      let nextState = {
        ...state,
        refs: [...refs.slice(0, index), ...refs.slice(index + 1)],
        enabled: [...enabled.slice(0, index), ...enabled.slice(index + 1)],
        lastActiveRef: lastActiveRef === ref ? null : lastActiveRef
      };

      if (activeRef === ref) {
        nextState = reducer(nextState, {
          type: "moveTo",
          ref:
            nextState.lastActiveRef || getNext(nextState) || getFirst(nextState)
        });
      }

      return nextState;
    }
    case "moveTo": {
      const { ref } = action;
      const index = refs.indexOf(ref);
      if (!enabled[index]) return state;
      return {
        ...state,
        activeRef: ref,
        lastActiveRef: enabled[refs.indexOf(activeRef)]
          ? activeRef
          : lastActiveRef
      };
    }
    case "next":
      return reducer(state, { type: "moveTo", ref: getNext(state) });
    case "previous":
      return reducer(state, { type: "moveTo", ref: getPrevious(state) });
    case "first":
      return reducer(state, { type: "moveTo", ref: getFirst(state) });
    case "last":
      return reducer(state, { type: "moveTo", ref: getLast(state) });
    case "orientate":
      return { ...state, orientation: action.orientation };
    default:
      return state;
  }
}

export function useRoverState({
  orientation = "horizontal",
  activeRef = null,
  loop = false
}: unstable_RoverInitialState = {}): unstable_RoverStateReturn {
  const [state, dispatch] = React.useReducer(reducer, {
    orientation,
    refs: [],
    enabled: [],
    activeRef,
    lastActiveRef: null,
    loop
  });

  return {
    ...state,
    getNext: React.useCallback(
      (ref = state.activeRef) =>
        getNext({
          refs: state.refs,
          enabled: state.enabled,
          loop: state.loop,
          activeRef: ref
        }),
      [state.refs, state.enabled, state.loop, state.activeRef]
    ),
    getPrevious: React.useCallback(
      (ref = state.activeRef) =>
        getPrevious({
          refs: state.refs,
          enabled: state.enabled,
          loop: state.loop,
          activeRef: ref
        }),
      [state.refs, state.enabled, state.loop, state.activeRef]
    ),
    getFirst: React.useCallback(
      () => getFirst({ refs: state.refs, enabled: state.enabled }),
      [state.refs, state.enabled]
    ),
    getLast: React.useCallback(
      () => getLast({ refs: state.refs, enabled: state.enabled }),
      [state.refs, state.enabled]
    ),
    register: React.useCallback(
      (ref, disabled) => dispatch({ type: "register", ref, disabled }),
      []
    ),
    unregister: React.useCallback(
      ref => dispatch({ type: "unregister", ref }),
      []
    ),
    moveTo: React.useCallback(ref => dispatch({ type: "moveTo", ref }), []),
    next: React.useCallback(() => dispatch({ type: "next" }), []),
    previous: React.useCallback(() => dispatch({ type: "previous" }), []),
    first: React.useCallback(() => dispatch({ type: "first" }), []),
    last: React.useCallback(() => dispatch({ type: "last" }), []),
    orientate: React.useCallback(
      o => dispatch({ type: "orientate", orientation: o }),
      []
    )
  };
}

const keys: Array<keyof unstable_RoverStateReturn> = [
  "orientation",
  "refs",
  "enabled",
  "activeRef",
  "lastActiveRef",
  "loop",
  "getNext",
  "getPrevious",
  "getFirst",
  "getLast",
  "register",
  "unregister",
  "moveTo",
  "next",
  "previous",
  "first",
  "last",
  "orientate"
];

useRoverState.keys = keys;
