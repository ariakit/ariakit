// TODO: Refactor
import * as React from "react";
import { omit } from "../__utils/omit";

export type unstable_StepState = {
  /**
   * The first index becomes the next one when the last one is active.
   * The last index becomes the previous one when the first one is active.
   */
  loop: boolean;
  /** List of ids */
  ids: string[];
  /** Active step index */
  activeIndex: number;
  /** Map between ids and orders */
  ordered: {
    [key: string]: number;
  };
};

export type unstable_StepSelectors = {
  /** TODO: Description */
  getActiveId: () => string;
  /** TODO: Description */
  hasPrevious: () => boolean;
  /** TODO: Description */
  hasNext: () => boolean;
  /** TODO: Description */
  indexOf: (idOrIndex: string | number) => number;
  /** TODO: Description */
  isActive: (idOrIndex: string | number) => boolean;
};

export type unstable_StepActions = {
  /** TODO: Description */
  goto: (idOrIndex: string | number) => void;
  /** TODO: Description */
  previous: () => void;
  /** TODO: Description */
  next: () => void;
  /** TODO: Description */
  reorder: (id: string, order?: number) => void;
  /** TODO: Description */
  register: (id: string, order?: number) => void;
  /** TODO: Description */
  unregister: (id: string) => void;
};

// TODO: Accept function for the entire options or for each value
export type unstable_StepStateOptions = Partial<unstable_StepState>;

export type unstable_StepStateReturn = unstable_StepState &
  unstable_StepSelectors &
  unstable_StepActions;

type StepAction =
  | { type: "goto"; idOrIndex: string | number }
  | { type: "previous" }
  | { type: "next" }
  | { type: "reorder"; id: string; order: number }
  | { type: "register"; id: string; order: number }
  | { type: "unregister"; id: string };

function getActiveId(state: unstable_StepState) {
  return state.ids[state.activeIndex];
}

function hasPrevious(state: unstable_StepState) {
  return state.ids.length > 1 && Boolean(state.ids[state.activeIndex - 1]);
}

function hasNext(state: unstable_StepState) {
  return state.ids.length > 1 && Boolean(state.ids[state.activeIndex + 1]);
}

function indexOf(state: unstable_StepState, idOrIndex: string | number) {
  return typeof idOrIndex === "number"
    ? idOrIndex
    : state.ids.indexOf(idOrIndex);
}

function isActive(state: unstable_StepState, idOrIndex: string | number) {
  return (
    state.activeIndex >= 0 && state.activeIndex === indexOf(state, idOrIndex)
  );
}

function reducer(
  state: unstable_StepState,
  action: StepAction
): unstable_StepState {
  switch (action.type) {
    case "goto": {
      return {
        ...state,
        activeIndex: indexOf(state, action.idOrIndex)
      };
    }

    case "previous": {
      if (hasPrevious(state)) {
        return {
          ...state,
          activeIndex: state.activeIndex - 1
        };
      }
      if (state.loop && state.ids.length > 1) {
        return {
          ...state,
          activeIndex: state.ids.length - 1
        };
      }
      return state;
    }

    case "next": {
      if (hasNext(state)) {
        return {
          ...state,
          activeIndex: state.activeIndex + 1
        };
      }
      if (state.loop && state.ids.length > 1) {
        return {
          ...state,
          activeIndex: 0
        };
      }
      return state;
    }

    case "reorder": {
      const nextOrdered = { ...state.ordered, [action.id]: action.order };
      const nextIds = [...state.ids].sort(
        (a, b) => (nextOrdered[a] || 0) - (nextOrdered[b] || 0)
      );
      const nextState = { ...state, ordered: nextOrdered, ids: nextIds };
      return {
        ...nextState,
        activeIndex: isActive(nextState, action.id)
          ? nextIds.indexOf(action.id)
          : nextState.activeIndex
      };
    }

    case "register": {
      const nextIds =
        indexOf(state, action.id) >= 0 ? state.ids : [...state.ids, action.id];
      const nextState = { ...state, ids: nextIds };
      return reducer(nextState, {
        type: "reorder",
        id: action.id,
        order: action.order
      });
    }

    case "unregister": {
      const index = indexOf(state, action.id);
      if (index === -1) return state;

      const nextOrdered = omit(state.ordered, [state.ids[index]]);
      const nextIds = [
        ...state.ids.slice(0, index),
        ...state.ids.slice(index + 1)
      ];

      const nextState = { ...state, ordered: nextOrdered, ids: nextIds };

      if (isActive(state, action.id) && !hasNext(state)) {
        if (hasPrevious(state)) {
          return {
            ...reducer(state, { type: "previous" }),
            ...nextState
          };
        }
        return {
          ...nextState,
          activeIndex: -1
        };
      }
      if (state.activeIndex >= nextIds.length) {
        return {
          ...nextState,
          activeIndex: nextIds.length - 1
        };
      }
      return nextState;
    }

    default: {
      return state;
    }
  }
}

export function useStepState({
  loop = false,
  ids = [],
  activeIndex = -1,
  ordered = {}
}: unstable_StepStateOptions = {}): unstable_StepStateReturn {
  const [state, dispatch] = React.useReducer(reducer, {
    loop,
    ids,
    activeIndex,
    ordered
  });

  return {
    ...state,
    getActiveId: () => getActiveId(state),
    hasPrevious: () => hasPrevious(state),
    hasNext: () => hasNext(state),
    indexOf: idOrIndex => indexOf(state, idOrIndex),
    isActive: idOrIndex => isActive(state, idOrIndex),
    goto: React.useCallback(
      idOrIndex => dispatch({ type: "goto", idOrIndex }),
      []
    ),
    previous: React.useCallback(() => dispatch({ type: "previous" }), []),
    next: React.useCallback(() => dispatch({ type: "next" }), []),
    reorder: React.useCallback(
      (id, order = 0) => dispatch({ type: "reorder", id, order }),
      []
    ),
    register: React.useCallback(
      (id, order = 0) => dispatch({ type: "register", id, order }),
      []
    ),
    unregister: React.useCallback(
      id => dispatch({ type: "unregister", id }),
      []
    )
  };
}

const keys: Array<keyof unstable_StepStateReturn> = [
  "loop",
  "ids",
  "activeIndex",
  "ordered",
  "getActiveId",
  "hasPrevious",
  "hasNext",
  "indexOf",
  "isActive",
  "goto",
  "previous",
  "next",
  "reorder",
  "register",
  "unregister"
];

useStepState.keys = keys;
