import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  unstable_IdState,
  unstable_IdActions,
  unstable_IdInitialState,
  unstable_useIdState,
  unstable_IdStateReturn
} from "../Id/IdState";

type Stop = {
  id: string;
  ref: React.RefObject<HTMLElement>;
  rowId?: string;
  disabled?: boolean;
};

type Row = {
  id: string;
  ref: React.RefObject<HTMLElement>;
};

export type unstable_CompositeState = unstable_IdState & {
  /**
   * TODO
   */
  unstable_focusStrategy: "roving-tabindex" | "aria-activedescendant";
  /**
   * Defines the orientation of the composite.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * TODO.
   */
  compositeRef: React.MutableRefObject<HTMLElement | undefined>;
  /**
   * A list of stops.
   */
  stops: Stop[];
  /**
   * A list rows.
   */
  rows: Row[];
  /**
   * The current focused stop ID.
   */
  currentId: string | null;
  /**
   * If enabled, moving to the next stop from the last one will focus the first
   * stop and vice-versa. It doesn't work if this is a two-dimensional
   * composite (with rows and cells).
   */
  loop: boolean;
  /**
   * If enabled, moving to the next stop from the last one in a row or column
   * will focus the first stop in the next row or column and vice-versa. If
   * this is going to wrap rows, columns or both, it depends on the value of
   * `orientation`:
   *
   *   - If `undefined`, it wraps both.
   *   - If `horizontal`, it wraps rows only.
   *   - If `vertical`, it wraps columns only.
   *
   * `wrap` only works if this is a two-dimensional composite (with rows and
   * cells).
   */
  wrap: boolean;
  /**
   * Stores the number of moves that have been made by calling `move`, `next`,
   * `previous`, `up`, `down`, `first` or `last`.
   */
  unstable_moves: number;
  /**
   * The last focused element ID.
   * @private
   */
  unstable_pastId: string | null;
};

export type unstable_CompositeActions = unstable_IdActions & {
  /**
   * TODO
   */
  registerStop: (stop: Stop) => void;
  /**
   * TODO
   */
  unregisterStop: (id: string) => void;
  /**
   * TODO
   */
  registerRow: (row: Row) => void;
  /**
   * TODO
   */
  unregisterRow: (id: string) => void;
  /**
   * Moves focus to a given element ID.
   */
  move: (id: string | null) => void;
  /**
   * Moves focus to the next element.
   */
  next: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the previous element.
   */
  previous: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the element above.
   */
  up: (unstable_allTheWayInRow?: boolean) => void;
  /**
   * Moves focus to the element below.
   */
  down: (unstable_allTheWayInRow?: boolean) => void;
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
   * TODO
   */
  unstable_setFocusStrategy: React.Dispatch<
    unstable_CompositeState["unstable_focusStrategy"]
  >;
  /**
   * TODO
   */
  setOrientation: React.Dispatch<unstable_CompositeState["orientation"]>;
  /**
   * TODO
   */
  setCurrentId: React.Dispatch<unstable_CompositeState["currentId"]>;
  /**
   * TODO
   */
  setLoop: React.Dispatch<unstable_CompositeState["loop"]>;
  /**
   * TODO
   */
  setWrap: React.Dispatch<unstable_CompositeState["wrap"]>;
};

export type unstable_CompositeInitialState = unstable_IdInitialState &
  Partial<
    Pick<
      unstable_CompositeState,
      "unstable_focusStrategy" | "orientation" | "currentId" | "loop" | "wrap"
    >
  >;

export type unstable_CompositeStateReturn = unstable_IdStateReturn &
  unstable_CompositeState &
  unstable_CompositeActions;

type CompositeReducerAction =
  | { type: "registerStop"; stop: Stop }
  | { type: "unregisterStop"; id: string | null }
  | { type: "registerRow"; row: Row }
  | { type: "unregisterRow"; id: string | null }
  | { type: "move"; id?: string | null }
  | { type: "next"; allTheWayInRow?: boolean }
  | { type: "previous"; allTheWayInRow?: boolean }
  | { type: "up"; allTheWayInRow?: boolean }
  | { type: "down"; allTheWayInRow?: boolean }
  | { type: "first" }
  | { type: "last" }
  | { type: "reset" }
  | {
      type: "unstable_setFocusStrategy";
      unstable_focusStrategy: unstable_CompositeState["unstable_focusStrategy"];
    }
  | {
      type: "setOrientation";
      orientation?: unstable_CompositeState["orientation"];
    }
  | { type: "setCurrentId"; currentId: unstable_CompositeState["currentId"] }
  | { type: "setLoop"; loop: unstable_CompositeState["loop"] }
  | { type: "setWrap"; wrap: unstable_CompositeState["wrap"] };

