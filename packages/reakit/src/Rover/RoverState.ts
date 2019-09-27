// Credits: https://github.com/stevejay/react-roving-tabindex
import * as React from "react";
import { warning } from "reakit-utils/warning";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";

type Stop = {
  id: string;
  ref: React.RefObject<HTMLElement>;
};

export type RoverState = {
  /**
   * Defines the orientation of the rover list.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * A list of element refs and IDs of the roving items.
   */
  stops: Stop[];
  /**
   * The current focused element ID.
   */
  currentId: Stop["id"] | null;
  /**
   * The last focused element ID.
   * @private
   */
  unstable_pastId: Stop["id"] | null;
  /**
   * Stores the number of moves that have been made by calling `move`, `next`,
   * `previous`, `first` or `last`.
   */
  unstable_moves: number;
  /**
   * If enabled:
   *  - Jumps to the first item when moving next from the last item.
   *  - Jumps to the last item when moving previous from the first item.
   */
  loop: boolean;
};

export type RoverActions = {
  /**
   * Registers the element ID and ref in the roving tab index list.
   */
  register: (id: Stop["id"], ref: Stop["ref"]) => void;
  /**
   * Unregisters the roving item.
   */
  unregister: (id: Stop["id"]) => void;
  /**
   * Moves focus to a given element ID.
   */
  move: (id: Stop["id"] | null) => void;
  /**
   * Moves focus to the next element.
   */
  next: () => void;
  /**
   * Moves focus to the previous element.
   */
  previous: () => void;
  /**
   * Moves focus to the first element.
   */
  first: () => void;
  /**
   * Moves focus to the last element.
   */
  last: () => void;
  /**
   * Resets `currentId` and `pastId` states.
   * @private
   */
  unstable_reset: () => void;
  /**
   * Changes the `orientation` state of the roving tab index list.
   * @private
   */
  unstable_orientate: (orientation: RoverState["orientation"]) => void;
};

export type RoverInitialState = Partial<
  Pick<RoverState, "orientation" | "currentId" | "loop">
>;

export type RoverStateReturn = RoverState & RoverActions;

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
      orientation?: RoverState["orientation"];
    };

function reducer(state: RoverState, action: RoverAction): RoverState {
  const {
    stops,
    currentId,
    unstable_pastId: pastId,
    unstable_moves: moves,
    loop
  } = state;

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
        warning(true, "RoverState", `${id} stop is not registered`);
        return state;
      }

      return {
        ...state,
        stops: nextStops,
        unstable_pastId: pastId && pastId === id ? null : pastId,
        currentId: currentId && currentId === id ? null : currentId
      };
    }
    case "move": {
      const { id } = action;

      if (id === null) {
        return {
          ...state,
          currentId: null,
          unstable_pastId: currentId,
          unstable_moves: moves + 1
        };
      }

      const index = stops.findIndex(stop => stop.id === id);

      // Item doesn't exist, so we don't count a move
      if (index === -1) {
        return state;
      }

      if (stops[index].id === currentId) {
        return { ...state, unstable_moves: moves + 1 };
      }

      return {
        ...state,
        currentId: stops[index].id,
        unstable_pastId: currentId,
        unstable_moves: moves + 1
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
      const { stops: _, ...nextState } = reducer(
        { ...state, stops: stops.slice().reverse() },
        { type: "next" }
      );
      return {
        ...state,
        ...nextState
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
        unstable_pastId: null
      };
    }
    case "orientate":
      return { ...state, orientation: action.orientation };
    default:
      throw new Error();
  }
}

export function useRoverState(
  initialState: SealedInitialState<RoverInitialState> = {}
): RoverStateReturn {
  const { orientation, currentId = null, loop = false } = useSealedState(
    initialState
  );
  const [state, dispatch] = React.useReducer(reducer, {
    orientation,
    stops: [],
    currentId,
    unstable_pastId: null,
    unstable_moves: 0,
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
    unstable_reset: React.useCallback(() => dispatch({ type: "reset" }), []),
    unstable_orientate: React.useCallback(
      o => dispatch({ type: "orientate", orientation: o }),
      []
    )
  };
}

const keys: Array<keyof RoverStateReturn> = [
  "orientation",
  "stops",
  "currentId",
  "unstable_pastId",
  "unstable_moves",
  "loop",
  "register",
  "unregister",
  "move",
  "next",
  "previous",
  "first",
  "last",
  "unstable_reset",
  "unstable_orientate"
];

useRoverState.__keys = keys;
