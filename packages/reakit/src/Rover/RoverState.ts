// Credits: https://github.com/stevejay/react-roving-tabindex
import * as React from "react";
import { warning } from "../__utils/warning";
import { SealedInitialState, useSealedState } from "../__utils/useSealedState";

type Stop = {
  id: string;
  ref: React.RefObject<HTMLElement>;
};

export type unstable_RoverState = {
  /** TODO: Description */
  orientation?: "horizontal" | "vertical";
  /** TODO: Description */
  stops: Stop[];
  /** TODO: Description */
  currentId: Stop["id"] | null;
  /** TODO: Description */
  pastId: Stop["id"] | null;
  /** TODO: Description */
  loop: boolean;
};

export type unstable_RoverActions = {
  /** TODO: Description */
  register: (id: Stop["id"], ref: Stop["ref"]) => void;
  /** TODO: Description */
  unregister: (id: Stop["id"]) => void;
  /** TODO: Description */
  move: (id: Stop["id"]) => void;
  /** TODO: Description */
  next: () => void;
  /** TODO: Description */
  previous: () => void;
  /** TODO: Description */
  first: () => void;
  /** TODO: Description */
  last: () => void;
  /** TODO: Description */
  reset: () => void;
  /** TODO: Description */
  orientate: (orientation: unstable_RoverState["orientation"]) => void;
};

export type unstable_RoverInitialState = Partial<
  Pick<unstable_RoverState, "orientation" | "currentId" | "loop">
>;

export type unstable_RoverStateReturn = unstable_RoverState &
  unstable_RoverActions;

type RoverAction =
  | { type: "register"; id: Stop["id"]; ref: Stop["ref"] }
  | { type: "unregister"; id: Stop["id"] }
  | { type: "move"; id: Stop["id"] | null }
  | { type: "next" }
  | { type: "previous" }
  | { type: "first" }
  | { type: "last" }
  | { type: "reset" }
  | {
      type: "orientate";
      orientation?: unstable_RoverState["orientation"];
    };

function reducer(
  state: unstable_RoverState,
  action: RoverAction
): unstable_RoverState {
  const { stops, currentId, pastId, loop } = state;

  switch (action.type) {
    case "register": {
      const { id, ref } = action;
      if (stops.length === 0) {
        return {
          ...state,
          stops: [{ id, ref }]
        };
      }

      const index = stops.findIndex(stop => stop.id === id);

      if (index >= 0) {
        warning(false, `${id} stop is already registered`, "RoverState");
        return state;
      }

      const afterRefIndex = stops.findIndex(stop => {
        if (!stop.ref.current || !ref.current) return false;
        return Boolean(
          stop.ref.current.compareDocumentPosition(ref.current) &
            Node.DOCUMENT_POSITION_PRECEDING
        );
      });

      if (afterRefIndex === -1) {
        return {
          ...state,
          stops: [...stops, { id, ref }]
        };
      }
      return {
        ...state,
        stops: [
          ...stops.slice(0, afterRefIndex),
          { id, ref },
          ...stops.slice(afterRefIndex)
        ]
      };
    }
    case "unregister": {
      const { id } = action;
      const nextStops = stops.filter(stop => stop.id !== id);
      if (nextStops.length === stops.length) {
        warning(false, `${id} stop is not registered`, "RoverState");
        return state;
      }

      return {
        ...state,
        stops: nextStops,
        pastId: pastId && pastId === id ? null : pastId,
        currentId: currentId && currentId === id ? null : currentId
      };
    }
    case "move": {
      const { id } = action;
      const index = stops.findIndex(stop => stop.id === id);

      if (index === -1 || stops[index].id === currentId) {
        return state;
      }

      return {
        ...state,
        currentId: stops[index].id,
        pastId: currentId
      };
    }
    case "next": {
      if (currentId == null) {
        return reducer(state, { type: "move", id: stops[0] && stops[0].id });
      }
      const index = stops.findIndex(stop => stop.id === currentId);

      // If loop is truthy, turns [0, currentId, 2, 3] into [currentId, 2, 3, 0]
      // Otherwise turns into [currentId, 2, 3]
      const reorderedStops = [
        ...stops.slice(index + 1),
        ...(loop ? stops.slice(0, index) : [])
      ];

      const nextIndex =
        reorderedStops.findIndex(stop => stop.id === currentId) + 1;

      return reducer(state, {
        type: "move",
        id: reorderedStops[nextIndex] && reorderedStops[nextIndex].id
      });
    }
    case "previous": {
      const nextState = reducer(
        { ...state, stops: stops.slice().reverse() },
        { type: "next" }
      );
      return {
        ...state,
        currentId: nextState.currentId,
        pastId: nextState.pastId
      };
    }
    case "first": {
      const stop = stops[0];
      return reducer(state, { type: "move", id: stop && stop.id });
    }
    case "last": {
      const stop = stops[stops.length - 1];
      return reducer(state, { type: "move", id: stop && stop.id });
    }
    case "reset": {
      return {
        ...state,
        currentId: null,
        pastId: null
      };
    }
    case "orientate":
      return { ...state, orientation: action.orientation };
    default:
      throw new Error();
  }
}

export function useRoverState(
  initialState: SealedInitialState<unstable_RoverInitialState> = {}
): unstable_RoverStateReturn {
  const { currentId = null, loop = false, ...sealed } = useSealedState(
    initialState
  );
  const [state, dispatch] = React.useReducer(reducer, {
    ...sealed,
    stops: [],
    currentId,
    pastId: null,
    loop
  });

  return {
    ...state,
    register: React.useCallback(
      (id, ref) => dispatch({ type: "register", id, ref }),
      []
    ),
    unregister: React.useCallback(
      id => dispatch({ type: "unregister", id }),
      []
    ),
    move: React.useCallback(id => dispatch({ type: "move", id }), []),
    next: React.useCallback(() => dispatch({ type: "next" }), []),
    previous: React.useCallback(() => dispatch({ type: "previous" }), []),
    first: React.useCallback(() => dispatch({ type: "first" }), []),
    last: React.useCallback(() => dispatch({ type: "last" }), []),
    reset: React.useCallback(() => dispatch({ type: "reset" }), []),
    orientate: React.useCallback(
      o => dispatch({ type: "orientate", orientation: o }),
      []
    )
  };
}

const keys: Array<keyof unstable_RoverStateReturn> = [
  "orientation",
  "stops",
  "currentId",
  "pastId",
  "loop",
  "register",
  "unregister",
  "move",
  "next",
  "previous",
  "first",
  "last",
  "reset",
  "orientate"
];

useRoverState.keys = keys;