type CompositeReducerState = Omit<
  unstable_CompositeState,
  "compositeRef" | keyof unstable_IdState
>;

function groupByRow(stops: Stop[]) {
  const rows = [[]] as Stop[][];

  for (const stop of stops) {
    const lastRow = rows[rows.length - 1];
    if (lastRow[0]?.rowId === stop.rowId) {
      lastRow.push(stop);
    } else {
      rows.push([stop]);
    }
  }

  return rows;
}

function verticalizeStops(stops: Stop[]) {
  const rows = [[]] as Stop[][];
  let maxLength = 0;

  for (const stop of stops) {
    const lastRow = rows[rows.length - 1];
    if (lastRow[0]?.rowId === stop.rowId) {
      lastRow.push(stop);
    } else {
      if (lastRow.length > maxLength) {
        maxLength = lastRow.length;
      }
      rows.push([stop]);
    }
  }
  const verticalized = [] as Stop[];

  for (let i = 0; i < maxLength; i += 1) {
    for (const row of rows) {
      if (row[i]) {
        verticalized.push(row[i]);
      }
    }
  }

  return verticalized;
}

function findDOMIndex(stops: Stop[], stop: Stop) {
  return stops.findIndex(currentStop => {
    if (!currentStop.ref.current || !stop.ref.current) {
      return false;
    }
    // Returns true if the new stop is located earlier in the DOM compared
    // to the current stop in the iteration.
    return Boolean(
      currentStop.ref.current.compareDocumentPosition(stop.ref.current) &
        Node.DOCUMENT_POSITION_PRECEDING
    );
  });
}

function reducer(
  state: CompositeReducerState,
  action: CompositeReducerAction
): CompositeReducerState {
  const {
    orientation,
    stops,
    rows,
    currentId,
    unstable_pastId: pastId,
    unstable_moves: moves,
    loop,
    wrap
  } = state;

  switch (action.type) {
    case "registerRow": {
      const { row } = action;
      if (rows.length === 0) {
        return { ...state, rows: [row] };
      }
      if (rows.some(r => r.id === row.id)) {
        return state;
      }
      const rowIndex = findDOMIndex(rows, row);
      if (rowIndex === -1) {
        return { ...state, rows: [...rows, row] };
      }
      const nextRows = [
        ...rows.slice(0, rowIndex),
        row,
        ...rows.slice(rowIndex)
      ];
      return { ...state, rows: nextRows };
    }
    case "unregisterRow": {
      const { id } = action;
      const nextRows = rows.filter(row => row.id !== id);
      if (nextRows.length === rows.length) {
        return state;
      }
      return { ...state, rows: nextRows };
    }
    case "registerStop": {
      const { stop } = action;
      const row = rows.find(r => r.ref.current?.contains(stop.ref.current));
      const nextStop = { ...stop, rowId: row?.id };
      if (stops.length === 0) {
        return { ...state, stops: [nextStop] };
      }
      if (stops.some(i => i.id === nextStop.id)) {
        return state;
      }
      const stopIndex = findDOMIndex(stops, nextStop);
      if (stopIndex === -1) {
        return { ...state, stops: [...stops, nextStop] };
      }
      const nextStops = [
        ...stops.slice(0, stopIndex),
        nextStop,
        ...stops.slice(stopIndex)
      ];
      return { ...state, stops: nextStops };
    }
    case "unregisterStop": {
      const { id } = action;
      const nextStops = stops.filter(stop => stop.id === id);
      if (nextStops.length === stops.length) {
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
      const nextMoves = moves + 1;

      if (id === null) {
        return {
          ...state,
          currentId: null,
          unstable_pastId: currentId,
          unstable_moves: nextMoves
        };
      }

      if (id === undefined) {
        return state;
      }

      const index = stops.findIndex(stop => stop.id === id && !stop.disabled);

      // Stop doesn't exist or is disabled, so we don't count a move
      if (index === -1) {
        return state;
      }

      if (stops[index].id === currentId) {
        return { ...state, unstable_moves: nextMoves };
      }

      return {
        ...state,
        currentId: stops[index].id,
        unstable_pastId: currentId,
        unstable_moves: nextMoves
      };
    }
    case "next": {
      if (currentId == null) {
        return reducer(state, { type: "first" });
      }
      const { allTheWayInRow } = action;
      const currentStop = stops.find(stop => stop.id === currentId)!;
      const currentIndex = stops.indexOf(currentStop);
      const nextStops = stops.slice(currentIndex + 1);
      const nextStopsInRow = nextStops.filter(
        stop => stop.rowId === currentStop.rowId
      );

      if (allTheWayInRow) {
        const reverseNextStopsInRow = nextStopsInRow.slice().reverse();
        const nextStop = reverseNextStopsInRow.find(stop => !stop.disabled);
        return reducer(state, { type: "move", id: nextStop?.id });
      }

      if (
        currentStop.rowId &&
        wrap &&
        (!orientation || orientation === "horizontal")
      ) {
        const nextStop = nextStops.find(stop => !stop.disabled);
        return reducer(state, { type: "move", id: nextStop?.id });
      }

      if (!currentStop.rowId && loop) {
        // Turns [0, currentId, 2, 3] into [2, 3, 0]
        const reorderedStops = [
          ...stops.slice(currentIndex + 1),
          ...stops.slice(0, currentIndex)
        ];
        const nextStop = reorderedStops.find(stop => !stop.disabled);
        return reducer(state, { type: "move", id: nextStop?.id });
      }

      const nextStop = nextStopsInRow.find(stop => !stop.disabled);
      return reducer(state, { type: "move", id: nextStop?.id });
    }
    case "previous": {
      const { stops: _, ...nextState } = reducer(
        { ...state, stops: stops.slice().reverse() },
        { ...action, type: "next" }
      );
      return { ...state, ...nextState };
    }
    case "down": {
      if (currentId == null) {
        return reducer(state, { type: "first" });
      }
      const { allTheWayInRow } = action;
      const verticalized = verticalizeStops(stops);
      const currentStop = verticalized.find(stop => stop.id === currentId)!;
      const currentIndex = verticalized.indexOf(currentStop);
      const nextStops = verticalized.slice(currentIndex + 1);
      let index = -1;
      const nextStopsInColumn = groupByRow(stops).reduce((arr, curr) => {
        const idx = curr.findIndex(s => s.id === currentId);
        if (curr[index]) {
          arr.push(curr[index]);
        }
        if (idx >= 0) {
          index = idx;
        }
        return arr;
      }, [] as Stop[]);

      if (allTheWayInRow) {
        const reverseNextStopsInRow = nextStopsInColumn.slice().reverse();
        const nextStop = reverseNextStopsInRow.find(stop => !stop.disabled);
        return reducer(state, { type: "move", id: nextStop?.id });
      }

      if (
        currentStop.rowId &&
        wrap &&
        (!orientation || orientation === "vertical")
      ) {
        const nextStop = nextStops.find(stop => !stop.disabled);
        return reducer(state, { type: "move", id: nextStop?.id });
      }

      if (!currentStop.rowId && loop) {
        // Turns [0, currentId, 2, 3] into [2, 3, 0]
        const reorderedStops = [
          ...verticalized.slice(currentIndex + 1),
          ...verticalized.slice(0, currentIndex)
        ];
        const nextStop = reorderedStops.find(stop => !stop.disabled);
        return reducer(state, { type: "move", id: nextStop?.id });
      }

      const nextStop = nextStopsInColumn.find(stop => !stop.disabled);
      return reducer(state, { type: "move", id: nextStop?.id });
    }
    case "up": {
      const { stops: _, ...nextState } = reducer(
        { ...state, stops: stops.slice().reverse() },
        { ...action, type: "down" }
      );
      return { ...state, ...nextState };
    }
    case "first": {
      const firstStop = stops.find(stop => !stop.disabled);
      return reducer(state, { type: "move", id: firstStop?.id });
    }
    case "last": {
      const { stops: _, ...nextState } = reducer(
        { ...state, stops: stops.slice().reverse() },
        { ...action, type: "first" }
      );
      return { ...state, ...nextState };
    }
    case "reset": {
      return {
        ...state,
        currentId: null,
        unstable_pastId: null
      };
    }
    case "unstable_setFocusStrategy":
      return {
        ...state,
        unstable_focusStrategy: action.unstable_focusStrategy
      };
    case "setOrientation":
      return { ...state, orientation: action.orientation };
    case "setCurrentId":
      return { ...state, currentId: action.currentId };
    case "setLoop":
      return { ...state, loop: action.loop };
    case "setWrap":
      return { ...state, wrap: action.wrap };
    default:
      throw new Error();
  }
}

export function unstable_useCompositeState(
  initialState: SealedInitialState<unstable_CompositeInitialState> = {}
): unstable_CompositeStateReturn {
  const {
    orientation,
    unstable_focusStrategy = "roving-tabindex",
    currentId = null,
    loop = false,
    wrap = false,
    ...sealed
  } = useSealedState(initialState);
  const [state, dispatch] = React.useReducer(reducer, {
    unstable_focusStrategy,
    orientation,
    stops: [],
    rows: [],
    currentId,
    loop,
    wrap,
    unstable_moves: 0,
    unstable_pastId: null
  });
  const compositeRef = React.useRef<HTMLElement>();
  const idState = unstable_useIdState(sealed);

  return {
    ...idState,
    ...state,
    compositeRef,
    registerStop: React.useCallback(
      stop => dispatch({ type: "registerStop", stop }),
      []
    ),
    unregisterStop: React.useCallback(
      id => dispatch({ type: "unregisterStop", id }),
      []
    ),
    registerRow: React.useCallback(
      row => dispatch({ type: "registerRow", row }),
      []
    ),
    unregisterRow: React.useCallback(
      id => dispatch({ type: "unregisterRow", id }),
      []
    ),
    move: React.useCallback(id => dispatch({ type: "move", id }), []),
    next: React.useCallback(
      allTheWayInRow => dispatch({ type: "next", allTheWayInRow }),
      []
    ),
    previous: React.useCallback(
      allTheWayInRow => dispatch({ type: "previous", allTheWayInRow }),
      []
    ),
    up: React.useCallback(
      allTheWayInRow => dispatch({ type: "up", allTheWayInRow }),
      []
    ),
    down: React.useCallback(
      allTheWayInRow => dispatch({ type: "down", allTheWayInRow }),
      []
    ),
    first: React.useCallback(() => dispatch({ type: "first" }), []),
    last: React.useCallback(() => dispatch({ type: "last" }), []),
    unstable_reset: React.useCallback(() => dispatch({ type: "reset" }), []),
    unstable_setFocusStrategy: React.useCallback(
      a =>
        dispatch({
          type: "unstable_setFocusStrategy",
          unstable_focusStrategy: a
        }),
      []
    ),
    setOrientation: React.useCallback(
      o => dispatch({ type: "setOrientation", orientation: o }),
      []
    ),
    setCurrentId: React.useCallback(
      c => dispatch({ type: "setCurrentId", currentId: c }),
      []
    ),
    setLoop: React.useCallback(l => dispatch({ type: "setLoop", loop: l }), []),
    setWrap: React.useCallback(w => dispatch({ type: "setWrap", wrap: w }), [])
  };
}

const keys: Array<keyof unstable_CompositeStateReturn> = [
  ...unstable_useIdState.__keys,
  "unstable_focusStrategy",
  "orientation",
  "compositeRef",
  "stops",
  "rows",
  "currentId",
  "loop",
  "wrap",
  "unstable_moves",
  "unstable_pastId",
  "registerStop",
  "unregisterStop",
  "registerRow",
  "unregisterRow",
  "move",
  "next",
  "previous",
  "up",
  "down",
  "first",
  "last",
  "unstable_reset",
  "unstable_setFocusStrategy",
  "setOrientation",
  "setCurrentId",
  "setLoop",
  "setWrap"
];

unstable_useCompositeState.__keys = keys;
